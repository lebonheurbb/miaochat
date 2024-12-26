import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAmqhgZy28wBjtSujMM8fHc4dLEL4ivxhE';
// 使用Cloudflare Worker URL
const API_URL = process.env.GEMINI_PROXY_URL || 'https://你的worker地址.workers.dev';

console.log('初始化 Gemini API 路由...');

export async function POST(request: Request) {
  console.log('收到新的请求...');
  try {
    console.log('正在解析请求体...');
    const clonedRequest = request.clone();
    const { prompt } = await clonedRequest.json() as { prompt: string };
    console.log('收到的prompt:', prompt);
    
    if (!prompt) {
      console.log('prompt为空，返回错误');
      return NextResponse.json(
        { error: '消息不能为空喵~' },
        { status: 400 }
      )
    }

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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API 错误响应:', errorText);
      throw new Error(`API请求失败，状态码 ${response.status}: ${errorText}`);
    }

    console.log('解析响应数据...');
    const data = await response.json();
    console.log('Gemini API 响应:', JSON.stringify(data, null, 2));
    
    if (!data.predictions || data.predictions.length === 0) {
      console.error('API返回数据中没有预测结果');
      throw new Error('API没有返回答案');
    }

    console.log('成功获取回答，准备返回');
    return NextResponse.json({ message: data.predictions[0].content });

  } catch (error) {
    console.error('Gemini API 错误:', error);
    console.log('尝试使用 DeepSeek API 作为备选...');
    try {
      const { generateResponse } = await import('@/app/utils/deepseek');
      console.log('调用 DeepSeek API...');
      const response = await generateResponse(prompt as string);
      console.log('DeepSeek API 响应:', response);
      return NextResponse.json({ message: response });
    } catch (fallbackError) {
      console.error('DeepSeek API 错误:', fallbackError);
      return NextResponse.json(
        { error: '喵呜~ 出了点小问题，让我休息一下再试试吧！' },
        { status: 500 }
      );
    }
  }
} 