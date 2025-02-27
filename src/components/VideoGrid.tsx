import React from 'react';
import { useStore } from '../store/useStore';

const VideoGrid: React.FC = () => {
  const { localStream, peers } = useStore();

  React.useEffect(() => {
    if (localStream) {
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = localStream;
      }
    }
  }, [localStream]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <div className="relative">
        <video
          id="localVideo"
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg"
        />
        <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          You
        </span>
      </div>
      {peers.map((peer) => (
        <div key={peer.id} className="relative">
          <video
            autoPlay
            playsInline
            srcObject={peer.stream}
            className="w-full rounded-lg"
          />
          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            Participant
          </span>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;