// Gemini API 代理
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // API 端点列表
  const endpoints = [
    'https://asia-northeast1-aiplatform.googleapis.com/v1/projects/gemini-pro-test/locations/asia-northeast1/publishers/google/models/gemini-pro:predict',
    'https://asia-southeast1-aiplatform.googleapis.com/v1/projects/gemini-pro-test/locations/asia-southeast1/publishers/google/models/gemini-pro:predict'
  ]

  try {
    // 获取请求体
    const body = await request.json()
    
    // 从 Authorization header 中获取 API key
    const authHeader = request.headers.get('Authorization') || ''
    const apiKey = authHeader.replace('Bearer ', '')
    
    // 构建新的请求体
    const newBody = {
      instances: [{
        content: body.instances[0].content
      }],
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topK: 40,
        topP: 0.95
      }
    }

    let lastError = null

    // 尝试所有端点
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(newBody)
        })

        if (response.ok) {
          const data = await response.json()
          return new Response(JSON.stringify(data), {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Content-Type': 'application/json'
            },
            status: 200
          })
        }

        lastError = await response.text()
      } catch (error) {
        lastError = error
        continue
      }
    }

    // 如果所有端点都失败了
    throw new Error(lastError || 'All endpoints failed')
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
} 