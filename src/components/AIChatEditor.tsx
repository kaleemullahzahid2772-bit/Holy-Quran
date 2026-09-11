import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  History,
  CornerDownLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, ProjectTimeline, InstitutionProfile, ReferenceStyleProfile } from '../types/editor';
import { api } from '../services/api';

interface AIChatEditorProps {
  currentTimeline: ProjectTimeline;
  institutionProfile: InstitutionProfile;
  referenceStyle: ReferenceStyleProfile | null;
  onApplyTimelineMutation: (mutatedTimeline: ProjectTimeline, explanation: string, actionType: string) => void;
  onDeductCredits: (remaining: number) => void;
  selectedElementId?: string | null;
}

const QUICK_PROMPTS = [
  { label: 'پروفیشنل بنا دو', text: 'اس ویڈیو کو تھوڑا زیادہ پروفیشنل بنا دو۔', lang: 'ur' },
  { label: 'شروع چھوٹا کرو', text: 'شروع والا حصہ تھوڑا چھوٹا کر دو۔', lang: 'ur' },
  { label: 'کلپ 3 پہلے لاؤ', text: 'تیسرے کلپ کو پہلے لے آؤ۔', lang: 'ur' },
  { label: 'Transitions کم کرو', text: 'Transitions کم کر دو، باقی سب ویسا ہی رہنے دو۔', lang: 'ur' },
  { label: 'ادارے کی تصویر شروع میں', text: 'میرے ادارے کی تصویر شروع میں لگا دو۔', lang: 'ur' },
  { label: 'ادارے والا Background', text: 'یہ والا background اچھا نہیں لگ رہا، میرے ادارے والا لگا دو۔', lang: 'ur' },
  { label: 'ریفرنس جیسا Intro', text: 'Reference video جیسا intro کر دو۔', lang: 'ur' },
  { label: 'Roman: shuru chota kardo', text: 'shuru wala hissa thora chota kardo', lang: 'roman_ur' },
  { label: 'Make More Cinematic', text: 'Make the video more cinematic and adjust transitions.', lang: 'en' }
];

export const AIChatEditor: React.FC<AIChatEditorProps> = ({
  currentTimeline,
  institutionProfile,
  referenceStyle,
  onApplyTimelineMutation,
  onDeductCredits,
  selectedElementId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: 'السلام علیکم! میں آپ کا AI ویڈیو ایڈیٹر ہوں۔ آپ مجھ سے اردو، رومن اردو یا انگریزی میں بات کر سکتے ہیں۔ آپ جو بھی تبدیلی چاہیں مجھے بتائیں، میں بغیر پروجیکٹ ری سیٹ کیے ٹائم لائن کو اپ ڈیٹ کر دوں گا۔\n\n(Hello! I am your AI Video Editor. Ask me anything in Urdu, Roman Urdu, or English to adjust your video.)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'ur'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || isProcessing) return;

    const userMessageId = 'msg_u_' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputMsg('');
    setIsProcessing(true);

    try {
      const res = await api.chatEdit({
        message: text,
        currentTimeline,
        institutionProfile,
        referenceStyle,
        selectedElementId
      });

      if (res.success) {
        const aiReply: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          text: res.explanation,
          actionType: res.actionType,
          language: res.language as any,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiReply]);
        onApplyTimelineMutation(res.mutatedTimeline, res.explanation, res.actionType);
        onDeductCredits(res.remainingCredits);
      }
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errorReply: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'system',
        text: `Error: ${err.message || 'Failed to apply AI revision.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech Recognition support (Urdu / English)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ur-PK'; // Urdu recognition, supports Roman/English accents
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMsg(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">Conversational AI Editor</h3>
            <span className="text-[10px] text-slate-400">Urdu • Roman Urdu • English (5 Credits)</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/20 flex gap-1.5 overflow-x-auto">
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.text)}
            className="shrink-0 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 rounded-full px-2.5 py-1 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const isSys = msg.sender === 'system';
          const isUrdu = /[\u0600-\u06FF]/.test(msg.text);

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAi || isSys ? 'items-start' : 'items-end flex-row-reverse'}`}
            >
              <div
                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                  isAi
                    ? 'bg-emerald-600 text-white'
                    : isSys
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                  isAi
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                    : isSys
                    ? 'bg-red-950/60 text-red-200 border border-red-500/40 rounded-tl-sm'
                    : 'bg-emerald-600 text-white rounded-tr-sm'
                }`}
              >
                <p
                  className={`leading-relaxed whitespace-pre-line ${
                    isUrdu ? 'font-urdu text-right text-sm leading-6' : 'font-sans'
                  }`}
                  dir={isUrdu ? 'rtl' : 'ltr'}
                >
                  {msg.text}
                </p>

                {msg.actionType && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-700/60 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Applied: {msg.actionType.replace(/_/g, ' ')}</span>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1 ${
                    isAi ? 'text-slate-400' : 'text-emerald-100/70'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs flex items-center gap-2 border border-slate-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>AI is reviewing context and updating timeline...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-emerald-500 rounded-xl px-2.5 py-1.5 transition"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Listening (Urdu/English)... Click to stop' : 'Voice command in Urdu or English'}
            className={`p-1.5 rounded-lg transition ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="کہیں: 'تیسرے کلپ کو پہلے لے آؤ' or 'make it more cinematic'..."
            className="flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!inputMsg.trim() || isProcessing}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
