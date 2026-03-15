import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import type { AdminRole } from '@/models/models';
import { useToast } from '@/hooks/use-toast'; 
import { ToastAction } from '@/components/ui/toast';

const roleRedirects: Record<AdminRole, string> = {
  SHOP_ADMIN: '/shop-admin/dashboard',
  MAIN_ADMIN: '/admin/dashboard',
};

const Login = () => {
  // Pre-fill for easy testing (remove value="" for production)
  const [email, setEmail] = useState('admin@barberapp.com');
  const [password, setPassword] = useState('admin123');
  
  const { login, isLoading, error, resetError, user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(roleRedirects[user.role], { replace: true });
    }
  }, [user, navigate]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error,
        action: <ToastAction altText="Try again" onClick={resetError}>Try again</ToastAction>,
      });
    }
  }, [error, toast, resetError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch (err) {
      // Handled by store
    }
  };

  return (
    // Added fixed inset-0 to force full screen without layout wrappers
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/"><Logo size="lg" /></Link>
          <p className="mt-4 text-muted-foreground">Sign in to your Admin Panel</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@fadebook.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-muted/30 border-border focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-muted/30 border-border focus:border-primary" 
              />
            </div>
            {/* UPDATED: Added variant="hero" for gradient style */}
            <Button 
              type="submit" 
              variant="hero"
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;