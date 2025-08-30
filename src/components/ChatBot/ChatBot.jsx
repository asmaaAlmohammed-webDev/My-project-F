import { useState, useRef, useEffect } from "react";
import "./ChatBot.css";

const keywordResponses = [
  {
    keywords: ["services", "offer", "خدمات", "تقدم"],
    response: {
      en: "We provide book purchasing in multiple ways, a wide variety of categories, and you can search your favorite books in the 'Shop' section. We also have a 'New Arrivals' section, a 'Popular Books' section, and discounts. If you have suggestions or feedback, please visit 'Contact Us' ✨",
      ar: "نقدم خدمة شراء كتب بعدة طرق ولدينا أصناف متعددة من الكتب مع إمكانية البحث عن كتابك المفضل ضمن قسم Shop. ونوفر قسم للكتب التي وصلت حديثاً وقسم للكتب الأكثر شهرة مع ميزة الحسومات. إذا كان لديك أي اقتراح أو ملاحظة قدمها لنا اذهب لقسم Contact Us وأرسل لنا ملاحظاتك ✨",
    },
  },
  {
    keywords: ["buy steps", "purchase steps", "خطوات شراء", "شراء كتاب"],
    response: {
      en: "Steps to buy a book: 1) Create an account. 2) Go to the Shop page and select a book. 3) Add it to your cart. 4) Review your cart, remove or update quantities. 5) Enter your address details. 6) Confirm the order. After confirmation, an invoice will show with your order details.",
      ar: "خطوات شراء كتاب: أولاً عليك تسجيل حساب ضمن الموقع ثم اذهب لصفحة Shop واختر كتاب وأضفه للسلة. اذهب للسلة، احذف كتاب أو عدل الكمية وأدخل تفاصيل عنوانك وأكد الطلب. بعد تأكيد الطلب ستظهر فاتورة تضم تفاصيل طلبك.",
    },
  },
  // {
  //   keywords: ["popular books", "famous books", "الأكثر شهرة", "كتب مشهورة"],
  //   response: {
  //     en: "Yes, we have a 'Popular Books' section in the Home page.",
  //     ar: "نعم لدينا بصفحة Home.",
  //   },
  // },
  {
    keywords: [
      "contact admin",
      "message admin",
      "contact us",
      "الادارة",
      "رسالة للادارة",
    ],
    response: {
      en: "You can send your message in the 'Contact Us' section.",
      ar: "أرسل رسالتك ضمن Contact Us.",
    },
  },
  {
    keywords: ["discount", "offers", "sales", "خصومات", "عروض", "حسومات"],
    response: {
      en: "Yes, we have a discounts and offers section. 🔸🔸",
      ar: "نعم، لدينا قسم للحسومات والعروض. 🔸🔸",
    },
  },
  {
    keywords: ["search", "find book", "بحث", "ابحث عن كتاب"],
    response: {
      en: "Create an account, then go to the Shop section and search for your book.",
      ar: "سجل حساب بالموقع، ثم اذهب لصفحة Shop وابحث عن كتابك.",
    },
  },
  // {
  //   keywords: [
  //     "shipping",
  //     "delivery",
  //     "international shipping",
  //     "شحن",
  //     "محلي",
  //     "دولي",
  //   ],
  //   response: {
  //     en: "Currently we only provide local shipping.",
  //     ar: "حالياً نقدم محلي فقط.",
  //   },
  // },
  {
    keywords: ["delivery time", "مدة التوصيل", "الوقت", "التوصيل"],
    response: {
      en: "Delivery takes 1–2 days.",
      ar: "من يوم إلى يومان.",
    },
  },
  {
    keywords: ["cash on delivery", "pay on delivery", "الدفع عند الاستلام"],
    response: {
      en: "Yes, cash on delivery is available.",
      ar: "نعم يمكنك.",
    },
  },
  // {
  //   keywords: ["children books", "kids books", "كتب أطفال"],
  //   response: {
  //     en: "Yes, we have a children's books section.",
  //     ar: "نعم لدينا.",
  //   },
  // },
  {
    keywords: ["unavailable books", "rare books", "طلبات", "كتب غير متوفرة"],
    response: {
      en: "Yes, you can send us a request message for unavailable books.",
      ar: "نعم، أرسل اقتراحك برسالة.",
    },
  },
  {
    keywords: ["rate website", "review", "تقييم", "قيم الموقع"],
    response: {
      en: "Yes, you can rate the website out of 5 stars. Go to your profile and submit your rating.",
      ar: "نعم، قيم الموقع من خمس نجوم، اذهب لبروفايلك وأرسل التقييم.",
    },
  },
  {
    keywords: ["author search", "search by author", "اسم الكاتب", "ابحث كاتب"],
    response: {
      en: "Yes, you can search books by author name in the Shop page.",
      ar: "نعم بالتأكيد، اذهب لصفحة Shop وابحث عن كتابك من خلال اسم الكاتب.",
    },
  },
];
export default function ChatBot({ isOpen, onClose }) {
  const [botLang, setBotLang] = useState("ar");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = {
    ar: [
      "ماهي الخدمات التي تقدمونها؟",
      "ماهي خطوات شراء كتاب؟",
      // "هل لديكم قسم للكتب الاكثر شهرة؟",
      "كيف يمكنني ارسال رسالة للادارة؟",
      "هل لديكم قسم للحسومات والعروض؟",
      "كيف يمكنني البحث عن كتاب؟",
      // "هل تقدمون شحن دولي ام محلي فقط؟",
      "كم تستغرق مدة التوصيل؟",
      "هل يمكنني الدفع عند الاستلام؟",
      // "هل لديكم قسم لكتب الاطفال؟",
      "هل تقبلون طلبات الكتب الغير متوفرة لديكم؟",
      "هل يمكنني تقييم الموقع؟",
      "هل يمكنني البحث عن كتاب من خلال اسم الكاتب وكيف؟",
    ],
    en: [
      "What services do you offer?",
      "What are the steps to buy a book?",
      // "Do you have a section for popular books?",
      "How can I send a message to the administration?",
      "Do you have a section for discounts and offers?",
      "How can I search for a book?",
      // "Do you provide international or only local shipping?",
      "How long does delivery take?",
      "Can I pay on delivery?",
      // "Do you have a children's books section?",
      "Do you accept requests for unavailable books?",
      "Can I rate the website?",
      "Can I search for a book by author name?",
    ],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findKeywordResponse = (text) => {
    const lower = text.toLowerCase();
    for (const item of keywordResponses) {
      for (const kw of item.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return item.response[botLang];
        }
      }
    }
    return botLang === "ar"
      ? "عذراً، لم أفهم سؤالك. حاول صياغته بطريقة أخرى."
      : "Sorry, I don’t have info about that. Can you rephrase?";
  };

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const reply = findKeywordResponse(userMsg.content);
      const botMsg = {
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (q) => {
    setInput(q);
    setTimeout(sendMessage, 100);
  };

  if (!isOpen) return null;
  const isRTL = botLang === "ar";

  return (
    <div className={`chatbot-container ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="chatbot-header">
        <span>{botLang === "ar" ? "اسأل ليتوو" : "Ask Letto"}</span>
        <div className="chatbot-actions">
          <button
            onClick={() => setBotLang(botLang === "ar" ? "en" : "ar")}
            className="lang-toggle"
          >
            {botLang === "ar" ? "EN" : "AR"}
          </button>
          <button className="exit-bot" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <div className="chatbot-intro">
            <p>
              {botLang === "ar"
                ? "مرحباً! 👋 كيف يمكنني مساعدتك؟"
                : "Hello! 👋 How can I help you?"}
            </p>
            <p className="intro-sub">
              {botLang === "ar"
                ? "اسألني عن الكتب أو الخدمات"
                : "Ask me about our books or services"}
            </p>
            <div className="suggested-list">
              {suggestedQuestions[botLang].map((q, i) => (
                <button
                  key={i}
                  className="suggested-question"
                  onClick={() => handleSuggestionClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${
                msg.role === "user" ? "user" : "assistant"
              }`}
            >
              <p>{msg.content}</p>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant">
            <div className="typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chatbot-input">
        <input
          type="text"
          placeholder={
            botLang === "ar" ? "اكتب رسالتك هنا..." : "Type your message..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          dir={isRTL ? "rtl" : "ltr"}
        />
        <button onClick={sendMessage} disabled={!input.trim() || isLoading}>
          ➤
        </button>
      </div>
    </div>
  );
}
