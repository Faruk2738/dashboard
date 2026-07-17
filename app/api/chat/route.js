import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
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
    const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
    let contextData = {};
    if (fs.existsSync(dataPath)) {
      contextData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
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

Please provide concise, professional, and data-driven answers.`;

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
            max_tokens: 500
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
              maxOutputTokens: 500,
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
    let fallbackText = "Hello! I am currently operating in offline mode. ";
    if (prompt.toLowerCase().includes("revenue") || prompt.toLowerCase().includes("sales")) {
      fallbackText += `Our total revenue is $${(contextData.totalRevenue || 0).toLocaleString()} with a gross profit of $${(contextData.totalProfit || 0).toLocaleString()} (Margin: ${contextData.margin ? contextData.margin.toFixed(1) : 0}%).`;
    } else if (prompt.toLowerCase().includes("customer")) {
      fallbackText += `We currently have ${(contextData.uniqueCustomers || 0).toLocaleString()} active customers, with an average order value of $${(contextData.avgOrderValue || 0).toLocaleString()}.`;
    } else {
      fallbackText += `AdventureWorks top categories are ${contextData.categorySales?.slice(0,3).map(c => c.category).join(', ')}, and top regions are ${contextData.territorySales?.slice(0,3).map(t => t.territory).join(', ')}. How can I assist you further?`;
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
