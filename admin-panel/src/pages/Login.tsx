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
  BARBERSHOP_ADMIN: '/shop-admin/dashboard',
  MAIN_ADMIN: '/admin/dashboard',
};

const demoRoles: { role: AdminRole; label: string; desc: string }[] = [
  { role: 'BARBERSHOP_ADMIN', label: 'Shop Admin', desc: 'Run your shop' },
  { role: 'MAIN_ADMIN', label: 'Platform Admin', desc: 'System overview' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginAs, isLoading, error, resetError, user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(roleRedirects[user.role], { replace: true });
    }
  }, [user, navigate]);

  // Show error toast if login fails
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
      // Navigation is handled by useEffect watching `user`
    } catch (err) {
      // Error is already handled in store and toast
    }
  };

  const handleDemoLogin = (role: AdminRole) => {
    loginAs(role);
    // Navigation handled by useEffect
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/"><Logo size="lg" /></Link>
          <p className="mt-4 text-muted-foreground">Sign in to your account</p>
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
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-3">
              {demoRoles.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleDemoLogin(d.role)}
                  className="p-4 rounded-lg border border-border bg-background/50 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <p className="text-sm font-medium text-foreground group-hover:text-primary">{d.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;