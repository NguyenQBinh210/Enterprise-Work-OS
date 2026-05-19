"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isMe: boolean;
  };
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: {
      name: "Mai Vũ",
      avatar: "https://i.pravatar.cc/150?u=1",
      isMe: false,
    },
    content: "Hey everyone! How is the new dashboard design coming along?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    sender: {
      name: "Quốc Bình",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      isMe: true,
    },
    content:
      "Making great progress! Just finished the Kanban board implementation.",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    sender: {
      name: "Trần Minh Chi",
      avatar: "https://i.pravatar.cc/150?u=3",
      isMe: false,
    },
    content: "Awesome! Can we review it in the next standup?",
    timestamp: "10:35 AM",
  },
];

export default function ProjectChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: {
        name: "Quốc Bình",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        isMe: true,
      },
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.sender.isMe ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <img
              src={msg.sender.avatar}
              alt={msg.sender.name}
              className="w-10 h-10 rounded-full ring-2 ring-white"
            />
            <div
              className={`flex flex-col max-w-[70%] ${
                msg.sender.isMe ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-700">
                  {msg.sender.name}
                </span>
                <span className="text-xs text-slate-400">{msg.timestamp}</span>
              </div>
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  msg.sender.isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-slate-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
          />
          <Button
            type="submit"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 ml-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
