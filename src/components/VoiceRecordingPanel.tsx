import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, Check, X } from 'lucide-react';

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
  };

  const resumeRecording = () => {
    setRecordingState('recording');
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
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

  // Visualization logic (Bar Waveform)
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      if (recordingState === 'paused') {
        return; // maintain current frame
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const barWidth = 3;
      const gap = 4;
      const numBars = Math.floor(width / (barWidth + gap));
      const startX = (width - numBars * (barWidth + gap)) / 2;

      ctx.fillStyle = '#111827'; // Dark gray color
      ctx.lineCap = 'round';

      for (let i = 0; i < numBars; i++) {
        // Select frequencies spread across the spectrum
        const dataIndex = Math.floor((i / numBars) * (bufferLength / 2));
        let val = dataArray[dataIndex] / 255;
        
        let barHeight = Math.max(2, val * height * 0.8);
        
        const x = startX + i * (barWidth + gap);
        const y = centerY - barHeight / 2;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();
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
      animationFrameRef.current = requestAnimationFrame(draw);
      
      if (recordingState === 'paused') {
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += 0.15;

      const barWidth = 3;
      const gap = 3;
      const numBars = Math.floor(width / (barWidth + gap));
      const startX = (width - numBars * (barWidth + gap)) / 2;

      ctx.fillStyle = '#111827'; // Dark gray color

      for (let i = 0; i < numBars; i++) {
        const val = Math.abs(Math.sin(phase + i * 0.2)) + Math.random() * 0.2;
        let barHeight = Math.max(2, val * height * 0.5);
        
        // Emphasize the middle
        const distanceToCenter = Math.abs(i - numBars / 2) / (numBars / 2);
        barHeight = barHeight * (1 - distanceToCenter * 0.8);

        // Highlight center bar as in the reference image (orange)
        if (i === Math.floor(numBars/2)) {
           ctx.fillStyle = '#f97316';
        } else if (i > Math.floor(numBars/2)) {
           ctx.fillStyle = '#e5e7eb'; // Lighter gray for past
        } else {
           ctx.fillStyle = '#111827';
        }


        const x = startX + i * (barWidth + gap);
        const y = centerY - barHeight / 2;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();
      }
    };
    draw();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m}:${s}`;
    }
    // As per the reference image, it shows 00:24:15, so hh:mm:ss format
    return `00:${m}:${s}`;
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
            className="absolute inset-0 bg-black/40 z-[60] pointer-events-auto"
          />
          <div className="absolute bottom-0 left-0 right-0 z-[70] flex flex-col pointer-events-none">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-[#fcfcfc] rounded-t-[32px] pt-10 pb-[env(safe-area-inset-bottom)] shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
              style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
            >
              <div className="flex flex-col items-center w-full px-8">
                
                {/* Timer */}
                <div className="text-[40px] font-bold text-gray-900 tracking-tight font-sans mb-2">
                  {formatTime(duration)}
                </div>
                
                {/* Subtitle */}
                <div className="text-[14px] text-gray-500 font-medium tracking-wide mb-12">
                  慢慢说，不用着急，我在听
                </div>

                {/* Visualization Canvas */}
                <div className="w-full h-[60px] relative flex items-center justify-center overflow-visible mb-12">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={80}
                    className="w-full h-full relative z-10"
                  />
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-center gap-6 w-full max-w-[280px]">
                  {/* Cancel Button */}
                  <button
                    onClick={handleCancel}
                    className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <X size={24} strokeWidth={2.5} />
                  </button>

                  {/* Complete Button */}
                  <button
                    onClick={handleComplete}
                    className="w-20 h-16 rounded-[28px] bg-[#222222] shadow-md flex items-center justify-center text-white hover:bg-black active:scale-95 transition-all"
                  >
                    <Check size={28} strokeWidth={2.5} />
                  </button>

                  {/* Pause/Resume Button */}
                  {recordingState === 'recording' ? (
                    <button
                      onClick={pauseRecording}
                      className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <Pause size={20} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <Play size={20} fill="currentColor" className="ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
