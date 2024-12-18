import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-c5f13a32204648e4b6993db1d666fd57',
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true
});

export async function generateResponse(prompt: string) {
  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个有用的助手，名字叫喵星人。" },
        { role: "user", content: prompt }
      ],
      stream: false
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
} 