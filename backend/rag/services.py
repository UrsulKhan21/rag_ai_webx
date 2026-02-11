import requests
from uuid import uuid5, NAMESPACE_URL
from django.conf import settings
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from openai import OpenAI


class EmbeddingService:
    def __init__(self):
        self.embedder = SentenceTransformer(settings.EMBED_MODEL_NAME)
        self.qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )

    def _ensure_collection(self, collection_name: str):
        try:
            self.qdrant_client.get_collection(collection_name)
        except Exception:
            self.qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=settings.EMBED_DIM,
                    distance=Distance.COSINE,
                ),
            )

    def _fetch_api_data(self, api_url: str, api_key: str = None):
        headers = {}
        if api_key:
            headers['Authorization'] = f'Bearer {api_key}'

        response = requests.get(api_url, headers=headers, timeout=30)
        response.raise_for_status()

        data = response.json()

        if isinstance(data, dict) and 'products' in data:
            return data['products']
        elif isinstance(data, list):
            return data
        else:
            return [data]

    def _normalize_item(self, item: dict, index: int) -> str:
        if 'title' in item and 'description' in item:
            return (
                f"Product: {item.get('title', 'N/A')}\n"
                f"Brand: {item.get('brand', 'N/A')}\n"
                f"Category: {item.get('category', 'N/A')}\n"
                f"Description: {item.get('description', 'N/A')}\n"
                f"Price: {item.get('price', 'N/A')}"
            )
        else:
            text_parts = []
            for key, value in item.items():
                if isinstance(value, (str, int, float)):
                    text_parts.append(f"{key}: {value}")
            return "\n".join(text_parts)

    def sync_datasource(self, datasource):
        collection_name = f"user_{datasource.user.id}_source_{datasource.id}"

        self._ensure_collection(collection_name)

        items = self._fetch_api_data(datasource.api_url, datasource.api_key)

        texts = []
        ids = []
        payloads = []

        for idx, item in enumerate(items):
            text = self._normalize_item(item, idx)
            texts.append(text)

            item_id = item.get('id', idx)
            stable_id = str(uuid5(NAMESPACE_URL, f"{datasource.id}:{item_id}"))
            ids.append(stable_id)

            payloads.append({
                'text': text,
                'datasource_id': datasource.id,
                'item_id': str(item_id),
            })

        vectors = self.embedder.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        points = [
            PointStruct(
                id=ids[i],
                vector=vectors[i].tolist(),
                payload=payloads[i],
            )
            for i in range(len(ids))
        ]

        self.qdrant_client.upsert(
            collection_name=collection_name,
            points=points,
        )

        return {
            'indexed_count': len(ids),
            'collection_name': collection_name,
        }

    def search(self, user_id: int, datasource_id: int, query: str, top_k: int = 5):
        collection_name = f"user_{user_id}_source_{datasource_id}"

        query_vector = self.embedder.encode(
            [query],
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )[0]

        results = self.qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_vector.tolist(),
            limit=top_k,
        )

        contexts = []
        sources = []

        for result in results:
            if result.payload and 'text' in result.payload:
                contexts.append(result.payload['text'])
                sources.append(result.payload.get('item_id', 'unknown'))

        return {
            'contexts': contexts,
            'sources': sources,
        }


class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )

    def query(self, user_id: int, datasource_id: int, question: str, top_k: int = 5):
        search_results = self.embedding_service.search(
            user_id=user_id,
            datasource_id=datasource_id,
            query=question,
            top_k=top_k
        )

        contexts = search_results['contexts']
        sources = search_results['sources']

        if not contexts:
            return {
                'answer': 'No relevant information found in the knowledge base.',
                'sources': [],
                'num_contexts': 0,
            }

        context_block = "\n\n".join(contexts)

        completion = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Answer ONLY using the provided context. "
                        "If the answer is not in the context, say you don't know."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context_block}\n\nQuestion: {question}",
                },
            ],
            temperature=0.2,
            max_tokens=512,
        )

        answer = completion.choices[0].message.content.strip()

        return {
            'answer': answer,
            'sources': sources,
            'num_contexts': len(contexts),
        }
