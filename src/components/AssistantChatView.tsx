import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { ChatMessage } from "../types";
import { Language, TRANSLATIONS } from "../utils/translations";

interface AssistantChatViewProps {
  currentLang: Language;
}

export const AssistantChatView: React.FC<AssistantChatViewProps> = ({
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  const initialMessages: ChatMessage[] = [
    {
      id: "msg-welcome-1",
      sender: "assistant",
      text:
        currentLang === "en"
          ? "Vanakkam! I am your HarvestShield AI Agronomy Assistant, developed for the JALLIKATTU 5.0 Agri-Tech Hackathon (NABARD MABIF). How can I assist you today with post-harvest preservation, Zero Energy Cool Chambers (ZECC), curing, or transportation precautions?"
          : "வணக்கம்! நான் உங்கள் ஹார்வெஸ்ட் ஷீல்ட் AI வேளாண் உதவியாளர் (NABARD MABIF ஜல்லிக்கட்டு 5.0). அறுவடைக்குப் பிந்தைய சேமிப்பு, குளிர் அறை, தக்காளி, வெங்காயம், வாழைப்பழம் பாதுகாப்பு பற்றி எதையும் என்னிடம் தமிழில் கேளுங்கள்!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptChips =
    currentLang === "en"
      ? [
          "How to prevent tomato rotting in hot summer without cold storage?",
          "How does Zero Energy Cool Chamber (ZECC) work?",
          "How to properly cure onions before long storage?",
          "What causes banana crown rot and how to prevent it?",
          "How to reduce transport losses on long journeys?",
        ]
      : [
          "வெங்காயம் அழுகாமல் நீண்ட நாட்கள் சேமிப்பது எப்படி?",
          "தக்காளி கோடையில் அழுகாமல் காக்க எளிய முறை என்ன?",
          "ஜீரோ எனர்ஜி கூல் சேம்பர் (ZECC) எப்படி அமைப்பது?",
          "மாம்பழத்தில் பால் வடியாமல் அறுவடை செய்வது எப்படி?",
          "வாழைப்பழத்தை தூரத்து சந்தைக்கு அனுப்பும்போது செய்ய வேண்டியவை?",
        ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setErrorMsg(null);

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
          language: currentLang,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "I apologize, I could not generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Chatbot error:", err);
      setErrorMsg(
        err.message || "Failed to communicate with HarvestShield Assistant. Please retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(initialMessages);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Bilingual Agronomy AI
            </span>
            <span className="text-xs font-semibold text-stone-500">
              English • தமிழ் (Tamil)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.assistant.title}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {t.assistant.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer self-start md:self-center border border-stone-200"
        >
          {t.assistant.clearChat}
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-emerald-700 text-emerald-100 shadow-xs"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-emerald-800 text-white rounded-tr-xs shadow-xs"
                      : "bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs shadow-2xs"
                  }`}
                >
                  <div className="whitespace-pre-line text-[13.5px]">
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10px] mt-1.5 font-medium ${
                      isUser ? "text-emerald-200 text-right" : "text-stone-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 rounded-tl-xs shadow-2xs flex items-center gap-2 text-stone-600 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>
                  {currentLang === "en"
                    ? "Consulting post-harvest agronomy knowledge..."
                    : "வேளாண் பாதுகாப்பு ஆலோசனையைத் தயார் செய்கிறது..."}
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips Bar */}
        <div className="p-3 bg-white border-t border-stone-200 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 px-1">
            {currentLang === "en" ? "Suggestions:" : "பரிந்துரைகள்:"}
          </span>
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="text-xs bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200 whitespace-nowrap transition-all cursor-pointer font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.assistant.placeholder}
            className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              !inputText.trim() || isLoading
                ? "bg-stone-300 cursor-not-allowed text-stone-500"
                : "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900"
            }`}
          >
            <span>{t.assistant.send}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Agronomy Disclaimer Footer */}
        <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{t.assistant.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
