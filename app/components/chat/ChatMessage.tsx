import { cn } from '@/app/lib/utils';
import { Message } from '@/app/types/chat';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingDots from '../LoadingDots';

interface Props {
  message: Message;
  isLoading?: boolean;
}

export default function ChatMessage({ message, isLoading }: Props) {
  return (
    <div
      className={cn(
        'flex w-full items-start gap-4 px-4 py-8',
        message.role === 'assistant' ? 'bg-gray-50/10' : ''
      )}
    >
      {message.role === 'assistant' ? (
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src="/cat-avatar.png"
            width={40}
            height={40}
            alt="Assistant"
            className="rounded-full"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
          <UserIcon className="h-6 w-6 text-gray-500" />
        </div>
      )}
      <div className="flex-1">
        {isLoading ? (
          <LoadingDots />
        ) : (
          <ReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
} 