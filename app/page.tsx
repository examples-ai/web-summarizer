'use client';

import { Globe, SearchIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { summarize } from './actions';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      const userMessage = input.trim();
      setInput('');

      // Add user message
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
      };
      setMessages((prev) => [...prev, userMsg]);

      // Call server action
      startTransition(async () => {
        const result = await summarize(userMessage);

        // Add assistant response
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.success ? result.text || '' : `Error: ${result.error}`,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  <Response>{message.content}</Response>
                </MessageContent>
              </Message>
            ))}
            {isPending && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
          <PromptInputToolbar className="justify-between">
            <PromptInputTools>
              <PromptInputButton>
                <Globe className="size-5" />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input || isPending}
              status={isPending ? 'submitted' : undefined}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
