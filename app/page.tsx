'use client';
import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let agentReply = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        agentReply += decoder.decode(value);
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: agentReply }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-8 text-center">My Free AI Agent</h1>

      {messages.map((m, i) => (
        <div key={i} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'Agent: '}</strong>
          {m.content}
        </div>
      ))}

      {loading && <div className="text-gray-500 animate-pulse mb-4">Agent is typing...</div>}

      <div ref={messagesEndRef} />

      <form
        onSubmit={sendMessage}
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl bg-black flex gap-2"
      >
        <input
          className="w-full p-2 bg-transparent text-white outline-none"
          value={input}
          placeholder="Say hello to your new agent..."
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}