import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

   const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.parts ? m.parts.map((p: any) => p.text).join('') : m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.parts
      ? lastMessage.parts.map((p: any) => p.text).join('')
      : lastMessage.content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(userText);

    // Stream the response back
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}