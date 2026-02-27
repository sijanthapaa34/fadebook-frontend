import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const PublicLayout = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 w-full z-50 transition-colors ${isLanding ? 'bg-background/60 backdrop-blur-lg' : 'bg-background border-b border-border'}`}>
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/register"><Button variant="hero" size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
