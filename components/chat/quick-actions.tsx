'use client';

import { useState } from 'react';
import type { StudyMode } from '@/types/chat';
import { Cloud, AlertTriangle, GraduationCap, Headphones, Radio } from 'lucide-react';

interface QuickActionsProps {
  onModeSelect: (mode: StudyMode | null) => void;
  activeMode: StudyMode | null;
  disabled: boolean;
}

const STUDY_MODES = [
  {
    id: 'METAR_WEATHER' as StudyMode,
    label: 'METAR & Weather',
    icon: Cloud,
  },
  {
    id: 'EMERGENCY_SCENARIOS' as StudyMode,
    label: 'Emergency Scenarios',
    icon: AlertTriangle,
  },
  {
    id: 'CHECKRIDE_PREP' as StudyMode,
    label: 'Checkride Prep',
    icon: GraduationCap,
  },
];

export function QuickActions({ onModeSelect, activeMode, disabled }: QuickActionsProps) {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const handleClick = (mode: StudyMode) => {
    if (activeMode === mode) {
      onModeSelect(null);
    } else {
      onModeSelect(mode);
    }
  };

  return (
    <div className="border-b border-background-tertiary p-4">
      <div className="flex flex-wrap gap-2">
        {STUDY_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => handleClick(mode.id)}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-primary-500 text-white border-2 border-primary-500'
                  : 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Phase 2 Features */}
      <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-background-tertiary/50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Headphones className="w-4 h-4" />
            <span className="text-sm">🎧 Audio Briefing (Beta)</span>
          </button>
          
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium border-2 border-gray-600 text-gray-600 cursor-not-allowed opacity-50"
            title="Coming soon in Phase 2"
          >
            <Radio className="w-4 h-4" />
            <span className="text-sm">🎙️ Live ATC Simulator (Beta)</span>
          </button>
        </div>

        {showAudioPlayer && (
          <div className="mt-2 p-3 bg-background-tertiary rounded-lg">
            <audio
              controls
              src="/audio/briefing.mp3"
              className="w-full"
              preload="metadata"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
