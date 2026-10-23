import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  User,
  Sparkles,
  RefreshCw,
  MessageSquare,
  MinusCircle,
  HelpCircle,
  Globe,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { ChatMessage } from "../types";
import { Language } from "../utils/translations";

interface FloatingChatbotProps {
  currentLang: Language;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  currentLang: appLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatLang, setChatLang] = useState<Language>(appLang);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const initialWelcomeText =
    chatLang === "ta"
      ? "வணக்கம்! நான் உங்கள் ஹார்வெஸ்ட் ஷீல்ட் AI உதவியாளர். அறுவடை சேமிப்பு, அழுகல் தவிர்ப்பு, ஜீரோ எனர்ஜி கூல் சேம்பர் (ZECC) பற்றி தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்!"
      : "Vanakkam! I am your HarvestShield Gemini Agronomy Assistant. Ask me anything about post-harvest preservation, Zero Energy Cool Chambers (ZECC), onion curing, or storage temperatures in English or தமிழ்!";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "float-welcome",
      sender: "assistant",
      text: initialWelcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initial welcome when lang changes if only 1 message exists
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          id: "float-welcome",
          sender: "assistant",
          text:
            chatLang === "ta"
              ? "வணக்கம்! நான் உங்கள் ஹார்வெஸ்ட் ஷீல்ட் AI உதவியாளர். அறுவடை சேமிப்பு, அழுகல் தவிர்ப்பு, ஜீரோ எனர்ஜி கூல் சேம்பர் (ZECC) பற்றி தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்!"
              : "Vanakkam! I am your HarvestShield Gemini Agronomy Assistant. Ask me anything about post-harvest preservation, Zero Energy Cool Chambers (ZECC), onion curing, or storage temperatures in English or தமிழ்!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [chatLang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const promptChips =
    chatLang === "ta"
      ? [
          "தக்காளி அழுகாமல் காப்பது எப்படி?",
          "வெங்காயத்தை நீண்ட நாட்கள் சேமிப்பது எப்படி?",
          "ZECC குளிர் அறை அமைப்பது எப்படி?",
          "வாழைப்பழம் கருப்பாகாமல் தடுப்பது எப்படி?",
        ]
      : [
          "How to prevent tomato rot without cold storage?",
          "What is Zero Energy Cool Chamber (ZECC)?",
          "How to cure onions before storage?",
          "How to prevent banana transit bruising?",
        ];

  const handleSend = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.text,
      }));

      const res = await fetch("/api/gemini/assistant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: historyPayload,
          language: chatLang,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get answer from assistant");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "I could not generate an answer right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "assistant",
          text:
            chatLang === "ta"
              ? "மன்னிக்கவும், தகவலைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
              : "Sorry, I could not complete the request. Please verify connection and retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-emerald-400/40 ring-4 ring-emerald-950/10 active:scale-95"
          aria-label="Open HarvestShield Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black relative">
            <Bot className="w-5 h-5 text-stone-950" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
              <span>HarvestShield Assistant</span>
              <span className="bg-amber-400/90 text-stone-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                Gemini
              </span>
            </div>
            <div className="text-[10px] text-emerald-200 font-semibold flex items-center gap-1">
              <span>தமிழ் • English AI Help</span>
            </div>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col transition-all duration-300 ${
            isExpanded
              ? "w-[94vw] sm:w-[600px] h-[85vh] fixed bottom-4 right-4"
              : "w-[92vw] sm:w-[420px] h-[560px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-3.5 flex items-center justify-between border-b border-emerald-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black">
                <Bot className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  <span>HarvestShield Assistant</span>
                  <span className="bg-emerald-700 text-emerald-100 text-[9px] font-bold px-1.5 py-0.2 rounded">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <div className="text-[10px] text-emerald-200 font-medium">
                  {chatLang === "ta" ? "வேளாண் பாதுகாப்பு உதவியாளர்" : "Bilingual Post-Harvest Agronomy"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Inline Language Selector */}
              <div className="flex items-center bg-emerald-950/60 p-0.5 rounded-lg border border-emerald-700/50">
                <button
                  type="button"
                  onClick={() => setChatLang("en")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                    chatLang === "en" ? "bg-amber-400 text-stone-950" : "text-emerald-200 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setChatLang("ta")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all font-tamil ${
                    chatLang === "ta" ? "bg-amber-400 text-stone-950" : "text-emerald-200 hover:text-white"
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg cursor-pointer"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/60 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-stone-900 text-white"
                        : "bg-emerald-800 text-emerald-100"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-xl p-3 leading-relaxed ${
                      isUser
                        ? "bg-emerald-800 text-white rounded-tr-xs"
                        : "bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs shadow-2xs"
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs font-normal">
                      {m.text}
                    </div>
                    <div
                      className={`text-[9.5px] mt-1 ${
                        isUser ? "text-emerald-200 text-right" : "text-stone-400"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-500 bg-white p-2.5 rounded-xl border border-stone-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span className="text-[11px]">
                  {chatLang === "ta" ? "ஆலோசனையை உருவாக்குகிறது..." : "Formulating agronomic advice..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="p-2 bg-white border-t border-stone-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="text-[10px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200 whitespace-nowrap transition-colors cursor-pointer font-medium"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                chatLang === "ta"
                  ? "கேள்வியைத் தட்டச்சு செய்க..."
                  : "Ask about ZECC, storage, spoilage..."
              }
              className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
                !inputText.trim() || isLoading
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
