'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, DataSource, QueryResponse } from '@/lib/api';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const datasourceId = parseInt(params.id as string);

  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDataSource();
    }
  }, [user, datasourceId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDataSource = async () => {
    try {
      const sources = await api.getDataSources();
      const source = sources.find((s) => s.id === datasourceId);

      if (!source) {
        toast.error('Data source not found');
        router.push('/dashboard');
        return;
      }

      setDataSource(source);
    } catch (error) {
      toast.error('Failed to load data source');
      router.push('/dashboard');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isAsking) return;

    const question = input.trim();
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);

    try {
      const response: QueryResponse = await api.query(datasourceId, question);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get answer');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your question.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading || !dataSource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{dataSource.name}</h1>
            <p className="text-sm text-muted-foreground">{dataSource.api_url}</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Ask Questions</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Start a conversation by asking a question about your data</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs font-medium mb-1 opacity-70">Sources:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-background/50 px-2 py-1 rounded"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={isAsking}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isAsking || !input.trim()}>
                {isAsking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
