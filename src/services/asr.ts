import { pipeline, Pipeline } from '@xenova/transformers';

class ASRService {
  private transcriber: Pipeline | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isTranscribing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private audioBuffer: Float32Array[] = [];
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initializeTranscriber();
  }

  private async initializeTranscriber() {
    if (this.transcriber) return;

    try {
      // Load the tokenizer and model
      this.transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny', // Using tiny model for faster loading and processing
        {
          quantized: true, // Use quantized model for better performance
          chunk_length_s: 5, // Reduced chunk size for faster processing
          stride_length_s: 1,
          return_timestamps: false // Disable timestamps for better performance
        }
      );
      console.log('ASR Service initialized successfully');
    } catch (error) {
      console.error('Error initializing transcriber:', error);
      this.transcriber = null;
      throw error; // Propagate error for better error handling
    }
  }

  public async startTranscription(stream: MediaStream, onTranscription: (text: string) => void) {
    try {
      // Wait for initialization to complete
      await this.initializationPromise;
      
      if (!this.transcriber) {
        throw new Error('Transcriber not initialized');
      }

      if (this.isTranscribing) return;
      this.isTranscribing = true;

      // Initialize audio context
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Connect audio nodes
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Handle audio processing
      this.processor.onaudioprocess = (e) => {
        if (!this.isTranscribing) return;
        const inputData = e.inputBuffer.getChannelData(0);
        this.audioBuffer.push(new Float32Array(inputData));
      };

      // Process accumulated audio periodically
      this.processingInterval = setInterval(async () => {
        if (this.audioBuffer.length > 0 && this.transcriber) {
          // Combine audio chunks
          const combinedLength = this.audioBuffer.reduce((acc, curr) => acc + curr.length, 0);
          const combinedBuffer = new Float32Array(combinedLength);
          let offset = 0;
          
          this.audioBuffer.forEach(buffer => {
            combinedBuffer.set(buffer, offset);
            offset += buffer.length;
          });

          try {
            const result = await this.transcriber(combinedBuffer, {
              sampling_rate: this.audioContext?.sampleRate || 16000,
            });

            if (result?.text) {
              onTranscription(result.text.trim());
            }
          } catch (error) {
            console.error('Transcription error:', error);
          }

          // Clear buffer after processing
          this.audioBuffer = [];
        }
      }, 2000); // Process every 2 seconds for more responsive captions

    } catch (error) {
      console.error('Error starting transcription:', error);
      this.stopTranscription();
      throw error;
    }
  }

  public stopTranscription() {
    this.isTranscribing = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioBuffer = [];
  }
}

export const asrService = new ASRService();