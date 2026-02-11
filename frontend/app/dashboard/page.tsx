'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { api, DataSource } from '@/lib/api';
import { Plus, MessageSquare, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    api_url: '',
    api_key: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDataSources();
    }
  }, [user]);

  const loadDataSources = async () => {
    try {
      const sources = await api.getDataSources();
      setDataSources(sources);
    } catch (error) {
      toast.error('Failed to load data sources');
    } finally {
      setLoadingSources(false);
    }
  };

  const handleAddSource = async () => {
    if (!formData.name || !formData.api_url) {
      toast.error('Name and API URL are required');
      return;
    }

    try {
      const newSource = await api.createDataSource({
        name: formData.name,
        api_url: formData.api_url,
        api_key: formData.api_key || undefined,
      });

      setDataSources([newSource, ...dataSources]);
      setShowAddDialog(false);
      setFormData({ name: '', api_url: '', api_key: '' });
      toast.success('Data source added successfully');

      toast.info('Syncing data source...');
      await handleSync(newSource.id);
    } catch (error) {
      toast.error('Failed to add data source');
    }
  };

  const handleSync = async (id: number) => {
    setSyncing(id);
    try {
      const result = await api.syncDataSource(id);
      toast.success(`Synced ${result.indexed_count} items`);
      loadDataSources();
    } catch (error) {
      toast.error('Failed to sync data source');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this data source?')) {
      return;
    }

    try {
      await api.deleteDataSource(id);
      setDataSources(dataSources.filter((s) => s.id !== id));
      toast.success('Data source deleted');
    } catch (error) {
      toast.error('Failed to delete data source');
    }
  };

  const handleChat = (id: number) => {
    router.push(`/chat/${id}`);
  };

  if (loading || loadingSources) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Data Sources</h1>
            <p className="text-muted-foreground mt-1">
              Manage your API data sources and knowledge bases
            </p>
          </div>

          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Data Source
          </Button>
        </div>

        {dataSources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No data sources yet. Add your first one to get started.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Data Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{source.name}</CardTitle>
                  <CardDescription className="truncate">
                    {source.api_url}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {source.last_synced
                      ? `Last synced: ${new Date(source.last_synced).toLocaleString()}`
                      : 'Not synced yet'}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleChat(source.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(source.id)}
                      disabled={syncing === source.id}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${syncing === source.id ? 'animate-spin' : ''}`}
                      />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Data Source</DialogTitle>
            <DialogDescription>
              Connect a new API endpoint to your knowledge base
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My API"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                placeholder="https://api.example.com/data"
                value={formData.api_url}
                onChange={(e) =>
                  setFormData({ ...formData, api_url: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="api_key">API Key (Optional)</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Optional authentication key"
                value={formData.api_key}
                onChange={(e) =>
                  setFormData({ ...formData, api_key: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSource}>Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
