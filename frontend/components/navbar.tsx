'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">RAG AI Agent</span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
