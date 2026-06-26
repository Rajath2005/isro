import React, { useState } from 'react';
import { Mission } from '../types';
import { X, ChevronRight, ChevronLeft, Rocket, Cpu, CheckCircle2, Moon, Sparkles } from 'lucide-react';

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMission: (mission: Mission) => void;
  addToast: (message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function NewMissionModal({
  isOpen,
  onClose,
  onAddMission,
  addToast
}: NewMissionModalProps) {
  const [step, setStep] = useState(1);

  // Form State
  const [mName, setMName] = useState('');
  const [mCode, setMCode] = useState(`MSN-2026-${Math.floor(Math.random() * 800 + 100)}`);
  const [mRegion, setMRegion] = useState('Faustini Crater');
  const [mObjective, setMObjective] = useState('');
  const [mLander, setMLander] = useState('Titan-IV Heavy Lander');
  const [mRover, setMRover] = useState('Viper Ice Mapper');
  const [mPayload, setMPayload] = useState(320);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && (!mName.trim() || !mObjective.trim())) {
      addToast('Please input a valid Mission Name and Science Objective.', 'warning');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMission: Mission = {
      id: `custom-${Date.now()}`,
      code: mCode,
      name: mName,
      region: `South Pole • ${mRegion}`,
      objective: mObjective,
      latitude: mRegion.includes('Faustini') ? -87.42 : -89.9,
      longitude: mRegion.includes('Faustini') ? 82.31 : 0.0,
      status: 'planning',
      launchWindow: '2027-Q1',
      readiness: 12
    };

    onAddMission(newMission);
    addToast(`MISSION BLUEPRINT "${newMission.name}" SUCCESSFULLY COMMISSIONED!`, 'success');
    onClose();

    // Reset Form
    setStep(1);
    setMName('');
    setMObjective('');
  };

  return (
    <div className="fixed inset-0 bg-[#040810]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-[500px] max-w-full rounded-lg border border-[#404752] bg-[#111C28] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#404752] flex justify-between items-center bg-[#0d1620]">
          <div className="flex items-center space-x-2">
            <Rocket className="h-5 w-5 text-[#3394f1] animate-pulse" />
            <div>
              <h2 className="font-display font-bold text-xs text-[#e0e2ea] tracking-wider uppercase">
                COMMISSION NEW MISSION BLUEPRINT
              </h2>
              <span className="font-mono text-[9px] text-[#c0c7d4]/60 uppercase">STAGE {step} OF 3</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#c0c7d4] hover:text-[#e0e2ea] hover:bg-[#31353b]/50 rounded cursor-pointer transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body & Forms */}
        <div className="p-6 flex-1 text-[#e0e2ea]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#3394f1] mb-2">
                <Moon className="h-4 w-4" />
                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Region & Primary Science Objective</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#c0c7d4]/80 font-semibold uppercase tracking-wider block">MISSION IDENTIFIER</label>
                  <input
                    type="text"
                    disabled
                    value={mCode}
                    className="w-full bg-[#1c2026]/40 border border-[#404752]/40 text-xs font-mono px-3 py-2 rounded focus:outline-none opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#c0c7d4]/80 font-semibold uppercase tracking-wider block">MISSION NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Shackleton Beta"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="w-full bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-xs font-display px-3 py-2 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#c0c7d4]/80 font-semibold uppercase tracking-wider block">TARGET EXPLORATION REGION</label>
                <select
                  value={mRegion}
                  onChange={(e) => setMRegion(e.target.value)}
                  className="w-full bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-xs font-display px-3 py-2 rounded focus:outline-none cursor-pointer"
                >
                  <option value="Faustini Crater">Faustini Crater Rim (87.4°S, 82.3°E)</option>
                  <option value="Shackleton Crater">Shackleton Crater Inner (89.9°S, 0.0°E)</option>
                  <option value="Malapert Massif">Malapert Massif Ridge (86.0°S, 2.7°E)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#c0c7d4]/80 font-semibold uppercase tracking-wider block">PRIMARY SCIENTIFIC OBJECTIVE</label>
                <textarea
                  required
                  placeholder="e.g., Extract deep soil cores to analyze hydrogen concentration levels."
                  value={mObjective}
                  onChange={(e) => setMObjective(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-xs font-display px-3 py-2 rounded focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#3394f1] mb-2">
                <Cpu className="h-4 w-4" />
                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Hardware & Payload Specifications</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#c0c7d4]/80 font-semibold uppercase tracking-wider block">CHOOSE LANDER MODEL</label>
                <select
                  value={mLander}
                  onChange={(e) => setMLander(e.target.value)}
                  className="w-full bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-xs font-display px-3 py-2 rounded focus:outline-none cursor-pointer"
                >
                  <option value="Titan-IV Heavy Lander">Titan-IV Heavy Lander (Mass: 4200kg)</option>
                  <option value="Ares-X Utility Lander">Ares-X Utility Lander (Mass: 3100kg)</option>
                  <option value="Vikram-M Exploration Lander">Vikram-M Heavy Exploration Lander (Mass: 5500kg)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#c0c7d4]/80 font-semibold uppercase tracking-wider block">CHOOSE ROVER CLASS</label>
                <select
                  value={mRover}
                  onChange={(e) => setMRover(e.target.value)}
                  className="w-full bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-xs font-display px-3 py-2 rounded focus:outline-none cursor-pointer"
                >
                  <option value="Viper Ice Mapper">Viper Spectroscopic Ice Mapper</option>
                  <option value="Pragyan-II Rover">Pragyan-II Core Drilling Rover</option>
                  <option value="Lunar Cruiser-X">Lunar Cruiser-X Heavy Cargo Carrier</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                  <span className="text-[#c0c7d4]/80 uppercase">Est. Scientific Payload Mass</span>
                  <span className="text-[#3394f1] font-bold">{mPayload} kg</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="20"
                  value={mPayload}
                  onChange={(e) => setMPayload(Number(e.target.value))}
                  className="w-full accent-[#3394f1] cursor-ew-resize bg-[#1c2026] h-1.5 rounded"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#4CAF50] mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Verify Blueprint Commissioning Parameters</span>
              </div>

              <div className="bg-[#1c2026]/40 border border-[#404752]/30 rounded p-4 space-y-3 font-mono text-[10.5px]">
                <div className="flex justify-between border-b border-[#404752]/20 pb-1.5">
                  <span className="text-[#c0c7d4]/60">MISSION ID</span>
                  <span className="text-[#e0e2ea] font-bold">{mCode}</span>
                </div>
                <div className="flex justify-between border-b border-[#404752]/20 pb-1.5">
                  <span className="text-[#c0c7d4]/60">MISSION NAME</span>
                  <span className="text-[#e0e2ea] font-bold">{mName}</span>
                </div>
                <div className="flex justify-between border-b border-[#404752]/20 pb-1.5">
                  <span className="text-[#c0c7d4]/60">TARGET REGION</span>
                  <span className="text-[#e0e2ea] font-bold">{mRegion}</span>
                </div>
                <div className="flex justify-between border-b border-[#404752]/20 pb-1.5">
                  <span className="text-[#c0c7d4]/60">TOUCHDOWN LANDER</span>
                  <span className="text-[#e0e2ea] font-bold truncate max-w-[200px]">{mLander}</span>
                </div>
                <div className="flex justify-between border-b border-[#404752]/20 pb-1.5">
                  <span className="text-[#c0c7d4]/60"> companion rover</span>
                  <span className="text-[#e0e2ea] font-bold">{mRover}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c0c7d4]/60">PAYLOAD BUDGET</span>
                  <span className="text-[#3394f1] font-bold">{mPayload} kg (Tier A)</span>
                </div>
              </div>

              <p className="text-[10px] text-[#c0c7d4]/60 leading-normal font-display">
                *Commissioning triggers local A* path-finding, landing zone scoring, and ice heatmap alignment routines dynamically.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#404752] bg-[#0d1620] flex justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-[#404752] hover:bg-[#31353b]/50 hover:border-[#8a919e]/60 text-[#e0e2ea] text-xs font-display font-semibold uppercase rounded transition-all cursor-pointer flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#3394f1] hover:bg-[#a2c9ff] text-[#001c38] text-xs font-display font-bold uppercase rounded transition-all cursor-pointer flex items-center space-x-1 ml-auto shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#4CAF50] hover:bg-[#81C784] text-[#002b00] text-xs font-display font-bold uppercase rounded transition-all cursor-pointer flex items-center space-x-1.5 ml-auto shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>COMMISSION</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
