import { Scissors } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 18, text: 'text-lg' },
  md: { icon: 22, text: 'text-xl' },
  lg: { icon: 28, text: 'text-3xl' },
};

const Logo = ({ size = 'md' }: LogoProps) => {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <Scissors className="text-primary" size={s.icon} />
      <span className={`font-display font-bold tracking-tight ${s.text}`}>
        <span className="gold-text">Fade</span>
        <span className="text-foreground">Book</span>
      </span>
    </div>
  );
};

export default Logo;
