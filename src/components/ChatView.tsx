import React, { useState } from 'react';
import { Smile, Send, Heart, Reply, User } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  currentUser: UserProfile;
  onSendMessage: (text: string, replyTo?: { authorName: string; text: string }) => void;
  onReact: (messageId: string, reactionType: 'heart' | 'replies') => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  currentUser,
  onSendMessage,
  onReact,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeReply, setActiveReply] = useState<{ authorName: string; text: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['⚡', '💡', '🔌', '📟', '🤖', '👍', '❤️', '🔥', '🚀', '✅'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, activeReply || undefined);
    setInputText('');
    setActiveReply(null);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden p-2.5 sm:p-4">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className="space-y-1">
            {/* Date Tag */}
            {msg.dateLabel && (
              <div className="text-center my-1.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wide bg-white/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {msg.dateLabel}
                </span>
              </div>
            )}

            {/* Message Bubble: concentrated to left or right, with increased sideways width */}
            {msg.isCurrentUser ? (
              /* User Sent Bubble: strictly concentrated to the RIGHT side */
              <div className="flex justify-end">
                <div className="w-[92%] sm:w-[86%] md:w-[80%] max-w-2xl bg-[#a3d977] text-[#1e4811] rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-xs relative border border-[#91c964]">
                  {/* Quoted Reply Header if any */}
                  {msg.replyTo && (
                    <div className="mb-2 p-2 bg-[#92ca65]/60 rounded-lg text-xs border-l-2 border-[#285718]">
                      <div className="flex items-center gap-1 font-bold text-[#1a3f0e] mb-0.5">
                        <User className="w-3.5 h-3.5" />
                        {msg.replyTo.authorName}
                      </div>
                      <p className="line-clamp-2 italic text-[#245214]">
                        {msg.replyTo.text}
                      </p>
                    </div>
                  )}

                  {/* Main Message Text */}
                  <p className="text-xs sm:text-sm leading-relaxed text-[#1e4811] font-medium break-words">
                    {msg.content}
                  </p>

                  {/* Message Bottom: Time & Reactions */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#8fc862]/50 text-[11px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReact(msg.id, 'heart')}
                        className="flex items-center gap-1 hover:text-red-700 transition cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        <span className="font-bold">{msg.reactions.heart}</span>
                      </button>
                    </div>
                    <span className="font-mono text-[#2f5c1f] font-semibold">{msg.time}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Received Message Bubble: strictly concentrated to the LEFT side */
              <div className="flex justify-start">
                <div className="w-[92%] sm:w-[86%] md:w-[80%] max-w-2xl bg-[#dedede] text-gray-800 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-xs border border-gray-300">
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">{msg.authorName}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono shrink-0">{msg.time}</span>
                  </div>

                  {/* Content */}
                  <p className="text-xs sm:text-sm text-gray-900 mt-1 font-medium leading-relaxed break-words">
                    {msg.content}
                  </p>

                  {/* Footer Reactions */}
                  <div className="flex items-center justify-end gap-3 mt-2 pr-1 text-xs">
                    {/* Reply Counter Icon */}
                    <button
                      onClick={() => setActiveReply({ authorName: msg.authorName, text: msg.content })}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition cursor-pointer"
                      title="Reply to this message"
                    >
                      <Reply className="w-4 h-4 rotate-180" />
                      <span className="font-bold text-[11px]">{msg.reactions.replies}</span>
                    </button>

                    {/* Heart Counter */}
                    <button
                      onClick={() => onReact(msg.id, 'heart')}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition cursor-pointer"
                      title="Like message"
                    >
                      <Heart className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span className="font-bold text-[11px]">{msg.reactions.heart}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Replying Notice */}
      {activeReply && (
        <div className="mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
          <div className="truncate">
            Replying to <strong className="font-bold">{activeReply.authorName}</strong>: "{activeReply.text.slice(0, 40)}..."
          </div>
          <button
            onClick={() => setActiveReply(null)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 ml-2 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-14 left-4 p-2 bg-white rounded-lg shadow-lg border border-gray-200 flex gap-2 z-20">
          {emojis.map(e => (
            <button
              key={e}
              onClick={() => handleAddEmoji(e)}
              className="text-lg hover:scale-125 transition cursor-pointer"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Bar: compact sizing, attachment button removed, send button fits mobile perfectly */}
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 flex items-center bg-white border border-gray-400 rounded-full shadow-xs px-1.5 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-w-0">
          {/* Yellow Smiley Face Icon */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 text-amber-500 hover:text-amber-600 transition shrink-0 cursor-pointer"
            title="Insert emoji"
          >
            <Smile className="w-5 h-5 fill-amber-400 text-amber-600" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Write your message..."
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-gray-800 placeholder-gray-500 outline-none min-w-0"
          />
        </div>

        {/* Paper Plane Send Button - sized to fit mobile without breaking */}
        <button
          type="submit"
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0044cc] hover:bg-[#0033aa] active:bg-[#002288] text-white rounded-full shadow-md transition shrink-0 flex items-center justify-center cursor-pointer"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-12 translate-x-0.5" />
        </button>
      </form>
    </div>
  );
};
