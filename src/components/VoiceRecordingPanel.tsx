import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, Square, Camera, X } from 'lucide-react';

interface VoiceRecordingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (duration: number) => void;
}

export default function VoiceRecordingPanel({ isOpen, onClose, onComplete }: VoiceRecordingPanelProps) {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [duration, setDuration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      setRecordingState('recording');
      drawWaveform();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // Fallback to simulated visualization if mic fails
      setRecordingState('recording');
      drawSimulatedWaveform();
    }
  };

  const pauseRecording = () => {
    setRecordingState('paused');
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.suspend();
    }
  };

  const resumeRecording = () => {
    setRecordingState('recording');
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setRecordingState('idle');
  };

  const handleComplete = () => {
    stopRecording();
    onComplete(duration);
    setDuration(0);
  };

  const handleCancel = () => {
    stopRecording();
    setDuration(0);
    onClose();
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Captured image:", file.name);
      // In a real app, you would handle the file upload or attachment here
    }
  };

  useEffect(() => {
    if (isOpen && recordingState === 'idle') {
      startRecording();
    }
    if (!isOpen) {
      stopRecording();
      setDuration(0);
    }
    
    return () => {
      stopRecording();
    };
  }, [isOpen]);

  // Visualization logic
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let phase = 0;

    const draw = () => {
      if (recordingState === 'paused') {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / bufferLength / 255;
      const targetAmplitude = Math.max(0.1, avgVolume * 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += 0.05;

      const lines = 6;
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        
        const progress = i / (lines - 1);
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(0, 0, 0, ${0.1 + progress * 0.4})`); // black
        gradient.addColorStop(0.5, `rgba(75, 85, 99, ${0.2 + progress * 0.6})`); // dark gray
        gradient.addColorStop(1, `rgba(0, 0, 0, ${0.1 + progress * 0.4})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = i === Math.floor(lines / 2) ? 3 : 1.5;

        for (let x = 0; x < width; x += 2) {
          const nx = (x / width) * 2 - 1;
          const attenuation = Math.exp(-Math.pow(nx, 2) * 4);
          
          const freq = 2 + i * 0.5;
          const linePhase = phase * (1 + i * 0.2) + i * Math.PI / 3;
          
          const wave1 = Math.sin(nx * Math.PI * freq + linePhase);
          const wave2 = Math.sin(nx * Math.PI * (freq * 1.5) - linePhase * 0.8);
          
          const yOffset = (wave1 + wave2 * 0.5) * targetAmplitude * height * 0.4 * attenuation;
          
          if (x === 0) {
            ctx.moveTo(x, centerY + yOffset);
          } else {
            ctx.lineTo(x, centerY + yOffset);
          }
        }
        ctx.stroke();
      }
    };

    draw();
  };

  const drawSimulatedWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const draw = () => {
      if (recordingState === 'paused') {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += 0.05;

      const targetAmplitude = 0.2 + Math.sin(phase * 0.5) * 0.1 + Math.random() * 0.05;

      const lines = 6;
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        
        const progress = i / (lines - 1);
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(0, 0, 0, ${0.1 + progress * 0.4})`);
        gradient.addColorStop(0.5, `rgba(75, 85, 99, ${0.2 + progress * 0.6})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${0.1 + progress * 0.4})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = i === Math.floor(lines / 2) ? 3 : 1.5;

        for (let x = 0; x < width; x += 2) {
          const nx = (x / width) * 2 - 1;
          const attenuation = Math.exp(-Math.pow(nx, 2) * 4);
          
          const freq = 2 + i * 0.5;
          const linePhase = phase * (1 + i * 0.2) + i * Math.PI / 3;
          
          const wave1 = Math.sin(nx * Math.PI * freq + linePhase);
          const wave2 = Math.sin(nx * Math.PI * (freq * 1.5) - linePhase * 0.8);
          
          const yOffset = (wave1 + wave2 * 0.5) * targetAmplitude * height * 0.4 * attenuation;
          
          if (x === 0) {
            ctx.moveTo(x, centerY + yOffset);
          } else {
            ctx.lineTo(x, centerY + yOffset);
          }
        }
        ctx.stroke();
      }
    };
    draw();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}: ${s}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/0 z-[60] pointer-events-auto"
          />
          <div className="absolute bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-6 right-6 z-[70] flex flex-col pointer-events-none">
            <motion.div
              layoutId="voice-panel"
              className="w-full bg-white/95 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/80 flex flex-col pointer-events-auto overflow-hidden"
              style={{ borderRadius: 24 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <motion.div
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="flex flex-col w-full"
              >
                {/* Top Row: Timer and Close */}
                <div className="w-full flex justify-between items-center mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      animate={{ opacity: recordingState === 'recording' ? [1, 0.2, 1] : 0.5 }} 
                      transition={{ repeat: Infinity, duration: 1.5 }} 
                      className={`w-2.5 h-2.5 rounded-full ${recordingState === 'recording' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-400'}`} 
                    />
                    <div className="text-[42px] leading-none font-light text-gray-800 tracking-tight font-sans">
                      {formatTime(duration)}
                    </div>
                  </div>
                  <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors -mr-2">
                    <X size={24} />
                  </button>
                </div>

                {/* Visualization Canvas */}
                <div className="w-full h-40 my-4 relative flex items-center justify-center overflow-visible">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={160}
                    className="w-full h-full relative z-10"
                  />
                </div>

                {/* Bottom Row: Camera, Pause, Complete */}
                <div className="w-full flex items-center justify-between px-1 mt-2">
                  {/* Left: Camera */}
                  <button
                    onClick={handleCameraClick}
                    className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />

                  {/* Right: Pause & Complete */}
                  <div className="flex items-center gap-3">
                    {recordingState === 'recording' ? (
                      <button
                        onClick={pauseRecording}
                        className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Pause size={20} fill="currentColor" />
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </button>
                    )}

                    <button
                      onClick={handleComplete}
                      className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-md shadow-gray-900/20 hover:bg-black transition-colors"
                    >
                      <Square size={16} fill="currentColor" className="rounded-sm" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
