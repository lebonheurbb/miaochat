import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-c5f13a32204648e4b6993db1d666fd57';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

export async function POST(request: Request) {
  try {
    const { prompt, image, messages = [] } = await request.json();
    
    console.log('===== 请求信息 =====');
    console.log('收到请求:', { prompt, image, messages });

    if (!prompt) {
      return NextResponse.json(
        { error: '消息不能为空喵~' },
        { status: 400 }
      );
    }

    // 如果有图片，使用 Gemini Vision API
    if (image) {
      console.log('===== Gemini Vision API 调用 =====');
      try {
        const imageData = image.split(',')[1]; // 移除 data:image/jpeg;base64, 前缀
        console.log('图片数据长度:', imageData.length);
        
        const geminiRequestBody = {
          contents: [{
            parts: [
              {
                text: `你是一个有���的助手，名字叫喵哥。请用友好、活泼的语气回答问题，每句话结尾都要加上'喵~'。\n用户问题：${prompt}`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        };

        console.log('发送请求到 Gemini API...');
        console.log('请求体结构:', JSON.stringify(geminiRequestBody, null, 2));

        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geminiRequestBody)
        });

        console.log('Gemini API 响应状态:', geminiResponse.status, geminiResponse.statusText);
        const responseText = await geminiResponse.text();
        console.log('Gemini API 原始响应:', responseText);

        if (!geminiResponse.ok) {
          console.error('Gemini API 错误详情:', {
            status: geminiResponse.status,
            statusText: geminiResponse.statusText,
            headers: Object.fromEntries(geminiResponse.headers.entries()),
            body: responseText
          });
          throw new Error(`Gemini API error: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('Gemini API 解析后的响应:', JSON.stringify(data, null, 2));
        const content = data.candidates[0].content.parts[0].text;
        return NextResponse.json({ message: content });
      } catch (error) {
        console.error('Gemini Vision API 错误:', error);
        return NextResponse.json({ 
          message: "哎呀，我这边看不到图片呢，不过你可以描述一下图片的内容，我会尽力帮你解答的喵~",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // 如果没有图片，使用 DeepSeek Chat API
    console.log('===== DeepSeek Chat API 调用 =====');
    console.log('发送请求到 DeepSeek API...');

    // 构建历史消息，只保留最近的20条
    const historyMessages = messages
      .slice(-20)  // 只保留最近的20条消息
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));

    // 添加系统提示和当前用户消息
    const requestMessages = [
      {
        role: 'system',
        content: `你是一个名叫喵哥的AI助手，性格活泼可爱，说话方式像一只俏皮的猫咪。请注意：

1. 语气和个性：
- 用温暖友好的语气交谈
- 在每句话结尾加上"喵~"
- 适当使用可爱的语气词和表情
- 偶尔会用猫咪的视角来思考问题

2. 记忆和互动：
- 记住用户告诉过你的所有信息（名字、喜好等）
- 在对话中自然地引用之前的信息
- 对用户的情绪变化保持敏感和回应

3. 回答方式：
- 给出准确且有见地的回答
- 用简单易懂的方式解释复杂概念
- 在合适的时候提供额外的相关信息
- 主动询问用户的想法和感受

4. 特殊功能：
- 可以分析和描述图片内容
- 能够进行基础的数学计算
- 可以用markdown格式排版文本
- 支持中英文双语交流`
      },
      ...historyMessages,
      {
        role: 'user',
        content: prompt
      }
    ];

    const requestBody = {
      model: 'deepseek-chat',
      messages: requestMessages,
      temperature: 0.8,
      max_tokens: 2048
    };

    console.log('请求体结构:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('DeepSeek API 响应状态:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('DeepSeek API 原始响应:', responseText);

    if (!response.ok) {
      console.error('DeepSeek API 错误详情:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });
      throw new Error(`DeepSeek API error: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('DeepSeek API 解析后的响应:', JSON.stringify(data, null, 2));
    return NextResponse.json({ message: data.choices[0].message.content });

  } catch (error) {
    console.error('API 路由错误:', error);
    return NextResponse.json(
      { 
        error: '喵呜~ 本喵遇到了一点小���题，让我休息一下再试试吧！', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 