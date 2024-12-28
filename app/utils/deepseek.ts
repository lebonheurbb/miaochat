import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-c5f13a32204648e4b6993db1d666fd57',
  baseURL: 'https://api.deepseek.com/v3',
});

export async function generateResponse(prompt: string): Promise<string> {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-chat-v1-3",
      messages: [
        { 
          role: "system", 
          content: "你是一个有用的助手，名字叫喵哥。请用友好、活泼的语气回答问题，每句话结尾都要加上'喵~'"
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('DeepSeek API returned empty response');
    }
    return content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
} 