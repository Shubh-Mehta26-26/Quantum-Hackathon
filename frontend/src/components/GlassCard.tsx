import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: 'none' | 'cyan' | 'purple';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = 'none',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl p-6 transition-all duration-300',
        glow === 'none' && 'glass-panel',
        glow === 'cyan' && 'glass-panel-glow-cyan',
        glow === 'purple' && 'glass-panel-glow-purple',
        hoverEffect && 'hover:scale-[1.02] hover:border-slate-500/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
