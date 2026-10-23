import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, ChevronDown, ChevronUp, Disc } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PortfolioBgmPlayerProps {
  lang: 'ko' | 'en';
  isBgmActive: boolean;
  onToggleBgm: () => void;
}

export function PortfolioBgmPlayer({ lang, isBgmActive, onToggleBgm }: PortfolioBgmPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);

  // Sync volume with sound engine
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
    soundEngine.setBgmVolume(val);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restore = prevVolume > 0 ? prevVolume : 0.5;
      setVolume(restore);
      soundEngine.setBgmVolume(restore);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      soundEngine.setBgmVolume(0);
    }
  };

  return (
    <div
      id="portfolio-bgm-floating-widget"
      className="fixed bottom-5 right-5 z-40 select-none max-w-xs sm:max-w-sm transition-all duration-300"
    >
      <div
        className={`bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden transition-all duration-300 ${
          isBgmActive ? 'ring-2 ring-[#0052FF]/30 dark:ring-blue-400/30' : ''
        }`}
      >
        {/* Main Header / Mini Bar */}
        <div className="flex items-center justify-between p-3 gap-3">
          {/* Animated Disc / Icon */}
          <div className="flex items-center space-x-2.5">
            <button
              id="bgm-play-toggle-icon-btn"
              onClick={onToggleBgm}
              className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                isBgmActive
                  ? 'bg-gradient-to-tr from-[#0052FF] to-blue-400 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={isBgmActive ? (lang === 'ko' ? '일시정지' : 'Pause BGM') : (lang === 'ko' ? '배경음악 재생' : 'Play BGM')}
            >
              <Disc
                size={20}
                className={isBgmActive ? 'animate-spin' : ''}
                style={{ animationDuration: '3s' }}
              />
              {isBgmActive && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
              )}
            </button>

            {/* Track Info & Equalizer */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-headline font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate max-w-[130px] sm:max-w-[160px]">
                  {lang === 'ko' ? '포트폴리오 배경음악' : 'Portfolio BGM'}
                </span>
                
                {/* Audio Equalizer animation bars */}
                {isBgmActive && (
                  <div className="flex items-end space-x-0.5 h-3">
                    <span className="w-1 bg-[#0052FF] dark:bg-blue-400 rounded-full animate-pulse h-2"></span>
                    <span className="w-1 bg-[#0052FF] dark:bg-blue-400 rounded-full animate-bounce h-3"></span>
                    <span className="w-1 bg-[#0052FF] dark:bg-blue-400 rounded-full animate-pulse h-1.5"></span>
                    <span className="w-1 bg-[#0052FF] dark:bg-blue-400 rounded-full animate-bounce h-2.5"></span>
                  </div>
                )}
              </div>
              
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-sans truncate max-w-[140px] sm:max-w-[170px]">
                {isBgmActive 
                  ? (lang === 'ko' ? '댄스 팝 그루브 • 126 BPM' : 'Dance Pop Groove • 126 BPM')
                  : (lang === 'ko' ? '클릭하여 BGM 켜기' : 'Click to play BGM')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <button
              id="bgm-main-play-btn"
              onClick={onToggleBgm}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                isBgmActive
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-[#0052FF] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                  : 'bg-[#0052FF] text-white hover:bg-blue-600 shadow-sm'
              }`}
            >
              {isBgmActive ? (
                <>
                  <Pause size={13} />
                  <span>{lang === 'ko' ? '정지' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>{lang === 'ko' ? '재생' : 'Play'}</span>
                </>
              )}
            </button>

            {/* Minimize / Expand Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title={isExpanded ? (lang === 'ko' ? '접기' : 'Collapse') : (lang === 'ko' ? '볼륨 조절 펼치기' : 'Expand')}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Expandable Volume Controls */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={handleToggleMute}
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0052FF] dark:accent-blue-400"
              title={lang === 'ko' ? `볼륨: ${Math.round(volume * 100)}%` : `Volume: ${Math.round(volume * 100)}%`}
            />

            <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
