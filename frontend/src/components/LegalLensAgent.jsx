import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Scale, 
  MessageSquare, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Check, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Zap,
  Globe,
  Printer
} from 'lucide-react';
import { askAgent } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import VoiceInputButton from './VoiceInputButton';
import VoiceOutputButton from './VoiceOutputButton';

const COPILOT_GREETINGS = {
  te: "నమస్కారం! నేను పూర్తి వెబ్‌సైట్ నిర్వహణ సామర్థ్యం కలిగిన మీ లీగల్‌లెన్స్ AI కోపైలట్‌ను. నిబంధనల విశ్లేషణ, భాష మార్పు, చట్టపరమైన ప్రశ్నలు అడగడం, నిఘంటువు తెరవడం లేదా ఏదైనా పనిని సులభంగా చేయమని నన్ను అడగండి!",
  hi: "नमस्ते! मैं पूर्ण नियंत्रण शक्ति वाला आपका LegalLens AI कोपायलट हूं। आप मुझसे नियमों का विश्लेषण, भाषा बदलना, कानूनी प्रश्न पूछना, शब्दावली खोलना या किसी भी कार्य को करने के लिए कह सकते हैं!",
  ta: "வணக்கம்! நான் உங்கள் LegalLens AI கோபைலட். விதிமுறைகளை பகுப்பாய்வு செய்தல், மொழியை மாற்றுதல், சட்டக் கேள்விகளைக் கேட்க அல்லது எந்தப் பணியையும் செய்ய என்னிடம் சொல்லுங்கள்!",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ LegalLens AI ಕೋಪೈಲಟ್. ನಿಯಮಗಳ ವಿಶ್ಲೇಷಣೆ, ಭಾಷೆ ಬದಲಾವಣೆ, ಕಾನೂನು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುವುದು ಅಥವಾ ಯಾವುದೇ ಕೆಲಸವನ್ನು ಮಾಡಲು ನನಗೆ ತಿಳಿಸಿ!",
  ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ LegalLens AI കോപൈലറ്റ് ആണ്. നിബന്ധനകൾ വിശകലനം ചെയ്യുക, ഭാഷ മാറ്റുക, നിയമപരമായ ചോദ്യങ്ങൾ ചോദിക്കുക, അല്ലെങ്കിൽ ഏത് ജോലിയും ചെയ്യാൻ എന്നോട് ആവശ്യപ്പെടുക!",
  mr: "नमस्कार! मी तुमचा LegalLens AI कोपायलट आहे. अटींचे विश्लेषण, भाषा बदलणे, कायदेशीर प्रश्न विचारणे किंवा कोणतेही कार्य करण्यासाठी मला सांगा!",
  bn: "নমস্কার! আমি আপনার LegalLens AI কোপাইলট। শর্তাবলী বিশ্লেষণ, ভাষা পরিবর্তন, আইনি প্রশ্ন জিজ্ঞাসা বা যেকোনো কাজ সম্পাদনের জন্য আমাকে বলুন!",
  en: "Hello! I am your LegalLens AI Copilot with full website control. Ask me to analyze terms, switch languages, answer legal questions, explore the glossary, or execute tasks across the app!"
};

const LANGUAGE_CHANGED_NOTICES = {
  te: "భాష తెలుగులోకి మార్చబడింది! నేను ఇప్పుడు తెలుగులో మరియు మీకు కావలసిన ఆదేశాలతో సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.",
  hi: "भाषा को हिंदी में बदल दिया गया है! अब मैं हिंदी और आपके आदेशों के अनुसार सहायता करने के लिए तैयार हूं।",
  ta: "மொழி தமிழுக்கு மாற்றப்பட்டது! இப்போது நான் தமிழில் உங்களுக்கு உதவ தயாராக உள்ளேன்.",
  kn: "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ! ಈಗ ನಾನು ಕನ್ನಡದಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.",
  ml: "ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി! ഇപ്പോൾ ഞാൻ മലയാളത്തിൽ നിങ്ങളെ സഹായിക്കാൻ തയ്യാറാണ്.",
  mr: "भाषा मराठीत बदलली आहे! आता मी तुम्हाला मराठीत मदत करण्यास तयार आहे.",
  bn: "ভাষা বাংলায় পরিবর্তন করা হয়েছে! এখন আমি আপনাকে বাংলায় সাহায্য করতে প্রস্তুত।",
  en: "Language switched to English! I'm ready to assist you in English across all platform features."
};

const DEFAULT_PROMPTS = {
  te: ["భాషను తెలుగులోకి మార్చు", "డ్యాష్‌బోర్డ్ తెరవండి", "SaaS డెమో నిబంధనలను విశ్లేషించండి", "ఇంటి యజమాని డిపాజిట్ కట్ చేయవచ్చా?"],
  hi: ["भाषा को हिंदी में बदलें", "डैशबोर्ड खोलें", "डेमो SaaS नियमों का विश्लेषण करें", "क्या मकान मालिक सिक्योरिटी डिपॉजिट काट सकता है?"],
  ta: ["மொழியை தமிழுக்கு மாற்றவும்", "டாஷ்போர்டு திறக்கவும்", "டெமோ SaaS விதிமுறைகளை பகுப்பாய்வு செய்", "வாடகை முன்பணத்தை உரிமையாளர் பிடிக்கலாமா?"],
  kn: ["ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ", "ಡೆಮೊ SaaS ನಿಯಮಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ", "ಮನೆಮಾಲೀಕರು ಠೇವಣಿ ಕಡಿತಗೊಳಿಸಬಹುದೇ?"],
  ml: ["ഭാഷ മലയാളത്തിലേക്ക് മാറ്റുക", "ഡാഷ്‌ബോർഡ് തുറക്കുക", "ഡെമോ SaaS നിബന്ധനകൾ വിശകലനം ചെയ്യുക", "സെക്യൂരിറ്റി ഡെപ്പോസിറ്റ് ഉടമയ്ക്ക് പിടിക്കാമോ?"],
  mr: ["भाषा मराठीत बदला", "डॅशबोर्ड उघडा", "डेमो SaaS अटींचे विश्लेषण करा", "घरमालक डिपॉझिट कापू शकतो का?"],
  bn: ["ভাষা বাংলায় পরিবর্তন করুন", "ড্যাশবোর্ড খুলুন", "ডেমো SaaS শর্তাবলী বিশ্লেষণ করুন", "বাড়িওয়ালা কি সিকিউরিটি ডিপোজিট কাটতে পারেন?"],
  en: ["Switch language to Telugu", "Analyze demo SaaS terms", "Can my landlord deduct my deposit for painting?", "Take me to document comparison"]
};

export default function LegalLensAgent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage, selectLanguage, supportedLanguages, playSpeech, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTipBubble, setShowTipBubble] = useState(false);

  const langCode = currentLanguage?.code || 'en';
  const prevLangRef = useRef(langCode);

  // Chat message history stored in state
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'init-1',
        role: 'assistant',
        content: COPILOT_GREETINGS[langCode] || COPILOT_GREETINGS.en,
        action: null,
        suggestedPrompts: DEFAULT_PROMPTS[langCode] || DEFAULT_PROMPTS.en
      }
    ];
  });

  // Keep welcome message updated or notify when language changes
  useEffect(() => {
    if (prevLangRef.current !== langCode) {
      setMessages(prev => {
        if (prev.length <= 1 && (prev.length === 0 || prev[0].role === 'assistant')) {
          return [{
            id: 'init-' + langCode,
            role: 'assistant',
            content: COPILOT_GREETINGS[langCode] || COPILOT_GREETINGS.en,
            action: null,
            suggestedPrompts: DEFAULT_PROMPTS[langCode] || DEFAULT_PROMPTS.en
          }];
        }
        return [
          ...prev,
          {
            id: 'lang-notice-' + Date.now(),
            role: 'assistant',
            content: LANGUAGE_CHANGED_NOTICES[langCode] || LANGUAGE_CHANGED_NOTICES.en,
            action: null,
            suggestedPrompts: DEFAULT_PROMPTS[langCode] || DEFAULT_PROMPTS.en
          }
        ];
      });
      prevLangRef.current = langCode;
    }
  }, [langCode]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Map route to current human-readable section name, icon, and contextual tip
  const currentSection = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/terms')) {
      return { 
        title: t('nav.terms', 'Terms Analyzer'), 
        icon: '🔍', 
        desc: t('terms.publicUrl', 'Analyzing website URLs & terms text'),
        tip: t('terms.subtitle', 'Analyzing terms or policies? Ask me to analyze any URL, paste text, or toggle ELI5 simple mode!')
      };
    }
    if (path.startsWith('/upload')) {
      return { 
        title: t('nav.upload', 'Document Upload & Q&A'), 
        icon: '📄', 
        desc: t('upload.formats', 'Analyzing contracts, leases & grounded chat'),
        tip: t('upload.subtitle', 'Have a lease, employment letter, or NDA? Upload it and ask me anything grounded directly in your document!')
      };
    }
    if (path.startsWith('/compare')) {
      return { 
        title: t('nav.compare', 'Document Comparison'), 
        icon: '⚖️', 
        desc: t('compare.badge', 'Comparing contract versions for shifts'),
        tip: t('compare.subtitle', 'Comparing agreements? I can highlight which party gains leverage across updated clauses!')
      };
    }
    if (path.startsWith('/legal-assistant')) {
      return { 
        title: t('nav.assistant', 'Legal RAG Assistant'), 
        icon: '🏛️', 
        desc: t('assistant.badge', 'Answering questions grounded in Indian statutes'),
        tip: t('assistant.subtitle', 'Ask questions grounded in Indian law (IPC/BNS, Consumer Protection Act, Indian Contract Act)!')
      };
    }
    if (path.startsWith('/glossary')) {
      return { 
        title: t('nav.glossary', 'Legal Glossary'), 
        icon: '📚', 
        desc: t('glossary.badge', 'Plain-language jargon definitions & quiz'),
        tip: t('glossary.subtitle', 'Confused by legal jargon? Ask me to find or explain any complex Latin or contract term!')
      };
    }
    if (path.startsWith('/dashboard')) {
      return { 
        title: t('nav.dashboard', 'Dashboard'), 
        icon: '📊', 
        desc: t('dash.subtitle', 'Saved reports & analysis history'),
        tip: t('dash.subtitle', 'Need a summary of past documents or want to review high-risk contracts? Just ask me!')
      };
    }
    if (path.startsWith('/login') || path.startsWith('/register')) {
      return { 
        title: t('nav.signIn', 'Account Access'), 
        icon: '🔐', 
        desc: t('auth.signInSubtitle', 'Authentication & Profile'),
        tip: t('auth.signInSubtitle', 'Sign in to sync your analyses, bookmarks, and risk profiles securely to the cloud!')
      };
    }
    return { 
      title: t('home.heroBadge', 'Home Overview'), 
      icon: '✨', 
      desc: t('home.featuresSubtitle', 'Platform tools & guides'),
      tip: t('home.heroDesc', 'Need help executing any task or understanding contracts? Ask your Copilot anytime!')
    };
  }, [location.pathname, langCode, t]);

  // Section-specific suggested prompts for fast doubts & tasks
  const sectionPrompts = useMemo(() => {
    const base = DEFAULT_PROMPTS[langCode] || DEFAULT_PROMPTS.en;
    const path = location.pathname;

    if (langCode === 'te') {
      if (path.startsWith('/terms')) return ["SaaS డెమో నిబంధనలను విశ్లేషించండి", "ELI5 సులభమైన మోడ్ ఆన్ చేయండి", "పత్రం అప్‌లోడ్‌కు వెళ్లండి"];
      if (path.startsWith('/legal-assistant')) return ["భారతదేశంలో నాన్-కాంపీట్ క్లాజ్ చెల్లుబాటు అవుతుందా?", "ఇంటి యజమాని డిపాజిట్ కట్ చేయవచ్చా?"];
      if (path.startsWith('/glossary')) return ["లిక్విడేటెడ్ డ్యామేజెస్ అర్థం ఏమిటి?", "అధిక ప్రమాదకర నిబంధనలు ఏవి?"];
    } else if (langCode === 'hi') {
      if (path.startsWith('/terms')) return ["डेमो SaaS नियमों का विश्लेषण करें", "ELI5 सरल मोड चालू करें", "दस्तावेज़ अपलोड पर जाएं"];
      if (path.startsWith('/legal-assistant')) return ["क्या भारत में नॉन-कंपीट क्लॉज मान्य है?", "क्या मकान मालिक सिक्योरिटी डिपॉजिट काट सकता है?"];
      if (path.startsWith('/glossary')) return ["लिक्विडेटेड डैमेज क्या होता है?", "उच्च जोखिम वाले नियम कौन से हैं?"];
    }

    return base;
  }, [location.pathname, langCode]);

  // Show contextual tip bubble whenever route changes
  useEffect(() => {
    setShowTipBubble(true);
  }, [location.pathname]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Central Autonomous Action Executor
  const executeAgentAction = (action, userText = '', replyText = '') => {
    if (!action || !action.type || action.type === 'none') return;

    switch (action.type) {
      case 'switch_language': {
        let targetCode = action.data?.languageCode || action.data?.code;
        if (!targetCode && action.data?.languageName) {
          const found = supportedLanguages.find(
            l => l.native.toLowerCase().includes(action.data.languageName.toLowerCase()) ||
                 l.english.toLowerCase().includes(action.data.languageName.toLowerCase())
          );
          if (found) targetCode = found.code;
        }
        if (!targetCode && userText) {
          const lower = userText.toLowerCase();
          if (/telugu|తెలుగు|telugulo/i.test(lower)) targetCode = 'te';
          else if (/hindi|हिन्दी|हिंदी|hindime/i.test(lower)) targetCode = 'hi';
          else if (/tamil|தமிழ்|tamilil/i.test(lower)) targetCode = 'ta';
          else if (/kannada|ಕನ್ನಡ|kannadadalli/i.test(lower)) targetCode = 'kn';
          else if (/malayalam|മലയാളം|malayalamil/i.test(lower)) targetCode = 'ml';
          else if (/marathi|मराठी|marathit/i.test(lower)) targetCode = 'mr';
          else if (/bengali|বাংলা|bangla/i.test(lower)) targetCode = 'bn';
          else if (/english|angrezi/i.test(lower)) targetCode = 'en';
        }
        if (targetCode) {
          selectLanguage(targetCode);
        }
        break;
      }

      case 'analyze_terms': {
        if (location.pathname !== '/terms') {
          navigate('/terms');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('legallens-analyze-terms', { detail: action.data || {} }));
          }, 350);
        } else {
          window.dispatchEvent(new CustomEvent('legallens-analyze-terms', { detail: action.data || {} }));
        }
        break;
      }

      case 'ask_assistant': {
        if (location.pathname !== '/legal-assistant') {
          navigate('/legal-assistant');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('legallens-ask-question', { detail: action.data || {} }));
          }, 350);
        } else {
          window.dispatchEvent(new CustomEvent('legallens-ask-question', { detail: action.data || {} }));
        }
        break;
      }

      case 'open_glossary': {
        if (location.pathname !== '/glossary') {
          navigate('/glossary');
          if (action.data?.searchTerm) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('legallens-search-glossary', { detail: action.data }));
            }, 350);
          }
        } else if (action.data?.searchTerm) {
          window.dispatchEvent(new CustomEvent('legallens-search-glossary', { detail: action.data }));
        }
        break;
      }

      case 'speak_text': {
        const textToSpeak = action.data?.text || replyText || '';
        if (textToSpeak) {
          playSpeech(textToSpeak, langCode);
        }
        break;
      }

      case 'print_page': {
        setTimeout(() => {
          window.print();
        }, 400);
        break;
      }

      case 'toggle_eli5': {
        window.dispatchEvent(new CustomEvent('legallens-toggle-eli5', { detail: action.data || {} }));
        break;
      }

      case 'navigate': {
        if (action.targetRoute) {
          navigate(action.targetRoute);
        }
        break;
      }

      default:
        if (action.targetRoute) {
          navigate(action.targetRoute);
        }
        break;
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    const userMsgId = 'user-' + Date.now();
    const newHistory = [...messages, { id: userMsgId, role: 'user', content: text }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await askAgent({
        message: text,
        currentRoute: location.pathname,
        currentPageTitle: currentSection.title,
        conversationHistory: newHistory.slice(-5),
        language: langCode
      });

      const data = res.data;
      const botMsgId = 'bot-' + Date.now();

      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          role: 'assistant',
          content: data.reply || (COPILOT_GREETINGS[langCode] || COPILOT_GREETINGS.en),
          action: data.action || null,
          suggestedPrompts: data.suggestedPrompts || []
        }
      ]);

      // Automatically execute autonomous action if returned
      if (data.action && data.action.type && data.action.type !== 'none') {
        executeAgentAction(data.action, text, data.reply);
      }
    } catch (err) {
      console.warn('[LegalLensAgent] Network or backend error, utilizing client-side intent execution:', err.message);

      const lower = text.toLowerCase();
      let detectedLang = null;
      if (/telugu|తెలుగు|telugulo/i.test(lower)) detectedLang = 'te';
      else if (/hindi|हिन्दी|हिंदी|hindime|hindi me/i.test(lower)) detectedLang = 'hi';
      else if (/tamil|தமிழ்|tamilil/i.test(lower)) detectedLang = 'ta';
      else if (/kannada|ಕನ್ನಡ|kannadadalli/i.test(lower)) detectedLang = 'kn';
      else if (/malayalam|മലയാളം|malayalamil/i.test(lower)) detectedLang = 'ml';
      else if (/marathi|मराठी|marathit/i.test(lower)) detectedLang = 'mr';
      else if (/bengali|বাংলা|bangla/i.test(lower)) detectedLang = 'bn';
      else if (/english|angrezi/i.test(lower)) detectedLang = 'en';

      let fallbackReply = COPILOT_GREETINGS[langCode] || COPILOT_GREETINGS.en;
      let fallbackAction = null;

      if (detectedLang) {
        selectLanguage(detectedLang);
        fallbackReply = LANGUAGE_CHANGED_NOTICES[detectedLang] || LANGUAGE_CHANGED_NOTICES.en;
        fallbackAction = {
          type: 'switch_language',
          data: { languageCode: detectedLang },
          label: `Switched to ${detectedLang.toUpperCase()}`
        };
      } else if (/https?:\/\/[^\s]+/i.test(text)) {
        const foundUrl = text.match(/https?:\/\/[^\s]+/i)[0];
        fallbackReply = `Starting Terms & Conditions analysis for ${foundUrl}...`;
        fallbackAction = {
          type: 'analyze_terms',
          targetRoute: '/terms',
          data: { mode: 'url', url: foundUrl },
          label: 'Analyze Terms URL'
        };
        executeAgentAction(fallbackAction, text, fallbackReply);
      } else if (/dashboard|డ్యాష్‌బోర్డ్|डैशबोर्ड|chupinchu|kholo/i.test(lower)) {
        fallbackReply = "Opening your personal LegalLens dashboard...";
        fallbackAction = { type: 'navigate', targetRoute: '/dashboard', label: 'Go to Dashboard' };
        executeAgentAction(fallbackAction, text, fallbackReply);
      } else if (/glossary|నిఘంటువు|शब्दावली|indemnity|force majeure/i.test(lower)) {
        fallbackReply = "Opening the Legal Glossary for plain-language definitions...";
        fallbackAction = { type: 'open_glossary', data: { searchTerm: 'indemnity' }, label: 'Open Glossary' };
        executeAgentAction(fallbackAction, text, fallbackReply);
      } else if (/upload|అప్‌లోడ్|अपलोड/i.test(lower)) {
        fallbackReply = "Navigating to Document Upload for contract analysis & OCR...";
        fallbackAction = { type: 'navigate', targetRoute: '/upload', label: 'Go to Upload' };
        executeAgentAction(fallbackAction, text, fallbackReply);
      } else if (/compare|పోలిక|तुलना/i.test(lower)) {
        fallbackReply = "Opening Document Comparison to review version diffs...";
        fallbackAction = { type: 'navigate', targetRoute: '/compare', label: 'Go to Comparison' };
        executeAgentAction(fallbackAction, text, fallbackReply);
      } else if (/terms|saas|నిబంధన|शर्त/i.test(lower)) {
        fallbackReply = "Loading the Terms & Conditions Analyzer...";
        fallbackAction = { type: 'analyze_terms', targetRoute: '/terms', data: { mode: 'demo', demoId: 'saas-terms' }, label: 'Analyze Terms' };
        executeAgentAction(fallbackAction, text, fallbackReply);
      } else if (/deposit|rent|landlord|consumer|refund|notice|धारा|చట్టం/i.test(lower)) {
        fallbackReply = "Under Indian statutes (e.g. Model Tenancy Act, Consumer Protection Act 2019), rights are legally protected. Opening Legal Assistant with grounded statutory references...";
        fallbackAction = { type: 'ask_assistant', targetRoute: '/legal-assistant', data: { question: text, category: 'consumer' }, label: 'Ask Legal Assistant' };
        executeAgentAction(fallbackAction, text, fallbackReply);
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'bot-fallback-' + Date.now(),
          role: 'assistant',
          content: fallbackReply,
          action: fallbackAction,
          suggestedPrompts: sectionPrompts
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Global event listener & keyboard shortcut (Ctrl + /) so any part of the app can open the agent
  useEffect(() => {
    const handleOpenEvent = (event) => {
      setIsOpen(true);
      setIsMinimized(false);
      setShowTipBubble(false);
      if (event?.detail?.prompt) {
        setTimeout(() => {
          handleSendMessage(event.detail.prompt);
        }, 100);
      }
    };

    const handleKeyDown = (e) => {
      // Toggle agent on Ctrl + / or Cmd + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setIsMinimized(false);
        setShowTipBubble(false);
      }
    };

    window.addEventListener('open-legallens-agent', handleOpenEvent);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-legallens-agent', handleOpenEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [messages, loading, langCode]);

  const handleActionClick = (action) => {
    if (!action) return;
    executeAgentAction(action, '', '');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'init-fresh',
        role: 'assistant',
        content: COPILOT_GREETINGS[langCode] || COPILOT_GREETINGS.en,
        action: null,
        suggestedPrompts: sectionPrompts
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] no-print flex flex-col items-end pointer-events-none">
      {/* 1. PROACTIVE CONTEXT SPEECH BUBBLE (Visible when Copilot is closed) */}
      {!isOpen && showTipBubble && (
        <div 
          role="region"
          aria-label="LegalLens AI Copilot Helper Tip"
          className="mb-3 w-[290px] sm:w-[330px] bg-white rounded-2xl border-3 border-black shadow-[6px_6px_0px_#000000] p-3.5 text-left relative animate-in fade-in slide-in-from-bottom-2 duration-200 select-none pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-1.5 border-b-2 border-black/10 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-[#7c3aed] text-amber-300 border border-black flex items-center justify-center font-bold text-[11px] shadow-2xs shrink-0">
                🤖
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#7c3aed] font-mono truncate">
                {t('nav.copilot', 'Copilot')} • {currentSection.title}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTipBubble(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-black hover:bg-slate-100 cursor-pointer transition shrink-0 ml-1"
              title="Dismiss tip"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <p 
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setShowTipBubble(false);
            }}
            className="text-xs font-bold text-black leading-snug cursor-pointer hover:text-[#7c3aed] transition line-clamp-3"
          >
            {currentSection.tip}
          </p>

          <div className="mt-2.5 flex items-center justify-between pt-2 border-t-2 border-black/10">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
                setShowTipBubble(false);
              }}
              className="text-xs font-black text-[#7c3aed] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('scorecard.askCopilot', 'Ask Copilot a question')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              Ctrl + /
            </span>
          </div>

          {/* Downward pointing speech triangle directed at launcher button */}
          <div className="absolute -bottom-2.5 right-10 w-4 h-4 bg-white border-b-3 border-r-3 border-black rotate-45"></div>
        </div>
      )}

      {/* 2. OPEN COPILOT WINDOW */}
      {isOpen ? (
        <div 
          className={`bg-[#fcfaf2] rounded-2xl border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col overflow-hidden transition-all duration-200 pointer-events-auto ${
            isMinimized 
              ? 'w-72 h-14' 
              : 'w-[94vw] sm:w-[430px] h-[590px] max-h-[85vh]'
          }`}
        >
          {/* High-Contrast Electric Purple Header */}
          <div className="px-4 py-3 bg-[#7c3aed] border-b-3 border-black flex items-center justify-between select-none text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-black shadow-neo-sm flex items-center justify-center text-black shrink-0">
                <Bot className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-white uppercase tracking-tight truncate">
                    {t('nav.copilot', 'LegalLens Copilot')}
                  </h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse shrink-0"></span>
                </div>
                <span className="text-[10px] font-bold text-purple-200 font-mono block -mt-0.5 truncate">
                  {currentLanguage.native} • {t('agent.activeEverywhere', 'Active Everywhere')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg border-2 border-black bg-white hover:bg-slate-100 text-black shadow-neo-sm cursor-pointer transition"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border-2 border-black bg-amber-400 hover:bg-amber-300 text-black shadow-neo-sm cursor-pointer transition"
                title="Close Copilot"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Current Context Pill Bar */}
              <div className="px-3.5 py-1.5 bg-white border-b-2 border-black flex items-center justify-between text-[11px] min-w-0">
                <div className="flex items-center gap-1.5 font-black text-black min-w-0 truncate">
                  <span>{currentSection.icon}</span>
                  <span className="font-mono text-slate-500 shrink-0">{t('agent.section', 'Section')}:</span>
                  <span className="bg-purple-100 px-2 py-0.5 rounded border border-purple-300 text-purple-900 font-bold truncate">
                    {currentSection.title}
                  </span>
                </div>
                <button
                  onClick={clearChat}
                  className="text-[10px] font-bold text-slate-500 hover:text-black flex items-center gap-1 hover:underline cursor-pointer shrink-0 ml-2"
                  title="Clear chat history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('dash.delete', 'Clear')}</span>
                </button>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div 
                        className={`p-3 rounded-2xl border-2 border-black max-w-[88%] text-xs leading-relaxed ${
                          isUser 
                            ? 'bg-amber-300 text-black font-bold shadow-neo-sm rounded-br-xs' 
                            : 'bg-white text-black font-semibold shadow-neo-sm rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="whitespace-pre-wrap flex-1">{m.content}</p>
                          {!isUser && (
                            <VoiceOutputButton text={m.content} showLabel={false} buttonClass="p-1 shrink-0" />
                          )}
                        </div>

                        {/* Interactive Task / Navigation Action Button */}
                        {m.action && m.action.type && m.action.type !== 'none' && (
                          <div className="mt-2.5 pt-2 border-t-2 border-black/15">
                            <button
                              type="button"
                              onClick={() => handleActionClick(m.action)}
                              className="w-full py-2 px-3 rounded-xl border-2 border-black bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span className="truncate">{m.action.label || `Execute Task (${m.action.type})`}</span>
                              <ArrowRight className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Suggested Prompts underneath Assistant Response */}
                      {!isUser && m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-[90%] pt-0.5">
                          {m.suggestedPrompts.map((promptText, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(promptText)}
                              className="px-2 py-0.5 rounded-lg border border-black bg-white hover:bg-amber-200 text-[10px] font-black text-black shadow-2xs hover:shadow-none transition cursor-pointer text-left"
                            >
                              💡 {promptText}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-black bg-white shadow-neo-sm max-w-[75%]">
                    <span className="w-3 h-3 rounded-full bg-[#7c3aed] animate-ping"></span>
                    <span className="text-[11px] font-black text-black">
                      {t('terms.analyzingBtn', 'Copilot is thinking...')}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Section Prompts Bar */}
              <div className="px-3 py-1.5 bg-purple-50/80 border-t-2 border-black flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-thin">
                <span className="font-mono font-black uppercase text-purple-900 shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#7c3aed]" />
                  {t('agent.quick', 'Quick')}:
                </span>
                {sectionPrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(sp)}
                    className="px-2 py-0.5 rounded-md border border-black bg-white hover:bg-amber-300 text-black whitespace-nowrap font-bold cursor-pointer shadow-2xs hover:shadow-none transition"
                  >
                    {sp}
                  </button>
                ))}
              </div>

              {/* Input Form with Voice Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-2.5 bg-white border-t-2 border-black flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`${t('agent.placeholder', 'Ask a doubt or task')} (${currentSection.title})...`}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-[#fcfaf2] text-black shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  disabled={loading}
                />
                <VoiceInputButton
                  onTranscript={(transcript) => {
                    setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
                  }}
                  buttonClass="p-2"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="p-2 rounded-xl border-2 border-black bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-slate-200 text-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer disabled:cursor-not-allowed"
                  title="Send to Copilot"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>

              {/* Keyboard shortcut footnote */}
              <div className="px-3 py-1 bg-slate-100 border-t border-black/10 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>💡 {t('agent.enterToSend', 'Enter to send')}</span>
                <span>{t('agent.shortcut', 'Shortcut: Ctrl + /')}</span>
              </div>
            </>
          )}
        </div>
      ) : (
        /* 3. ULTRA-VISIBLE HIGH-CONTRAST FLOATING LAUNCHER BUTTON */
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            setShowTipBubble(false);
          }}
          className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border-3 border-black bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-xs sm:text-sm shadow-[5px_5px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000000] transition-all flex items-center gap-3 cursor-pointer ring-4 ring-purple-400/40 select-none animate-in fade-in pointer-events-auto"
          title="Open LegalLens AI Copilot (Shortcut: Ctrl + /)"
          aria-label="Open LegalLens AI Copilot"
        >
          {/* Double Pulsing Radar Glow Indicator */}
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-85"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-black"></span>
          </span>

          {/* Bot Icon with Amber Badge */}
          <div className="w-7 h-7 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-neo-sm group-hover:rotate-12 transition">
            <Bot className="w-4 h-4 stroke-[2.5]" />
          </div>

          {/* Label & Active State */}
          <div className="flex flex-col items-start text-left leading-none">
            <span className="tracking-tight uppercase text-xs font-black text-white flex items-center gap-1.5">
              {t('nav.copilot', 'AI Copilot')}
              <span className="text-[11px] text-amber-300">✨</span>
            </span>
            <span className="text-[9px] text-purple-200 font-bold font-mono mt-0.5">
              {currentLanguage.native} {t('agent.active', 'Active')}
            </span>
          </div>

          {/* Current Page Context Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-white/20 text-amber-300 text-[10px] font-mono font-bold ml-0.5">
            <span>{currentSection.icon}</span>
            <span className="max-w-[110px] truncate">{currentSection.title}</span>
          </span>
        </button>
      )}
    </div>
  );
}
