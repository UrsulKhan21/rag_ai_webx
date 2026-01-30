from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
# ---------------- FUNCTIONS ---------------- #
import torch
from sentence_transformers import SentenceTransformer

torch.set_num_threads(1)

embedder = SentenceTransformer(
    "all-MiniLM-L6-v2",
    device="cpu"
)

embedder.encode(["warmup"], show_progress_bar=False)


def load_and_chunk_pdf(path: str) -> list[str]:
    docs = PDFReader().load_data(file=path)
    texts = [d.text for d in docs if getattr(d, "text", None)]
    chunks = []
    for text in texts:
        chunks.extend(splitter.split_text(text))
    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = embedder.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return embeddings.tolist()
