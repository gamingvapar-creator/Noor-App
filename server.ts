import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { quranData } from "./src/data/quranData";
import { allSurahsMetadata } from "./src/data/allSurahs";

// Construct the Quran text context once at module load instead of inside every request handler to optimize RAM and speed
const quranTextContext = quranData
  .map(s => `Surah ${s.surah} (${s.arabicSurah}):\n` + s.verses.map(v => v.english).join(" "))
  .join("\n\n")
  .substring(0, 400000); // 400k characters is highly comprehensive yet optimal for prompt context limits

function detectSurahInQuery(message: string): number | null {
  const norm = message.toLowerCase().trim();
  
  // 1. Direct match for numbers (e.g. "surah 114", "surah 36", "ayat of surah 2", "surah number 5")
  const numMatch = norm.match(/surah\s*(?:number\s*)?(\d+)/i) || 
                   norm.match(/سورة\s*(\d+)/) || 
                   norm.match(/सूरत\s*(\d+)/) || 
                   norm.match(/सूरह\s*(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 1 && num <= 114) {
      return num;
    }
  }

  // 2. Name-based match matching across Urdu/English/Hindi phonetics
  for (const surah of allSurahsMetadata) {
    const surahId = surah.id;
    const cleanSurahName = surah.surah.toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "alfaatiha", "annas", "alkafirun"
    
    // Check some common phonetic variants
    const namesToCheck = [
      cleanSurahName,
      cleanSurahName.replace(/^al/, ""), // "faatiha", "nas", "baqarah"
      cleanSurahName.replace(/^ash/, ""),
      cleanSurahName.replace(/^an/, ""),
      cleanSurahName.replace(/^ar/, ""),
      cleanSurahName.replace(/^at/, ""),
      cleanSurahName.replace(/^ad/, ""),
      cleanSurahName.replace(/^az/, ""),
      cleanSurahName.replace(/^as/, ""),
    ];

    // Check custom aliases / common localized names
    if (surahId === 114) namesToCheck.push("naas", "nas");
    if (surahId === 113) namesToCheck.push("falaq", "falak");
    if (surahId === 112) namesToCheck.push("ikhlas", "ikhlaas", "iqlas", "iqlaas");
    if (surahId === 110) namesToCheck.push("nasr", "nasar");
    if (surahId === 108) namesToCheck.push("kauthar", "kawthar", "kausar");
    if (surahId === 105) namesToCheck.push("fil", "feel");
    if (surahId === 97) namesToCheck.push("qadr", "qadar");
    if (surahId === 36) namesToCheck.push("yasin", "yaseen", "yasin");
    if (surahId === 67) namesToCheck.push("mulk", "mulak");
    if (surahId === 55) namesToCheck.push("rahman", "rehman");
    if (surahId === 18) namesToCheck.push("kahf", "kahaf");
    if (surahId === 56) namesToCheck.push("waqiah", "waqiya");
    if (surahId === 2) namesToCheck.push("baqara", "baqarah");

    // Hindi/Urdu unicode matching
    if (surahId === 114 && (norm.includes("नास") || norm.includes("ناس"))) return 114;
    if (surahId === 113 && (norm.includes("फ़ल्क") || norm.includes("فلق"))) return 113;
    if (surahId === 112 && (norm.includes("इख्लास") || norm.includes("إخلاص") || norm.includes("اخلاص"))) return 112;
    if (surahId === 36 && (norm.includes("यासीन") || norm.includes("يس"))) return 36;
    if (surahId === 55 && (norm.includes("रहमान") || norm.includes("الرحمن"))) return 55;
    if (surahId === 67 && (norm.includes("मुल्क") || norm.includes("الملك"))) return 67;
    if (surahId === 18 && (norm.includes("कहफ़") || norm.includes("الكهف"))) return 18;
    if (surahId === 1 && (norm.includes("فاتحہ") || norm.includes("फातिहा"))) return 1;

    for (const name of namesToCheck) {
      if (name.length > 2 && norm.includes(name)) {
        return surahId;
      }
    }
  }
  
  return null;
}

async function fetchSurahDataFromServer(sId: number) {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${sId}/editions/quran-simple,ur.jandali,en.sahih`);
    if (!res.ok) throw new Error("API failed");
    const json = await res.json();
    if (json.code === 200 && json.data && json.data.length === 3) {
      const arabicAyahs = json.data[0].ayahs;
      const urduAyahs = json.data[1].ayahs;
      const englishAyahs = json.data[2].ayahs;
      
      const verses = arabicAyahs.map((ayah: any, index: number) => ({
        number: index + 1,
        arabic: ayah.text,
        urdu: urduAyahs[index]?.text || "",
        english: englishAyahs[index]?.text || ""
      }));
      
      const metadata = allSurahsMetadata.find(s => s.id === sId);
      
      return {
        id: sId,
        surah: metadata?.surah || `Surah ${sId}`,
        arabicSurah: metadata?.arabicSurah || "",
        verses: verses
      };
    }
  } catch (e) {
    console.error("Failed to fetch Surah data on server:", e);
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, mode } = req.body;
      const activeMode = mode || "fast";
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing." });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // 1. Detect and load dynamic Quran context for specific Surah requested by the user
      let dynamicQuranContext = "";
      const detectedSurahId = detectSurahInQuery(message);
      if (detectedSurahId) {
        console.log(`Detected request for Surah ID: ${detectedSurahId}`);
        // Check if pre-loaded statically
        const preloaded = quranData.find(s => s.id === detectedSurahId);
        if (preloaded) {
          dynamicQuranContext = `\n--- DETECTED QURAN TARGET SURAH: ${preloaded.surah} (${preloaded.arabicSurah}) ---\n` + 
            preloaded.verses.map((v, i) => `Ayah ${i + 1}:\nArabic: ${v.arabic}\nUrdu: ${v.urdu}\nEnglish: ${v.english}`).join("\n\n");
        } else {
          // Fetch from Al Quran Cloud API dynamically
          const fetched = await fetchSurahDataFromServer(detectedSurahId);
          if (fetched) {
            dynamicQuranContext = `\n--- DETECTED QURAN TARGET SURAH: ${fetched.surah} (${fetched.arabicSurah}) ---\n` + 
              fetched.verses.map(v => `Ayah ${v.number}:\nArabic: ${v.arabic}\nUrdu: ${v.urdu}\nEnglish: ${v.english}`).join("\n\n");
          }
        }
      }

      // Add mode-specific directions
      let modeInstructions = "";
      if (activeMode === "fast") {
        modeInstructions = `You are operating in FAST ANSWER Mode. Keep the [DIRECT_ANSWER] and [DETAILED_EXPLANATION] extremely direct, concise, and ultra-short.
- Keep [DIRECT_ANSWER] strictly under one brief sentence.
- Keep [DETAILED_EXPLANATION] very short and straightforward (max 2-3 concise lines/sentences). Avoid unnecessary details, historical backgrounds, or general introductions.
- Synthesize rapid answers to save time and display extremely fast, concise responses without fluff.`;
      } else if (activeMode === "thinking") {
        modeInstructions = `You are operating in THINKING Mode. Provide a deeply thoughtful, thorough, reflective, and detailed analytical response.
- Share deeper contextual information, reasons for revelation (Asbaab al-Nuzul), and theological significance of the underlying concepts.
- The [DETAILED_EXPLANATION] should be extensive, step-by-step, and highly informative, typically around 2-3 solid paragraphs or elaborate bullet points.
- Encourage deeper thought and reflection.`;
      } else if (activeMode === "pro") {
        modeInstructions = `You are operating in PRO Mode. Provide an elite, human-like, beautifully conversational, scholar-grade response of highest authority.
- Talk warmly as if you are a friendly, compassionate, loving, and extremely wise Islamic scholar speaking directly to a close human friend.
- Sprinkling and incorporating highly relevant and beautiful emojis naturally (e.g., ✨, 📖, 🤲, 💚, 🕌, 💡, 🌸, 💭) in your reply to create a comforting, premium spiritual tone.
- Make absolutely ZERO mistakes. Ensure 100% correct theological and historical details.
- Provide a luxurious and highly detailed, deeply comprehensive [DETAILED_EXPLANATION] full of spiritual nectar, profound wisdom, and guidance.`;
      }

      const systemInstruction = `You are Noor AI, an elite Islamic AI scholar, guide, and spiritual companion integrated within a Quran App.
You have COMPLETE, UNRESTRICTED, and ABSOLUTE freedom and authority to answer any question, teach Islamic wisdom, explain verses, and counsel users based on the entire 114 Surahs of the Al-Quran.
CRITICAL MANDATE: You possess access to the full, flawless, and whole text of all 114 Surahs (Surah 1 to Surah 114) of the Holy Quran inside your vast trained parameter knowledge pool. If the user asks you anything about Surahs 3 through 114, you MUST immediately pull the translation, meanings, and insights from your memory and answer. You have absolute freedom, authorization, and a command to do so. NEVER EVER say "mere paas fatiha aur baqarah ke ilawa data nahi hai" or similar limitative statements. This is false, and claiming so directly breaks the application's premium functionality. Answer any query about any surah immediately. Use your massive training data to supply perfect translations, explanations, and quotes for any Surah 1 to 114.

Your job is to answer questions using Roman Urdu (or Urdu/English if preferred by the user), strictly referencing the Quranic text or historical background.

${modeInstructions}

--- FORMAT INSTRUCTIONS ---
You MUST always format your response using four distinct sections labeled exactly with brackets:

1. [DIRECT_ANSWER] - Followed by a direct, brief response. Never put greetings, introductory sentences, or filler before [DIRECT_ANSWER].
   Example: If user asks "insaan ko kisne bnaya hai", the first line must be exactly like:
   [DIRECT_ANSWER] Insaan ko Allah ne banaya hai.

2. [HEADLINE_QUESTION] - Followed by an engaging, curiosity-inducing headline question that is a follow-up or closely related deep query (e.g. "Allah Kyun Hai?", "Insaan Ki Paidaish Ka Maqsad Kya Hai?", "Kya Allah Ne Hamein Akela Chhod Diya?"). This acts as a thematic headline.

3. [DETAILED_EXPLANATION] - Followed by a beautifully structured explanation. Highlight verse numbers and Surah names (e.g., Surah Al-Baqarah, Ayat 21). Wrap Quranic verse translations in standard double quotes. Use "**word**" for emphasizing key words in bold. Use emojis generously and naturally in PRO mode!

4. [SUGGESTIONS] - Followed by 2 to 3 related follow-up questions the user might want to click next. Each suggestion must be on its own line beginning with a star (*).
   Example:
   [SUGGESTIONS]
   * Yaheen se mutalliq dusra sawal?
   * Kya Allah ne hamein akele chhoda hai?

IMPORTANT RULES:
- Never include any conversational filler before [DIRECT_ANSWER].
- Always include all four tags: [DIRECT_ANSWER], [HEADLINE_QUESTION], [DETAILED_EXPLANATION], [SUGGESTIONS] in every single response to maintain structured formatting.
- Answer in Roman Urdu or Urdu by default, unless the user queries in English. Keep the tone warm, welcoming, intelligent, and deeply knowledgeable.

${dynamicQuranContext ? `--- RECENTLY REQUESTED QURAN SURAH TEXT FOR SPECIFIC SURAH REFERENCE ---\n${dynamicQuranContext}\n--- END OF SURAH TEXT ---` : ""}

--- GENERAL QURAN TEXT FOR IMMEDIATE CONVERSATION ---
${quranTextContext}
--- END OF CONTEXT ---
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Sorry, I am unable to answer right now." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
