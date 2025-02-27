import { create } from 'zustand';

interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number;
}

interface Peer {
  id: string;
  stream: MediaStream;
}

interface VideoState {
  localStream: MediaStream | null;
  peers: Peer[];
  roomId: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  messages: Message[];
  reactions: Reaction[];
  captions: string;
  setLocalStream: (stream: MediaStream) => void;
  addPeer: (peer: Peer) => void;
  removePeer: (peerId: string) => void;
  setRoomId: (roomId: string) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  addMessage: (message: Message) => void;
  addReaction: (reaction: Reaction) => void;
  setCaptions: (text: string) => void;
}

export const useStore = create<VideoState>((set) => ({
  localStream: null,
  peers: [],
  roomId: null,
  isMuted: false,
  isVideoOff: false,
  messages: [],
  reactions: [],
  captions: '',
  setLocalStream: (stream) => set({ localStream: stream }),
  addPeer: (peer) => set((state) => ({ peers: [...state.peers, peer] })),
  removePeer: (peerId) => set((state) => ({
    peers: state.peers.filter((p) => p.id !== peerId)
  })),
  setRoomId: (roomId) => set({ roomId }),
  toggleMute: () => set((state) => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = state.isMuted;
      });
    }
    return { isMuted: !state.isMuted };
  }),
  toggleVideo: () => set((state) => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = state.isVideoOff;
      });
    }
    return { isVideoOff: !state.isVideoOff };
  }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  addReaction: (reaction) => set((state) => ({
    reactions: [...state.reactions, reaction]
  })),
  setCaptions: (text) => set({ captions: text })
}));