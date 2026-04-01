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
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { Fingerprint } from 'lucide-react';

const roleRedirects: Record<AdminRole, string> = {
  SHOP_ADMIN: '/shop-admin/dashboard',
  MAIN_ADMIN: '/admin/dashboard',
};

const BIOMETRIC_PASS_KEY = 'fadebook_bp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // After password login succeeds, show the "enable biometrics" prompt
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);

  const { login, isLoading, error, resetError, user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supported, hasCredential, savedEmail, register, authenticate, clear } = useWebAuthn();

  useEffect(() => {
    if (user && !showBiometricSetup) {
      navigate(roleRedirects[user.role], { replace: true });
    }
  }, [user, navigate, showBiometricSetup]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error,
        action: <ToastAction altText="Try again" onClick={resetError}>Try again</ToastAction>,
      });
    }
  }, [error, toast, resetError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // If biometrics supported but not yet set up, pause navigation and ask user
      if (supported && !hasCredential) {
        setShowBiometricSetup(true);
      }
      // otherwise useEffect handles navigation
    } catch {
      // handled by store
    }
  };

  const handleEnableBiometrics = async () => {
    const ok = await register(email);
    if (ok) {
      localStorage.setItem(BIOMETRIC_PASS_KEY, btoa(password));
      toast({ title: 'Face ID / Touch ID enabled', description: 'You can now sign in with biometrics.' });
    } else {
      toast({ variant: 'destructive', title: 'Setup failed', description: 'Could not enable biometrics. Try again later.' });
    }
    setShowBiometricSetup(false);
    navigate(roleRedirects[user!.role], { replace: true });
  };

  const handleSkipBiometrics = () => {
    setShowBiometricSetup(false);
    navigate(roleRedirects[user!.role], { replace: true });
  };

  const handleBiometricLogin = async () => {
    const verified = await authenticate();
    if (!verified) {
      toast({ variant: 'destructive', title: 'Authentication failed', description: 'Biometric verification failed or was cancelled.' });
      return;
    }
    const storedPass = localStorage.getItem(BIOMETRIC_PASS_KEY);
    if (!savedEmail || !storedPass) {
      toast({ variant: 'destructive', title: 'Setup required', description: 'Please sign in with your password first.' });
      clear();
      return;
    }
    try {
      await login(savedEmail, atob(storedPass));
    } catch {
      // handled by store
    }
  };

  // --- Biometric setup screen shown after successful password login ---
  if (showBiometricSetup) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint size={32} className="text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Enable Face ID / Touch ID</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in faster next time using your device biometrics.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="hero" className="w-full" onClick={handleEnableBiometrics}>
              Enable Face ID / Touch ID
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleSkipBiometrics}>
              Not Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Normal login screen ---
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/"><Logo size="lg" /></Link>
          <p className="mt-4 text-muted-foreground">Sign in to your Admin Panel</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {/* Biometric login — shown when credential already registered */}
          {supported && hasCredential && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="hero"
                className="w-full gap-2"
                onClick={handleBiometricLogin}
                disabled={isLoading}
              >
                <Fingerprint size={16} />
                Sign in with Face ID / Touch ID
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or use password</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

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
            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {supported && hasCredential && (
          <p className="text-center text-xs text-muted-foreground">
            Biometrics saved for {savedEmail}.{' '}
            <button
              className="underline hover:text-foreground"
              onClick={() => { clear(); localStorage.removeItem(BIOMETRIC_PASS_KEY); }}
            >
              Remove
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
