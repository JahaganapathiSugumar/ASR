import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

class WebRTCService {
  private socket: Socket;
  private peerConnections: Map<string, RTCPeerConnection>;

  constructor() {
    this.socket = io('http://localhost:3000');
    this.peerConnections = new Map();
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('user-joined', async (userId: string) => {
      await this.createPeerConnection(userId);
      const offer = await this.createOffer(userId);
      this.socket.emit('offer', { to: userId, offer });
    });

    this.socket.on('offer', async ({ from, offer }) => {
      await this.handleOffer(from, offer);
    });

    this.socket.on('answer', async ({ from, answer }) => {
      await this.handleAnswer(from, answer);
    });

    this.socket.on('ice-candidate', async ({ from, candidate }) => {
      await this.handleIceCandidate(from, candidate);
    });

    this.socket.on('user-left', (userId: string) => {
      this.handleUserLeft(userId);
    });
  }

  private async createPeerConnection(userId: string) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.peerConnections.set(userId, peerConnection);

    const localStream = useStore.getState().localStream;
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    peerConnection.ontrack = (event) => {
      useStore.getState().addPeer({
        id: userId,
        stream: event.streams[0],
      });
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    return peerConnection;
  }

  private async createOffer(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) return;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit) {
    let peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      peerConnection = await this.createPeerConnection(userId);
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.socket.emit('answer', { to: userId, answer });
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private handleUserLeft(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
    useStore.getState().removePeer(userId);
  }

  public joinRoom(roomId: string) {
    this.socket.emit('join-room', roomId);
  }

  public createRoom(roomId: string) {
    this.socket.emit('create-room', roomId);
  }
}

export const webRTCService = new WebRTCService();