'use client';

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ImageIcon, SendIcon } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string, image?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    
    onSubmit(input, image || undefined);
    setInput('');
    setImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 bg-white border-t">
      {image && (
        <div className="relative w-32 h-32">
          <img src={image} alt="上传预览" className="w-full h-full object-cover rounded" />
          <button
            type="button"
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
            onClick={() => setImage(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 min-h-[50px] max-h-32"
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={disabled || (!input.trim() && !image)}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </form>
  );
} 