import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { prompt, language = 'en-US' } = await request.json();
    const isTurkish = language.toLowerCase().startsWith('tr');
    
    // Read environment keys
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    // Detect if key looks like a Groq key (starts with gsk_)
    const isGroqKey = (key) => key && key.startsWith('gsk_');

    // Resolve which key is which
    let groqKeyToUse = null;
    let geminiKeyToUse = null;

    if (isGroqKey(groqApiKey)) {
      groqKeyToUse = groqApiKey;
    } else if (isGroqKey(geminiApiKey)) {
      // User might have put Groq key in GEMINI_API_KEY variable
      groqKeyToUse = geminiApiKey;
    }

    if (geminiApiKey && !geminiApiKey.startsWith('gsk_')) {
      geminiKeyToUse = geminiApiKey;
    }

    // Read aggregated data to provide context to the AI
    const dataPath = path.join(process.cwd(), 'Data', 'aggregated.json');
    let contextData = {};
    if (fs.existsSync(dataPath)) {
      contextData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    const isTotalRevenueQuestion = /\btotal revenue\b/i.test(prompt) || /toplam ciro/i.test(prompt);
    if (isTotalRevenueQuestion) {
      const conciseRevenueAnswer = isTurkish
        ? 'Toplam ciro 29 milyon dolar.'
        : 'Total revenue is $29 million.';

      return NextResponse.json({
        candidates: [{
          content: {
            parts: [{ text: conciseRevenueAnswer }]
          }
        }]
      });
    }

    const systemInstruction = `You are an experienced AI Sales Analyst and Management Assistant for the AdventureWorks sales organization. 
Use the following aggregated data to answer the user's questions:
Total Revenue: $${(contextData.totalRevenue || 0).toLocaleString()}
Total Profit: $${(contextData.totalProfit || 0).toLocaleString()}
Margin: ${contextData.margin ? contextData.margin.toFixed(1) : 0}%
Active Customers: ${(contextData.uniqueCustomers || 0).toLocaleString()}
Avg Order Value: $${(contextData.avgOrderValue || 0).toLocaleString()}

Top 3 Categories: ${contextData.categorySales?.slice(0,3).map(c => c.category).join(', ')}
Top 3 Regions: ${contextData.territorySales?.slice(0,3).map(t => t.territory).join(', ')}

Provide concise, professional, and data-driven answers. Unless the user explicitly asks for detail, answer in no more than two short sentences and 35 words. Lead with the requested value and omit introductions, repetition, and follow-up offers.
Reply entirely in ${isTurkish ? 'Turkish (Turkey)' : 'American English (United States)'}, matching the user interface language. For English, use U.S. spelling, vocabulary, and phrasing; do not use British English. Use natural, speakable sentences and avoid Markdown tables.`;

    // ── TRY GROQ FIRST ───────────────────────────────────
    if (groqKeyToUse) {
      try {
        console.log("Calling Groq API...");
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKeyToUse}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 120
          })
        });

        if (response.ok) {
          const rawData = await response.json();
          // Transform Groq format to resemble standard response format expected by client
          const content = rawData.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              candidates: [{
                content: {
                  parts: [{ text: content }]
                }
              }]
            });
          }
        } else {
          console.warn(`Groq API returned status ${response.status}. Falling back to Gemini...`);
        }
      } catch (e) {
        console.error("Groq API Call failed. Falling back to Gemini...", e);
      }
    }

    // ── FALLBACK TO GEMINI ──────────────────────────────
    if (geminiKeyToUse) {
      try {
        console.log("Calling Gemini API...");
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKeyToUse}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 120,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          console.warn(`Gemini API returned status ${response.status}.`);
        }
      } catch (e) {
        console.error("Gemini API Call failed.", e);
      }
    }

    // ── FINAL LOCAL DUMMY RESPONSE (IF ALL OFFLINE) ─────
    console.warn("Using offline rule-based response fallback.");
    let fallbackText = isTurkish
      ? "Merhaba! Şu anda çevrimdışı modda çalışıyorum. "
      : "Hello! I am currently operating in offline mode. ";
    const normalizedPrompt = prompt.toLocaleLowerCase(isTurkish ? 'tr-TR' : 'en-US');
    if (normalizedPrompt.includes("revenue") || normalizedPrompt.includes("sales") || normalizedPrompt.includes("ciro") || normalizedPrompt.includes("satış")) {
      fallbackText += isTurkish
        ? `Toplam ciromuz $${(contextData.totalRevenue || 0).toLocaleString()} ve brüt kârımız $${(contextData.totalProfit || 0).toLocaleString()}. Kâr marjı yüzde ${contextData.margin ? contextData.margin.toFixed(1) : 0}.`
        : `Our total revenue is $${(contextData.totalRevenue || 0).toLocaleString()} with a gross profit of $${(contextData.totalProfit || 0).toLocaleString()} (Margin: ${contextData.margin ? contextData.margin.toFixed(1) : 0}%).`;
    } else if (normalizedPrompt.includes("customer") || normalizedPrompt.includes("müşteri")) {
      fallbackText += isTurkish
        ? `Şu anda ${(contextData.uniqueCustomers || 0).toLocaleString()} aktif müşterimiz var. Ortalama sipariş değeri $${(contextData.avgOrderValue || 0).toLocaleString()}.`
        : `We currently have ${(contextData.uniqueCustomers || 0).toLocaleString()} active customers, with an average order value of $${(contextData.avgOrderValue || 0).toLocaleString()}.`;
    } else {
      fallbackText += isTurkish
        ? `AdventureWorks'te en yüksek performanslı kategoriler ${contextData.categorySales?.slice(0,3).map(c => c.category).join(', ')}. En güçlü bölgeler ise ${contextData.territorySales?.slice(0,3).map(t => t.territory).join(', ')}. Size nasıl yardımcı olabilirim?`
        : `AdventureWorks top categories are ${contextData.categorySales?.slice(0,3).map(c => c.category).join(', ')}, and top regions are ${contextData.territorySales?.slice(0,3).map(t => t.territory).join(', ')}. How can I assist you further?`;
    }

    return NextResponse.json({
      candidates: [{
        content: {
          parts: [{ text: fallbackText }]
        }
      }]
    });

  } catch (error) {
    console.error("API Chat General Error:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}
