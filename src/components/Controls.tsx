import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { useStore } from '../store/useStore';

const Controls: React.FC = () => {
  const { localStream, isMuted, isVideoOff, toggleMute, toggleVideo } = useStore();

  const handleScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      
      if (localStream) {
        const sender = localStream.getVideoTracks()[0];
        if (sender) {
          sender.stop();
        }
        localStream.addTrack(videoTrack);
      }

      videoTrack.onended = () => {
        if (localStream) {
          const newStream = navigator.mediaDevices.getUserMedia({ video: true });
          newStream.then(stream => {
            const videoTrack = stream.getVideoTracks()[0];
            localStream.addTrack(videoTrack);
          });
        }
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4">
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${
            isMuted ? 'bg-red-500' : 'bg-gray-700'
          } hover:bg-opacity-80`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${
            isVideoOff ? 'bg-red-500' : 'bg-gray-700'
          } hover:bg-opacity-80`}
        >
          {isVideoOff ? (
            <VideoOff className="w-6 h-6 text-white" />
          ) : (
            <Video className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          onClick={handleScreenShare}
          className="p-4 rounded-full bg-gray-700 hover:bg-opacity-80"
        >
          <MonitorUp className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="p-4 rounded-full bg-red-500 hover:bg-opacity-80"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Controls;