import { NextResponse } from 'next/server';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable');
}

export async function POST(request: Request) {
  try {
    const { prompt, image } = await request.json();
    console.log('Received request:', { prompt, image: image ? 'data:image/...' : 'none' });

    if (image) {
      console.log('===== 图片调试信息 =====');
      console.log('图片数据长度:', image.length);
      console.log('图片数据类型:', typeof image);
      console.log('图片数据前缀:', image.substring(0, 100));
      console.log('图片MIME类型:', image.split(';')[0].split(':')[1]);
      
      // 验证图片大小
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (image.length > MAX_SIZE) {
        console.log('图片太大:', image.length, '字节');
        return NextResponse.json({ 
          error: '图片太大了喵~',
          details: '请确保图片小于10MB'
        }, { status: 400 });
      }

      if (!image.startsWith('data:image/')) {
        console.log('图片格式错误：不是合法的 data URI');
        return NextResponse.json({ 
          error: '图片格式不正确喵~',
          details: '请确保图片是正确的 base64 格式'
        }, { status: 400 });
      }

      try {
        const base64Data = image.split(',')[1];
        atob(base64Data);
      } catch (e) {
        console.log('Base64 解码失败:', e);
        return NextResponse.json({ 
          error: '图片编码有误喵~',
          details: '无法解码图片数据'
        }, { status: 400 });
      }
    }

    const headers = {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // 如果有图片，使用 vision 模型
    if (image) {
      console.log('Using vision model');
      
      // 确保图片是 base64 格式
      const base64Image = image.startsWith('data:image') 
        ? image 
        : `data:image/jpeg;base64,${image}`;
      
      // 验证图片格式是否支持
      const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
      const format = base64Image.split(';')[0].split('/')[1];
      if (!supportedFormats.includes(format)) {
        console.log('不支持的图片格式:', format);
        return NextResponse.json({ 
          error: '不支持的图片格式喵~',
          details: `只支持 ${supportedFormats.join(', ')} 格式`
        }, { status: 400 });
      }

      console.log('===== API请求信息 =====');
      interface MessageContent {
        type: string;
        text?: string;
        image?: string;
      }

      interface Message {
        role: string;
        content: string | MessageContent[];
      }

      // 从base64数据中提取实际的图片数据（去掉前缀）
      const base64Data = base64Image.split(',')[1];
      
      const requestBody = {
        model: "deepseek-vision",
        messages: [
          {
            role: "system",
            content: "你是一个有用的助手，名字叫喵哥。请用友好、活泼的语气回答问题，每句话结尾都要加上'喵~'"
          },
          {
            role: "user",
            content: {
              text: prompt || "这是什么图片？请详细描述一下喵~",
              image: base64Image.split(',')[1]
            }
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      };
      
      try {
        console.log('发送API请求...');
        // 打印请求体，但隐藏图片数据
        const debugRequestBody = {
          ...requestBody,
          messages: requestBody.messages.map(msg => ({
            ...msg,
            content: typeof msg.content === 'object'
              ? { ...msg.content, image: '[BASE64_IMAGE]' }
              : msg.content
          }))
        };
        console.log('请求体结构:', JSON.stringify(debugRequestBody, null, 2));

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        const responseText = await response.text();
        console.log('API 原始响应:', responseText);

        if (!response.ok) {
          console.error('Vision API 详细错误:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText
          });
          
          // 针对特定错误码给出友好提示
          if (response.status === 413) {
            return NextResponse.json({ 
              error: '图片太大了喵~',
              details: '请压缩图片后重试'
            }, { status: 413 });
          } else if (response.status === 429) {
            return NextResponse.json({ 
              error: '请求太频繁了喵~',
              details: '请稍后再试'
            }, { status: 429 });
          } else if (response.status === 404) {
            return NextResponse.json({ 
              error: 'API版本不正确喵~',
              details: '请联系开发者更新API版本'
            }, { status: 404 });
          }
          
          throw new Error(`Vision API error: ${responseText}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('JSON解析失败:', e);
          throw new Error('API返回的数据格式不正确');
        }

        console.log('Vision API 响应:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data: data
        });
        
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('API响应格式异常');
        }

        return NextResponse.json({ content: data.choices[0].message.content });
      } catch (error) {
        console.error('Vision API 调用失败:', error);
        throw error; // 让外层错误处理来处理
      }
    }

    // 如果没有图片，使用普通对话模型
    console.log('Using chat model');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: "deepseek-chat",
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
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Chat API error:', error);
      throw new Error(`Chat API error: ${error}`);
    }

    const data = await response.json();
    console.log('Chat model response:', data);
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return NextResponse.json({ 
      error: '喵呜~ 本喵遇到了一点小问题，让我休息一下再试试吧！',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 