import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import VideoGrid from './components/VideoGrid';
import Controls from './components/Controls';
import Chat from './components/Chat';
import Captions from './components/Captions';
import { Video } from 'lucide-react';
import { webRTCService } from './services/webrtc';
import { asrService } from './services/asr';

function App() {
  const [roomInput, setRoomInput] = useState('');
  const { roomId, setRoomId, setLocalStream, addMessage, addReaction, setCaptions } = useStore();

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      
      // Start ASR when stream is available
      asrService.startTranscription(stream, (text) => {
        setCaptions(text);
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const handleSendMessage = (text: string) => {
    const message = {
      id: crypto.randomUUID(),
      userId: 'You',
      text,
      timestamp: Date.now(),
    };
    addMessage(message);
    // Send message through WebRTC data channel
  };

  const handleSendReaction = (emoji: string) => {
    const reaction = {
      id: crypto.randomUUID(),
      userId: 'You',
      emoji,
      timestamp: Date.now(),
    };
    addReaction(reaction);
    // Send reaction through WebRTC data channel
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await initializeMedia();
    setRoomId(roomInput);
    webRTCService.joinRoom(roomInput);
  };

  useEffect(() => {
    return () => {
      asrService.stopTranscription();
    };
  }, []);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Video className="w-12 h-12 text-blue-500" />
            <h1 className="text-2xl font-bold ml-2">Video Meet</h1>
          </div>
          <form onSubmit={joinRoom} className="space-y-4">
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                Enter Room Code
              </label>
              <input
                type="text"
                id="room"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Enter room code"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="flex-1">
        <VideoGrid />
        <Captions />
        <Controls />
      </div>
      <div className="w-80 h-screen border-l border-gray-700">
        <Chat onSendMessage={handleSendMessage} onSendReaction={handleSendReaction} />
      </div>
    </div>
  );
}

export default App;