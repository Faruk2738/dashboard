import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const language = formData.get('language') || 'en-US';
    if (!audio || typeof audio.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Audio recording is required.' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;
    const isGroqKey = (key) => key?.startsWith('gsk_');
    const groqKey = isGroqKey(groqApiKey) ? groqApiKey : (isGroqKey(geminiApiKey) ? geminiApiKey : null);
    const geminiKey = geminiApiKey && !isGroqKey(geminiApiKey) ? geminiApiKey : null;
    const languageCode = language.toLowerCase().startsWith('tr') ? 'tr' : 'en';

    if (groqKey) {
      const upstreamForm = new FormData();
      upstreamForm.append('file', audio, `mira-recording.${audio.type?.includes('ogg') ? 'ogg' : 'webm'}`);
      upstreamForm.append('model', 'whisper-large-v3-turbo');
      upstreamForm.append('language', languageCode);
      upstreamForm.append('response_format', 'json');
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}` },
        body: upstreamForm,
      });
      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({ transcript: result.text || '' });
      }
    }

    if (geminiKey) {
      const audioData = Buffer.from(await audio.arrayBuffer()).toString('base64');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [
            { text: `Transcribe this audio exactly. Reply only with the spoken ${languageCode === 'tr' ? 'Turkish' : 'American English'} text.` },
            { inline_data: { mime_type: audio.type || 'audio/webm', data: audioData } },
          ] }],
        }),
      });
      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({ transcript: result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '' });
      }
    }

    return NextResponse.json({ error: 'No transcription service is available.' }, { status: 503 });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Audio transcription failed.' }, { status: 500 });
  }
}
