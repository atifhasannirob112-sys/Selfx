import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Trash2, RefreshCw, Paperclip, FileText, 
  Image as ImageIcon, X, ArrowUpRight, Code, MessageSquare, 
  BookOpen, Compass, ClipboardCheck 
} from 'lucide-react';
import { triggerNotification } from '../utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  fileName?: string;
  hasImage?: boolean;
}

export default function PowerAiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('lookmax_power_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        content: `হেলো চ্যাম্পিয়ন দোস্ত! আমি তোর **Lookmax Elite Power AI** বেস্ট ফ্রেন্ড ও পাওয়ার মেন্টর। ⚡

আজকে তোর ক্যারিয়ার, কোডিং, কনটেন্ট বানানো বা গ্লো-আপ নিয়ে কী সাপোর্ট লাগবে বল ভাই? তোর সমস্ত কাজের গাইড হয়ে আমি আছি!

**এখানে তুই কী কী করতে পারবি:**
* 💻 **এডভান্সড কোডিং ও ডেভেলপমেন্ট**: যেকোনো কোড রিভিউ বা নতুন স্ক্রিপ্ট বানিয়ে দেব।
* 📝 **কনটেন্ট রাইটিং**: ইউটিউব ভিডিও স্ক্রিপ্ট, ক্যাপশন বা পোস্ট লিখন।
* 📎 **ফাইল ও ফটো এনালাইসিস**: যেকোনো ইমেজ বা ফাইল আপলোড করে সাজেশন নে।
* 🎯 **ডেইলি রোডম্যাপ**: আজকের কাজের কঠিন ফোকাস প্ল্যান তৈরি কর।

নিচের যেকোনো প্রম্পটে ক্লিক কর অথবা মন খুলে যা ইচ্ছা জিজ্ঞেস কর দোস্ত!`
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // File Attachments
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [attachedFileContent, setAttachedFileContent] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState<string | null>(null);
  const [attachedFileType, setAttachedFileType] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('lookmax_power_chat', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const isImg = fileType.startsWith('image/');

    // Size check: Limit to 10MB client-side to allow high-fidelity media files
    if (file.size > 10 * 1024 * 1024) {
      triggerNotification("⚠️ File Too Large", "Please attach a file smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedFileBase64(dataUrl);
      setAttachedFileType(file.type || 'application/octet-stream');
      setAttachedFileName(file.name);

      if (isImg) {
        setAttachedImageBase64(dataUrl);
        setAttachedImageName(file.name);
        setAttachedFileContent(null);
        triggerNotification("📎 Image Attached", `"${file.name}" is ready to be sent to chat.`);
      } else {
        const isText = file.type.startsWith('text/') || 
                       file.name.endsWith('.ts') || 
                       file.name.endsWith('.tsx') || 
                       file.name.endsWith('.js') || 
                       file.name.endsWith('.json') || 
                       file.name.endsWith('.css') || 
                       file.name.endsWith('.html') || 
                       file.name.endsWith('.md') || 
                       file.name.endsWith('.csv') || 
                       file.name.endsWith('.py');
        if (isText) {
          const textReader = new FileReader();
          textReader.onload = () => {
            setAttachedFileContent(textReader.result as string);
            triggerNotification("📎 Text File Attached", `"${file.name}" content read successfully.`);
          };
          textReader.readAsText(file);
        } else {
          setAttachedFileContent(null);
          triggerNotification("📎 Document Attached", `"${file.name}" attached successfully.`);
        }
        setAttachedImageBase64(null);
        setAttachedImageName(null);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be reloaded
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedImageBase64(null);
    setAttachedImageName(null);
    setAttachedFileContent(null);
    setAttachedFileName(null);
    setAttachedFileBase64(null);
    setAttachedFileType(null);
  };

  const handleSendMessage = async (userText: string = inputText) => {
    const textToSend = userText.trim();
    if (!textToSend && !attachedImageBase64 && !attachedFileContent && !attachedFileBase64) return;

    setIsLoading(true);
    setInputText('');

    // Formulate final prompt if text file is attached
    let finalPrompt = textToSend;
    let displayPrompt = textToSend;

    if (attachedFileContent && attachedFileName) {
      finalPrompt = `[Attached File: ${attachedFileName}]\n---\n${attachedFileContent}\n---\n${textToSend || "Analyze the attached file."}`;
      displayPrompt = textToSend 
        ? `${textToSend}\n\n📎 *[Attached File: ${attachedFileName}]*` 
        : `📎 *[Analyze Attached File: ${attachedFileName}]*`;
    } else if (attachedImageBase64 && attachedImageName) {
      displayPrompt = textToSend 
        ? `${textToSend}\n\n🖼️ *[Attached Image: ${attachedImageName}]*` 
        : `🖼️ *[Analyze Attached Image: ${attachedImageName}]*`;
    } else if (attachedFileName) {
      finalPrompt = textToSend || `Please analyze this attached file: "${attachedFileName}"`;
      displayPrompt = textToSend 
        ? `${textToSend}\n\n📎 *[Attached Document: ${attachedFileName}]*` 
        : `📎 *[Analyze Attached Document: ${attachedFileName}]*`;
    }

    const newUserMessage: ChatMessage = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      role: 'user',
      content: displayPrompt,
      fileName: attachedFileName || attachedImageName || undefined,
      hasImage: !!attachedImageBase64
    };

    // Prepare API messages history (including image payload for backend API if present)
    const apiPayloadMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Add current user message with raw target prompt & image payload
    apiPayloadMessages.push({
      role: 'user',
      content: finalPrompt
    });

    // Append imageBase64 and generic attachment base64 to the last item in API call
    const finalApiMessages = [...apiPayloadMessages];
    const lastMsg = finalApiMessages[finalApiMessages.length - 1] as any;
    if (attachedImageBase64) {
      lastMsg.imageBase64 = attachedImageBase64;
    }
    if (attachedFileBase64) {
      lastMsg.attachment = {
        mimeType: attachedFileType || 'application/octet-stream',
        base64: attachedFileBase64,
        name: attachedFileName
      };
    }

    setMessages(prev => [...prev, newUserMessage]);
    handleRemoveAttachment(); // Clear inputs

    try {
      const res = await fetch('/api/ai/power-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: finalApiMessages })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          role: 'model',
          content: data.reply
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: "msg-" + Date.now() + "-err",
          role: 'model',
          content: '⚠️ Sorry, the AI assistant server is currently not responding. Please try again!'
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: "msg-" + Date.now() + "-err",
        role: 'model',
        content: '⚠️ Network Error! Please verify your internet connection and try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your chat history and start a fresh session?")) {
      const defaultWelcome: ChatMessage[] = [
        {
          id: 'welcome',
          role: 'model',
          content: `Welcome! I am your **Lookmax Elite Power AI** mentor and assistant. ⚡ A fresh discussion has been started.`
        }
      ];
      setMessages(defaultWelcome);
      handleRemoveAttachment();
      triggerNotification("🗑️ Chat Cleared", "All previous conversation history has been reset.");
    }
  };

  // Preset prompt handler
  const handleSelectPreset = (prompt: string) => {
    if (isLoading) return;
    setInputText('');
    handleSendMessage(prompt);
  };

  // High-fidelity Markdown/Code Block formatter for chat bubbles
  const renderMessageContent = (content: string) => {
    // Regex to split code blocks: ```[lang]\n[code]\n```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Extract language and actual code content
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-[#0c0c0e] font-mono text-xs shadow-lg max-w-full">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-bold select-none text-[10px] uppercase tracking-wider">
              <span>{lang || 'code'}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(code.trim());
                  triggerNotification("📋 copied to clipboard", "Code copied to clipboard!");
                }}
                className="hover:text-amber-400 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-400 leading-relaxed whitespace-pre font-mono">
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }

      // Handle simple formatting: line-breaks, lists, bold text
      const lines = part.split('\n').map((line, lIdx) => {
        // Parse bold text like **text**
        let formattedLine: React.ReactNode = line;
        if (line.includes('**')) {
          const boldParts = line.split(/(\*\*.*?\*\*)/g);
          formattedLine = boldParts.map((bp, bIdx) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return <strong key={bIdx} className="font-extrabold text-white text-sans">{bp.slice(2, -2)}</strong>;
            }
            return bp;
          });
        }

        // Parse list items
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <li key={lIdx} className="ml-4 list-disc pl-1 py-0.5 text-zinc-300 font-sans">
              {line.trim().slice(2)}
            </li>
          );
        }

        return (
          <span key={lIdx} className="block py-0.5 font-sans">
            {formattedLine}
          </span>
        );
      });

      return <div key={index} className="space-y-1">{lines}</div>;
    });
  };

  return (
    <div id="power-ai-chat-dashboard" className="space-y-6 animate-fadeIn text-left">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-display font-black tracking-tight text-amber-400 flex items-center gap-2.5">
            <Sparkles className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
            Power AI Chat
          </h2>
          <p className="text-xs text-zinc-550 font-mono">
            Supreme multi-purpose AI assistant for advanced coding, creative plans, self-improvement, & document review.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          disabled={messages.length <= 1}
          className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-[10px] text-zinc-400 hover:text-white font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Chat History
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE GORGEOUS CHAT SYSTEM */}
        <div className="lg:col-span-8 bg-[#121214] border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between min-h-[620px] max-h-[680px] shadow-2xl relative overflow-hidden">
          
          {/* Top amber lighting accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-[90%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Display */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 text-xs font-black tracking-tight select-none ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 shadow-md' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-md'
                }`}>
                  {msg.role === 'user' ? 'ME' : 'AI'}
                </div>

                {/* Message Speech Balloon */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                  msg.role === 'user'
                    ? 'bg-amber-500/10 border border-amber-500/25 text-zinc-100 rounded-tr-none shadow-lg'
                    : 'bg-zinc-950 border border-zinc-900/80 text-zinc-300 rounded-tl-none shadow-inner'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {/* AI Thinking Animation State */}
            {isLoading && (
              <div className="flex gap-3.5 max-w-[85%] mr-auto items-center animate-fadeIn">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse font-black text-xs">
                  AI
                </div>
                <div className="bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="font-mono text-[10px] text-zinc-500">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ATTACHMENT TRAY PREVIEW OVERLAY */}
          <AnimatePresence>
            {(attachedImageBase64 || attachedFileContent) && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-1 mb-3.5 p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {attachedImageBase64 ? (
                    <div className="relative w-12 h-12 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900 shrink-0">
                      <img 
                        src={attachedImageBase64} 
                        alt="Attached thumb" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-zinc-800 bg-amber-400/5 text-amber-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="text-left overflow-hidden">
                    <span className="block text-[8px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {attachedImageBase64 ? '🖼️ Attached Image' : '📎 Attached Text/Code File'}
                    </span>
                    <p className="text-xs text-zinc-300 font-medium truncate max-w-[200px]">
                      {attachedImageName || attachedFileName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 border border-transparent hover:border-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MESSAGE FORM INPUT BOX */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} 
            className="mt-2.5 flex items-center gap-2"
          >
            {/* Native file upload input */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.json,.js,.ts,.tsx,.css,.html,.md,.csv"
              className="hidden" 
            />

            {/* Paperclip Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-amber-400 rounded-xl transition-all disabled:opacity-40 shrink-0 cursor-pointer flex items-center justify-center"
              title="Upload file or image"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Type your message or upload a file..."
              className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !attachedImageBase64 && !attachedFileContent)}
              className="p-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: PROMPT LIBRARY & GUIDES */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Ideas Bento Container */}
          <div className="bg-[#121214] border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-xl text-left">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-zinc-300">
                  AI Prompt Library
                </h3>
                <p className="text-[9px] text-zinc-550 font-mono">Click to ask instantly</p>
              </div>
            </div>

            <div className="space-y-2.5">
              
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 hover:border-zinc-800 transition-colors">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Code className="w-3 h-3 text-amber-400" /> Advanced Coding
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Paste your code or upload files to identify bugs, fix issues, and optimize.
                </p>
                <button 
                  onClick={() => handleSelectPreset("Review my code, identify performance bottlenecks or bugs, and provide an optimized refactored version.")}
                  className="w-full text-left py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Code Review & Bug Fix</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 hover:border-zinc-800 transition-colors">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-amber-400" /> Growth Mindset
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Get high-value roadmaps, content plans, and discipline strategies.
                </p>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => handleSelectPreset("Give me 5 viral self-improvement content ideas for YouTube & Instagram Reels with high-hook outlines.")}
                    className="w-full text-left py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>5 Viral Reels Script Outlines</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleSelectPreset("Design a highly disciplined and realistic 1-week routine optimized for focus, physical health, and career acceleration.")}
                    className="w-full text-left py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Ultimate 1-Week Discipline Schedule</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Help Guide */}
          <div className="bg-[#121214] border border-zinc-850 rounded-2xl p-4 text-xs space-y-2">
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-zinc-550 block">💡 Upload Guidelines</span>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Drag-and-drop or select any text file (e.g. .txt, .json, .js, .ts, .py) to provide direct context to the AI. The assistant will parse and reference the content automatically.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
