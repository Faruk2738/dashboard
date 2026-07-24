export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SAMPLE_RATE = 24000;

function pcmToWav(pcm, sampleRate = SAMPLE_RATE, channels = 1) {
  const header = Buffer.alloc(44);
  const blockAlign = channels * 2;
  const byteRate = sampleRate * blockAlign;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function POST(request) {
  try {
    const { text, language = 'en-US' } = await request.json();
    const transcript = typeof text === 'string' ? text.trim().slice(0, 6000) : '';
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!transcript || !geminiApiKey) {
      return Response.json({ error: 'Text-to-speech is not configured.' }, { status: 400 });
    }

    const languageName = language.toLowerCase().startsWith('tr')
      ? 'Turkish (Turkey)'
      : 'American English (United States)';
    const prompt = `Read the following ${languageName} assistant response exactly as written, without translating it. Use a warm, clear, professional female voice. Speak fluently at a natural conversational pace, pause naturally at punctuation, and pronounce numbers, percentages, currency, abbreviations, and business terms idiomatically in ${languageName}. Do not read any instructions aloud.\n\n${transcript}`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              // Aoede is the warm, feminine presentation selected for Mira.
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
          },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text();
      console.error('Gemini TTS error:', geminiResponse.status, detail);
      return Response.json({ error: 'Text-to-speech provider is unavailable.' }, { status: 502 });
    }

    const result = await geminiResponse.json();
    const audio = result.candidates?.[0]?.content?.parts
      ?.find((part) => part.inlineData?.data)?.inlineData;
    if (!audio) {
      console.error('Gemini TTS returned an unexpected response.');
      return Response.json({ error: 'Text-to-speech provider returned no audio.' }, { status: 502 });
    }

    const wav = pcmToWav(
      Buffer.from(audio.data, 'base64'),
      Number(audio.mimeType?.match(/rate=(\d+)/)?.[1]) || SAMPLE_RATE,
      1
    );
    return new Response(wav, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return Response.json({ error: 'Unable to generate speech.' }, { status: 500 });
  }
}
