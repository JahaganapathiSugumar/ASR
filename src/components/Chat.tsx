import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface ChatProps {
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
}

const Chat: React.FC<ChatProps> = ({ onSendMessage, onSendReaction }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { messages, reactions } = useStore();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-80 flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat & Reactions</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-gray-100 rounded-lg p-3">
            <div className="text-sm text-gray-600">{msg.userId}</div>
            <div className="mt-1">{msg.text}</div>
          </div>
        ))}
        
        {reactions.map((reaction) => (
          <div key={reaction.id} className="inline-block mx-1">
            {reaction.emoji}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                onSendReaction(emojiData.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;