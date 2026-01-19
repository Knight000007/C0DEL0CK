/**
 * Relax Mode Component
 * Ambient sounds and breathing exercise with REAL audio
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CloudRain, Volume2, VolumeX, Wind, Waves, Trees } from 'lucide-react';

interface RelaxModeProps {
  countdown: number;
}

type SoundType = 'rain' | 'wind' | 'waves' | 'forest';

const SOUNDS: { type: SoundType; icon: React.ElementType; label: string }[] = [
  { type: 'rain', icon: CloudRain, label: 'Rain' },
  { type: 'wind', icon: Wind, label: 'Wind' },
  { type: 'waves', icon: Waves, label: 'Waves' },
  { type: 'forest', icon: Trees, label: 'Forest' },
];

// Breathing phases
const BREATH_PHASES = [
  { phase: 'inhale', duration: 4, text: 'Breathe in...' },
  { phase: 'hold', duration: 4, text: 'Hold...' },
  { phase: 'exhale', duration: 6, text: 'Breathe out...' },
  { phase: 'rest', duration: 2, text: 'Rest...' },
];

// Audio synthesis for ambient sounds using Web Audio API
class AmbientAudioPlayer {
  private audioContext: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying = false;

  private createNoiseBuffer(type: SoundType): AudioBuffer {
    const ctx = this.audioContext!;
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of audio
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // Generate noise based on type
    for (let i = 0; i < bufferSize; i++) {
      if (type === 'rain' || type === 'forest') {
        // Pink-ish noise for rain/forest
        output[i] = (Math.random() * 2 - 1) * 0.5;
      } else if (type === 'wind') {
        // Smoother noise for wind
        const t = i / ctx.sampleRate;
        output[i] = (Math.random() * 2 - 1) * 0.3 * (0.5 + 0.5 * Math.sin(t * 0.5));
      } else if (type === 'waves') {
        // Wave-like pattern
        const t = i / ctx.sampleRate;
        const wave = Math.sin(t * 0.3) * 0.5 + 0.5;
        output[i] = (Math.random() * 2 - 1) * 0.4 * wave;
      }
    }

    return buffer;
  }

  play(type: SoundType, volume: number = 0.5) {
    this.stop();
    
    try {
      this.audioContext = new AudioContext();
      
      // Create noise buffer
      const noiseBuffer = this.createNoiseBuffer(type);
      
      // Create nodes
      this.noiseNode = this.audioContext.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;
      
      // Filter for shaping the sound
      this.filterNode = this.audioContext.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      
      // Different filter settings per sound type
      switch (type) {
        case 'rain':
          this.filterNode.frequency.value = 3000;
          break;
        case 'wind':
          this.filterNode.frequency.value = 800;
          break;
        case 'waves':
          this.filterNode.frequency.value = 1500;
          break;
        case 'forest':
          this.filterNode.frequency.value = 4000;
          break;
      }
      
      // Gain for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = volume;
      
      // Connect the graph
      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      // Start
      this.noiseNode.start();
      this.isPlaying = true;
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }

  stop() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch (e) {
        // Already stopped
      }
      this.noiseNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isPlaying = false;
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export function RelaxMode({ countdown }: RelaxModeProps) {
  const [selectedSound, setSelectedSound] = useState<SoundType | null>('rain');
  const [isMuted, setIsMuted] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(12).fill(20));
  
  const audioPlayerRef = useRef<AmbientAudioPlayer | null>(null);

  // Initialize audio player
  useEffect(() => {
    audioPlayerRef.current = new AmbientAudioPlayer();
    return () => {
      audioPlayerRef.current?.stop();
    };
  }, []);

  // Handle sound playback
  useEffect(() => {
    if (selectedSound && !isMuted) {
      audioPlayerRef.current?.play(selectedSound, 0.4);
    } else {
      audioPlayerRef.current?.stop();
    }
  }, [selectedSound, isMuted]);

  // Animate audio visualizer
  useEffect(() => {
    if (selectedSound && !isMuted) {
      const interval = setInterval(() => {
        setAudioLevels(prev => prev.map(() => 20 + Math.random() * 60));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [selectedSound, isMuted]);

  // Breathing animation cycle
  useEffect(() => {
    const currentPhase = BREATH_PHASES[breathPhase];
    const interval = setInterval(() => {
      setBreathProgress(prev => {
        if (prev >= 100) {
          setBreathPhase(p => (p + 1) % BREATH_PHASES.length);
          return 0;
        }
        return prev + (100 / (currentPhase.duration * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [breathPhase]);

  const currentBreath = BREATH_PHASES[breathPhase];

  // Calculate breathing circle scale
  const getBreathScale = () => {
    const phase = currentBreath.phase;
    const progress = breathProgress / 100;
    
    if (phase === 'inhale') return 1 + (progress * 0.3);
    if (phase === 'hold') return 1.3;
    if (phase === 'exhale') return 1.3 - (progress * 0.3);
    return 1;
  };

  const handleSoundSelect = useCallback((type: SoundType) => {
    setSelectedSound(type);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in w-full max-w-2xl mx-auto">
      {/* Timer */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">Time remaining</p>
        <p className="text-4xl font-mono font-bold text-accent">
          {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </p>
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <div 
          className="absolute w-64 h-64 rounded-full bg-accent/10 blur-3xl transition-transform duration-1000"
          style={{ transform: `scale(${getBreathScale()})` }}
        />
        
        {/* Main circle */}
        <div 
          className="relative w-48 h-48 rounded-full border-4 border-accent/50 flex items-center justify-center bg-accent/5 backdrop-blur-xl transition-transform duration-1000"
          style={{ transform: `scale(${getBreathScale()})` }}
        >
          <div className="text-center">
            <p className="text-2xl font-semibold text-accent">{currentBreath.text}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {Math.ceil((BREATH_PHASES[breathPhase].duration * (100 - breathProgress)) / 100)}s
            </p>
          </div>
        </div>
      </div>

      {/* Sound Selection */}
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Ambient Sound {!isMuted && selectedSound && '🔊'}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {SOUNDS.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleSoundSelect(type)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                selectedSound === type
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <Icon className={`w-6 h-6 ${selectedSound === type ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${selectedSound === type ? 'text-accent' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Visual Sound Indicator - Now animated properly */}
        {selectedSound && !isMuted && (
          <div className="flex justify-center gap-1 h-8 items-end">
            {audioLevels.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-accent/50 rounded-full transition-all duration-150"
                style={{
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rain Animation */}
      {selectedSound === 'rain' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-8 bg-accent rain-drop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Motivational Text */}
      <p className="text-center text-muted-foreground text-sm max-w-md">
        Let go of your thoughts. Focus on your breath. 
        Your code will still be there when you return, 
        and you'll be sharper than ever.
      </p>
    </div>
  );
}
