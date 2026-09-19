/**
 * MiTruCo Pressure Relief Card Component
 * Specialized acute exam anxiety alleviation & cognitive grounding pacer.
 * Engineered for students under high pressure to restore 100% recall.
 */

import React, { useState, useEffect } from 'react';
import {
  Wind,
  HeartPulse,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { PressureReliefCardData } from '../../types';
import { useApp } from '../../context/AppContext';

interface PressureReliefCardProps {
  data: PressureReliefCardData;
}

export const PressureReliefCard: React.FC<PressureReliefCardProps> = ({ data }) => {
  const { themeConfig, addDownloadFile } = useApp();

  // Breathing pacer state: Inhale (0) -> Hold 1 (1) -> Exhale (2) -> Rest (3)
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // Interactive micro-checklist state
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const phases = [
    { name: 'Inhale gently through nose', duration: data.breathingGuidance.inhaleSeconds || 4, action: 'Expand lungs fully' },
    { name: 'Hold breath calmly', duration: data.breathingGuidance.holdSeconds || 4, action: 'Keep shoulders dropped' },
    { name: 'Exhale slowly through mouth', duration: data.breathingGuidance.exhaleSeconds || 4, action: 'Release all tension' },
    { name: 'Rest and pause', duration: data.breathingGuidance.restSeconds || 4, action: 'Feel grounded and present' },
  ];

  const currentPhase = phases[phaseIndex];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next phase
          const nextIndex = (phaseIndex + 1) % phases.length;
          if (nextIndex === 0) {
            setCyclesCompleted((c) => c + 1);
          }
          setPhaseIndex(nextIndex);
          return phases[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phaseIndex, phases]);

  const togglePacer = () => {
    setIsActive((prev) => !prev);
  };

  const resetPacer = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(phases[0].duration);
    setCyclesCompleted(0);
  };

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExportPlan = async () => {
    const text = `# MiTruCo Emergency Calm & Exam Triage Plan\n` +
      `Date: ${new Date().toLocaleString()}\n` +
      `Situation: ${data.situation}\n\n` +
      `## Mindset Shift:\n${data.mindsetShift}\n\n` +
      `## Immediate Tactical Action:\n${data.immediateAction}\n\n` +
      `## 5-Step Mental Reset Checklist:\n` +
      data.quickChecklist.map((item, idx) => `[${checkedItems[idx] ? 'X' : ' '}] ${item}`).join('\n') +
      `\n\n## Reassurance:\n${data.encouragement}\n\n` +
      `Made with care from Bihar — GR_`;

    await addDownloadFile(`exam_panic_relief_${Date.now()}.txt`, text, 'text/plain');
    alert('Relief & triage plan saved to Downloads!');
  };

  // Scale of breathing circle
  const getCircleScale = () => {
    if (!isActive) return 'scale-100';
    if (phaseIndex === 0) return 'scale-125 transition-transform duration-4000 ease-out';
    if (phaseIndex === 1) return 'scale-125';
    if (phaseIndex === 2) return 'scale-90 transition-transform duration-4000 ease-in';
    return 'scale-90';
  };

  return (
    <div
      id={`pressure_relief_${data.id}`}
      className="p-5 rounded-2xl border shadow-sm space-y-4 my-2"
      style={{
        backgroundColor: themeConfig.surfaceBase,
        borderColor: '#f59e0b',
        color: themeConfig.textBase,
      }}
    >
      {/* Header with Empathy Badge */}
      <div className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: themeConfig.borderBase }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Exam Anxiety & Pressure Relief
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                High-Stakes Anchor
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight">{data.situation}</h3>
          </div>
        </div>

        <button
          id={`btn_export_relief_${data.id}`}
          onClick={handleExportPlan}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-85 transition-opacity shrink-0"
          style={{
            borderColor: themeConfig.borderBase,
            backgroundColor: themeConfig.bgBase,
            color: themeConfig.textBase,
          }}
          title="Export emergency relief checklist"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save Plan</span>
        </button>
      </div>

      {/* Mindset Shift Box */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Cognitive Reframe:</span>
        </div>
        <p className="text-stone-700 dark:text-stone-300">{data.mindsetShift}</p>
      </div>

      {/* 4-4-4-4 Box Breathing Interactive Pacer */}
      <div
        className="p-4 rounded-xl border flex flex-col items-center justify-center text-center relative overflow-hidden"
        style={{
          borderColor: themeConfig.borderBase,
          backgroundColor: themeConfig.bgBase,
        }}
      >
        <div className="flex items-center justify-between w-full mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
            <Wind className="w-4 h-4" />
            <span>4-4-4-4 Box Breathing Cadence</span>
          </div>
          <span className="text-[11px] opacity-70">
            {cyclesCompleted > 0 ? `${cyclesCompleted} cycles done` : 'Tactical resets heart rate'}
          </span>
        </div>

        {/* Pulsing Visual Breathing Circle */}
        <div className="relative my-4 flex items-center justify-center w-28 h-28">
          <div
            className={`absolute inset-0 rounded-full bg-amber-500/20 border-2 border-amber-500/40 transition-all ${getCircleScale()}`}
          />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {isActive ? secondsRemaining : '4s'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">
              {isActive ? currentPhase.name.split(' ')[0] : 'Ready'}
            </span>
          </div>
        </div>

        {/* Phase Instruction */}
        <div className="text-center mb-3">
          <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
            {isActive ? currentPhase.name : 'Tap Start to begin 4-cycle calming pulse'}
          </p>
          <p className="text-xs opacity-75 mt-0.5">
            {isActive ? currentPhase.action : 'Lowers adrenaline and restores working memory within 90 seconds'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            id={`btn_toggle_pacer_${data.id}`}
            onClick={togglePacer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-transform active:scale-95"
            style={{ backgroundColor: isActive ? '#d97706' : themeConfig.accentColor }}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isActive ? 'Pause Pacer' : 'Start 4-4-4-4 Breath'}</span>
          </button>
          {isActive && (
            <button
              id={`btn_reset_pacer_${data.id}`}
              onClick={resetPacer}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity text-xs"
              style={{ borderColor: themeConfig.borderBase }}
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Immediate Tactical Action */}
      <div className="p-3.5 rounded-xl border text-xs space-y-1.5" style={{ borderColor: themeConfig.borderBase }}>
        <h4 className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Immediate Action Step:</span>
        </h4>
        <p className="opacity-90 leading-relaxed">{data.immediateAction}</p>
      </div>

      {/* 5-Step Mental Reset Checklist */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold opacity-80 flex items-center gap-1.5">
          <span>Actionable 3-Minute Cognitive Reset:</span>
        </h4>
        <div className="space-y-1.5">
          {data.quickChecklist.map((item, idx) => {
            const isChecked = !!checkedItems[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${
                  isChecked ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 line-through opacity-80' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{
                  borderColor: isChecked ? undefined : themeConfig.borderBase,
                }}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 opacity-40 shrink-0" />
                )}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reassurance Footer */}
      <div
        className="p-3 rounded-xl border text-xs text-center font-medium italic opacity-90"
        style={{
          borderColor: themeConfig.borderBase,
          backgroundColor: themeConfig.bgBase,
        }}
      >
        "{data.encouragement}"
        <div className="text-[11px] not-italic font-normal opacity-70 mt-1">
          — Made with empathy and care from Bihar · GR_
        </div>
      </div>
    </div>
  );
};
