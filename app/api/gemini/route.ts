import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import { generateResponse } from '@/app/utils/deepseek'

type ChatRequest = {
  prompt: string;
};

export async function POST(request: Request) {
  console.log('收到新的请求...', new Date().toISOString());
  try {
    console.log('正在解析请求体...');
    const { prompt } = await request.json() as ChatRequest;
    console.log('收到的 prompt:', prompt);
    
    if (!prompt || typeof prompt !== 'string') {
      console.log('prompt为空或类型不正确，返回错误');
      return NextResponse.json(
        { error: '消息不能为空喵~' },
        { status: 400 }
      )
    }

    try {
      console.log('准备发送到Gemini API...');
      const requestBody = {
        instances: [{
          content: `你是一个有用的助手，名字叫喵哥。请用友好、活泼的语气回答以下问题，每句话结尾都要加上"喵~"：\n\n${prompt}`
        }],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.95
        }
      };

      console.log('发送请求到Gemini API代理...');
      const response = await fetch(process.env.GEMINI_PROXY_URL || 'https://你的worker地址.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY || 'AIzaSyAmqhgZy28wBjtSujMM8fHc4dLEL4ivxhE'}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Gemini API 响应状态:', response.status);
      if (!response.ok) {
        throw new Error(`API请求失败，状态码 ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API 响应数据:', JSON.stringify(data, null, 2));
      
      if (!data.predictions || data.predictions.length === 0) {
        throw new Error('API没有返回答案');
      }

      return NextResponse.json({ message: data.predictions[0].content });

    } catch (error) {
      console.error('Gemini API 错误:', error);
      console.log('尝试使用 DeepSeek API 作为备选...');
      
      const deepseekResponse = await generateResponse(prompt);
      console.log('DeepSeek API 响应:', deepseekResponse);
      
      if (!deepseekResponse) {
        throw new Error('DeepSeek API 返回为空');
      }
      
      return NextResponse.json({ message: deepseekResponse });
    }

  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: '喵呜~ 出了点小问题，让我休息一下再试试吧！' },
      { status: 500 }
    );
  }
} 