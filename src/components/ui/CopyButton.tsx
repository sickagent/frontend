import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { IconButton } from './IconButton';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CopyButton({ text, size = 'md', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <IconButton onClick={copy} size={size} className={className} title="Copy">
      {copied
        ? <Check className={`${iconSize} text-emerald-400`} />
        : <Copy className={iconSize} />
      }
    </IconButton>
  );
}
