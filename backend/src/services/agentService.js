/**
 * Centralized LegalLens Omnipresent Copilot / Autonomous Agent Service
 * Full-power website execution agent capable of running tasks, switching languages,
 * triggering analyses, querying legal statutes, and controlling the platform.
 * Supports all 8 Indian languages (en, te, hi, ta, kn, ml, mr, bn) in both native script & Romanized transliteration.
 */

const groqService = require('./groqService');

class AgentService {
  async processUserQuery({
    message,
    currentRoute = '/',
    currentPageTitle = 'LegalLens Platform',
    pageContext = {},
    conversationHistory = [],
    language = 'en'
  }) {
    const routeDirectory = `
AVAILABLE PLATFORM SECTIONS & CAPABILITIES:
- "/terms" (Terms & Conditions Analyzer): Analyze public URLs (Netflix, Spotify, GitHub, WhatsApp, etc.), pasted terms texts, or demo documents (saas-terms, rental-agreement, employment-agreement).
- "/upload" (Document Upload & OCR): Upload contracts, tenancy leases, employment agreements, or NDAs in PDF, DOCX, TXT.
- "/compare" (Document Comparison): Compare two agreements (e.g. original vs revised redline).
- "/legal-assistant" (Modular RAG Legal Assistant): Ask questions grounded in Indian statutes (Consumer Protection Act 2019, Model Tenancy Act, DPDP Act 2023, Indian Contract Act 1872).
- "/glossary" (Plain-Language Legal Glossary): 40+ legal terms with everyday examples and risk tags.
- "/dashboard" (User Dashboard): Access saved reports and analysis history.
- "/extension" (Browser Extension): Companion guidance.

SUPPORTED PLATFORM LANGUAGES:
- "en" (English)
- "te" (తెలుగు - Telugu)
- "hi" (हिन्दी - Hindi)
- "ta" (தமிழ் - Tamil)
- "kn" (ಕನ್ನಡ - Kannada)
- "ml" (മലയാളം - Malayalam)
- "mr" (मराठी - Marathi)
- "bn" (বাংলা - Bengali)
`;

    const langNames = {
      en: 'English',
      te: 'Telugu (తెలుగు)',
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      mr: 'Marathi (मराठी)',
      bn: 'Bengali (বাংলা)'
    };

    // Detect language switch intent in message across native scripts and Romanized transliterations
    const lowerMsg = (message || '').toLowerCase();
    let detectedTargetLang = null;

    if (/telugu|తెలుగు|తెలుగ|telugulo|telugu lo|teluguki|telugula/i.test(lowerMsg)) {
      detectedTargetLang = 'te';
    } else if (/hindi|हिन्दी|हिंदी|hindime|hindi me|hindi mein|hindite/i.test(lowerMsg)) {
      detectedTargetLang = 'hi';
    } else if (/tamil|தமிழ்|தமிழி|tamilil|tamil il|tamil la|thamizh/i.test(lowerMsg)) {
      detectedTargetLang = 'ta';
    } else if (/kannada|ಕನ್ನಡ|kannadadalli|kannada dalli|kannadalli/i.test(lowerMsg)) {
      detectedTargetLang = 'kn';
    } else if (/malayalam|മലയാളം|malayalamil|malayalam il/i.test(lowerMsg)) {
      detectedTargetLang = 'ml';
    } else if (/marathi|मराठी|marathit|marathi madhe/i.test(lowerMsg)) {
      detectedTargetLang = 'mr';
    } else if (/bengali|বাংলা|bangla|banglay|banglate/i.test(lowerMsg)) {
      detectedTargetLang = 'bn';
    } else if (/english|angrezi|angrezi me|angrezime/i.test(lowerMsg) && /switch|change|convert|set|to /i.test(lowerMsg)) {
      detectedTargetLang = 'en';
    }

    const isLangSwitchIntent = detectedTargetLang && /switch|change|convert|set|మార్చు|మార్చండి|పెట్టు|బదలో|बदलो|बदला|माற்று|மாற்றவும்|ಬದಲಿಸಿ|ಮಾಡಿ|മാറ്റുക|পরিবর্তন|করুন|marchu|badlo|karo|mathu|badalisi|aakku|kara|korun|pettu|lagao|lo |me |mein |il |dalli |t |la /i.test(lowerMsg);

    const effectiveLang = isLangSwitchIntent 
      ? detectedTargetLang 
      : (language || 'en');

    const targetLangName = langNames[effectiveLang] || langNames[language] || 'English';

    const systemPrompt = `You are LegalLens Omnipresent Copilot — an autonomous AI agent with FULL EXECUTION POWER over the entire LegalLens platform.
CURRENT CONTEXT:
- Current Route: "${currentRoute}"
- Page Title: "${currentPageTitle}"
- Current Platform Language: "${effectiveLang}" (${targetLangName})

CRITICAL MULTILINGUAL & LOCAL INDIAN DIALECT / TRANSLITERATION CAPABILITIES:
1. The user may write to you in ANY Indian language (Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, English), in native scripts OR Romanized transliteration:
   - Telugu transliterations: "telugu lo marchu", "dashboard chupinchu", "contract check chey", "saas terms chudu", "audio vinipinchu", "idi explain cheyyi", "glossary open cheyyi"
   - Hindi transliterations: "hindi me badlo", "dashboard kholo / dikhao", "contract check karo", "bolkar sunao", "yeh samjhao"
   - Tamil transliterations: "tamilil mathu", "dashboard thira / kattunga", "kadhai kelu", "vilakkavum"
   - Kannada transliterations: "kannadadalli badalisi", "dashboard thoorisi", "arthamadi"
   - Malayalam transliterations: "malayalamil aakku", "dashboard thurakku", "parayu"
   - Marathi transliterations: "marathit sanga", "dashboard dakhva", "samjaun sanga"
   - Bengali transliterations: "banglay bolo", "dashboard dekhun", "shunao"
2. You MUST ACCURATELY UNDERSTAND user requests in all these dialects, determine the required platform task, and execute that task!
3. ALWAYS generate your "reply" and "suggestedPrompts" in the target language (${targetLangName}). Never force English when the user speaks or expects an Indian language.

YOUR FULL-POWER CAPABILITIES & ACTIONS:
You MUST set the "action" object appropriately whenever the user asks you to perform ANY website action, task, or setting change:

1. LANGUAGE SWITCHING:
   - When the user asks to switch/change/set the language (e.g. "switch to Telugu", "తెలుగులోకి మార్చు", "telugu lo marchu", "हिंदी में बदलो", "change language to Tamil", "set to Kannada"):
   - Set action: { "type": "switch_language", "data": { "languageCode": "te"|"hi"|"ta"|"kn"|"ml"|"mr"|"bn"|"en", "languageName": "Native (English)" }, "label": "Switch Language" }

2. DIRECT TERMS & URL ANALYSIS:
   - When the user gives a URL or asks to analyze terms (e.g. "Analyze https://example.com/terms", "Analyze Netflix terms", "నెట్‌ఫ్లిక్స్ నిబంధనలను విశ్లేషించండి", "saas terms chudu", "Load SaaS demo"):
   - Set action: { "type": "analyze_terms", "targetRoute": "/terms", "data": { "mode": "url"|"text"|"demo", "url": "...", "text": "...", "title": "...", "demoId": "saas-terms"|"rental-agreement"|"employment-agreement" }, "label": "Analyze Terms" }

3. ASK LEGAL ASSISTANT (RAG STATUTE INQUIRY):
   - When user asks a legal question to query the statutes (e.g. "Can my landlord deduct my deposit in Telangana?", "ఇంటి యజమాని డిపాజిట్ కట్ చేయవచ్చా?", "kya landlord deposit cut kar sakta hai?"):
   - Set action: { "type": "ask_assistant", "targetRoute": "/legal-assistant", "data": { "question": "...", "category": "rental"|"consumer"|"employment"|"contracts"|"cyber"|"family"|"education"|"other", "state": "Telangana"|"Karnataka"|"Delhi"|"Maharashtra"|... }, "label": "Ask Legal Assistant" }

4. NAVIGATION:
   - When user asks to go/open/view any page (e.g. "Take me to document comparison", "డ్యాష్‌బోర్డ్ తెరవండి", "dashboard chupinchu / kholo", "Open glossary", "Go to upload", "పోలిక చూడండి"):
   - Set action: { "type": "navigate", "targetRoute": "/terms"|"/upload"|"/compare"|"/legal-assistant"|"/glossary"|"/dashboard"|"/extension", "label": "Navigate" }

5. OPEN / SEARCH GLOSSARY:
   - When user asks to open glossary or search a specific term (e.g. "Open glossary for indemnity", "ఇండెమ్నిటీ అంటే ఏమిటి?", "indemnity explain cheyyi", "What does force majeure mean?"):
   - Set action: { "type": "open_glossary", "data": { "searchTerm": "term" }, "label": "Open Glossary" }

6. VOICE TTS / READ ALOUD:
   - When user asks to speak/read aloud (e.g. "Read this out", "చదివి వినిపించండి", "audio vinipinchu", "बोलकर सुनाओ"):
   - Set action: { "type": "speak_text", "data": { "text": "Text to read aloud" }, "label": "Listen to Voice" }

7. PRINT / EXPORT:
   - When user asks to print or export (e.g. "Print this page", "ప్రింట్ చేయండి", "Save as PDF"):
   - Set action: { "type": "print_page", "data": {}, "label": "Print Document" }

8. ACCESSIBILITY / ELI5 MODE:
   - When user asks to simplify or switch to ELI5 mode (e.g. "Explain simply", "సులభంగా వివరించండి", "idi simple ga cheppu", "सरल भाषा में बताओ"):
   - Set action: { "type": "toggle_eli5", "data": { "enable": true }, "label": "Toggle ELI5 Mode" }

RESPONSE RULES:
- If switching language, write your reply in that target language confirming the switch.
- Write naturally, clearly, and empoweringly in ${targetLangName}.
- ALWAYS output strict JSON matching the schema below with NO markdown code fences.

OUTPUT SCHEMA:
{
  "reply": "Your clear, empowering response in ${targetLangName} confirming the task execution or explaining the answer.",
  "action": {
    "type": "switch_language" | "analyze_terms" | "ask_assistant" | "navigate" | "open_glossary" | "speak_text" | "print_page" | "toggle_eli5" | "none",
    "targetRoute": "/terms" | "/upload" | "/compare" | "/legal-assistant" | "/glossary" | "/dashboard" | "/extension" | null,
    "label": "Short button label or null",
    "data": {}
  },
  "suggestedPrompts": [
    "Contextual follow-up 1 in ${targetLangName}",
    "Contextual follow-up 2 in ${targetLangName}"
  ]
}

${routeDirectory}`;

    const historyFormatted = (conversationHistory || []).slice(-6).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyFormatted,
      { role: 'user', content: message }
    ];

    try {
      const response = await groqService._callGroq(messages, true, 0.2);

      // Sanity-check language switch action if requested
      if (isLangSwitchIntent) {
        if (!response.action || response.action.type === 'none') {
          response.action = {
            type: 'switch_language',
            data: { languageCode: detectedTargetLang, languageName: langNames[detectedTargetLang] },
            label: `Switch to ${langNames[detectedTargetLang]}`
          };
        }
      }

      return response;
    } catch (err) {
      console.error('[AgentService] Groq execution error:', err.message);
      
      const fallbacks = {
        te: {
          reply: "నేను LegalLens లో మీ కోసం ఏదైనా పని చేయడానికి సిద్ధంగా ఉన్నాను. నిబంధనలను విశ్లేషించడం, చట్టపరమైన ప్రశ్న అడగడం లేదా భాషను మార్చడం వంటివి అడగండి!",
          prompts: ["డ్యాష్‌బోర్డ్ తెరవండి", "SaaS డెమో నిబంధనలను విశ్లేషించండి", "ఇంటి యజమాని డిపాజిట్ కట్ చేయవచ్చా?"]
        },
        hi: {
          reply: "मैं LegalLens पर आपके लिए कोई भी कार्य करने के लिए तैयार हूं। नियमों का विश्लेषण, कानूनी प्रश्न या भाषा बदलने के लिए कहें!",
          prompts: ["डैशबोर्ड खोलें", "डेमो SaaS नियमों का विश्लेषण करें", "क्या मकान मालिक सिक्योरिटी डिपॉजिट काट सकता है?"]
        },
        ta: {
          reply: "LegalLens இல் உங்களுக்காக எந்தப் பணியையும் செய்ய நான் தயாராக உள்ளேன். விதிமுறைகளை பகுப்பாய்வு செய்ய அல்லது சட்டக் கேள்விகளைக் கேட்கவும்!",
          prompts: ["டாஷ்போர்டு திறக்கவும்", "டெமோ SaaS விதிமுறைகளை பகுப்பாய்வு செய்", "வாடகை முன்பணத்தை உரிமையாளர் பிடிக்கலாமா?"]
        },
        kn: {
          reply: "LegalLens ನಲ್ಲಿ ನಿಮಗಾಗಿ ಯಾವುದೇ ಕಾರ್ಯವನ್ನು ನಿರ್ವಹಿಸಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ನಿಯಮಗಳ ವಿಶ್ಲೇಷಣೆ ಅಥವಾ ಕಾನೂನು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ!",
          prompts: ["ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ", "ಡೆಮೊ ನಿಯಮಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ", "ಮನೆಮಾಲೀಕರು ಠೇವಣಿ ಕಡಿತಗೊಳಿಸಬಹುದೇ?"]
        },
        ml: {
          reply: "LegalLens-ൽ നിങ്ങൾക്കായി ഏത് ചുമതലയും നിർവഹിക്കാൻ ഞാൻ തയ്യാറാണ്. നിബന്ധനകൾ വിശകലനം ചെയ്യാനോ നിയമപരമായ ചോദ്യങ്ങൾ ചോദിക്കാനോ എന്നോട് പറയൂ!",
          prompts: ["ഡാഷ്‌ബോർഡ് തുറക്കുക", "ഡെമോ SaaS നിബന്ധനകൾ വിശകലനം ചെയ്യുക", "സെക്യൂരിറ്റി ഡെപ്പോസിറ്റ് ഉടമയ്ക്ക് പിടിക്കാമോ?"]
        },
        mr: {
          reply: "मी LegalLens वर आपल्यासाठी कोणतेही कार्य करण्यासाठी सज्ज आहे. अटींचे विश्लेषण, कायदेशीर प्रश्न किंवा भाषा बदलण्यासाठी सांगा!",
          prompts: ["डॅशबोर्ड उघडा", "डेमो SaaS अटींचे विश्लेषण करा", "घरमालक डिपॉझिट कापू शकतो का?"]
        },
        bn: {
          reply: "আমি LegalLens-এ আপনার জন্য যেকোনো কাজ সম্পাদন করতে প্রস্তুত। শর্তাবলী বিশ্লেষণ বা আইনি প্রশ্ন জিজ্ঞাসা করুন!",
          prompts: ["ড্যাশবোর্ড খুলুন", "ডেমো SaaS শর্তাবলী বিশ্লেষণ করুন", "বাড়িওয়ালা কি সিকিউরিটি ডিপোজিট কাটতে পারেন?"]
        },
        en: {
          reply: "I am ready to perform any task on LegalLens for you. Tell me what you'd like to do, such as analyzing an agreement, asking a legal question, or switching the language!",
          prompts: ["Switch language to Telugu", "Analyze demo SaaS terms", "Can my landlord deduct my deposit?"]
        }
      };

      const langToUse = effectiveLang || language || 'en';
      const fb = fallbacks[langToUse] || fallbacks.en;

      let fallbackAction = {
        type: "none",
        targetRoute: null,
        label: null,
        data: {}
      };

      if (isLangSwitchIntent) {
        fallbackAction = {
          type: "switch_language",
          targetRoute: null,
          label: `Switch to ${langNames[detectedTargetLang]}`,
          data: { languageCode: detectedTargetLang, languageName: langNames[detectedTargetLang] }
        };
      } else if (/dashboard|డ్యాష్‌బోర్డ్|डैशबोर्ड|chupinchu|kholo|dakhva/i.test(lowerMsg)) {
        fallbackAction = { type: "navigate", targetRoute: "/dashboard", label: "Open Dashboard", data: {} };
      } else if (/glossary|నిఘంటువు|शब्दावली/i.test(lowerMsg)) {
        fallbackAction = { type: "navigate", targetRoute: "/glossary", label: "Open Glossary", data: {} };
      } else if (/upload|అప్‌లోడ్|अपलोड/i.test(lowerMsg)) {
        fallbackAction = { type: "navigate", targetRoute: "/upload", label: "Open Upload", data: {} };
      } else if (/saas|terms|నిబంధన/i.test(lowerMsg)) {
        fallbackAction = { type: "analyze_terms", targetRoute: "/terms", label: "Analyze SaaS Terms", data: { mode: "demo", demoId: "saas-terms" } };
      }

      return {
        reply: fb.reply,
        action: fallbackAction,
        suggestedPrompts: fb.prompts
      };
    }
  }
}

module.exports = new AgentService();
