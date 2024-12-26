export async function generateResponse(prompt: string) {
  try {
    const response = await fetch('/api/chat/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
