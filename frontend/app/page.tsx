'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Database, MessageSquare, Zap, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default function LandingPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (loading) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      const buttonDiv = document.getElementById('googleButton');
      if (buttonDiv) {
        window.google?.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [loading]);

  const handleGoogleLogin = async (response: any) => {
    try {
      await login(response.credential);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">RAG AI Agent</h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your APIs into intelligent knowledge bases. Connect any data source,
            let AI understand it, and get instant answers to your questions.
          </p>

          <div className="flex flex-col items-center gap-4 pt-4">
            <div id="googleButton" className="scale-110"></div>
            <p className="text-sm text-muted-foreground">
              Sign in with Google to get started
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Connect Any API</CardTitle>
              <CardDescription>
                Add your API endpoints with optional authentication. We support any REST API
                that returns JSON data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Indexing</CardTitle>
              <CardDescription>
                Your data is automatically processed, embedded using state-of-the-art models,
                and stored in a vector database.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Natural Conversations</CardTitle>
              <CardDescription>
                Ask questions in plain English and get accurate answers powered by LLaMA 3.3
                and your indexed data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Semantic search powered by Qdrant vector database delivers results in
                milliseconds, not seconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data sources are private to you. Each user has isolated knowledge bases
                with secure authentication.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Context-Aware</CardTitle>
              <CardDescription>
                Answers are generated only from your data sources, ensuring accuracy and
                relevance to your specific use case.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Create your account and connect your first data source in minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
