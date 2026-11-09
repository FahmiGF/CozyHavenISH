import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { sound } from '../../domain/SoundSynth';
import { X, Volume2, VolumeX, Save, Download, Upload, RotateCcw, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [muted, setMuted] = useState<boolean>(false);
  const [musicVol, setMusicVol] = useState<number>(35);
  const [sfxVol, setSfxVol] = useState<number>(50);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
  };

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    sound.setMusicVolume(val / 100);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    sound.setSfxVolume(val / 100);
  };

  const handleSaveSlot = (slot: number) => {
    const success = gameState.saveGame(slot);
    sound.playSfx('click');
    setStatusMsg(success ? `Saved game to Slot ${slot} successfully!` : 'Save failed.');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleLoadSlot = (slot: number) => {
    const success = gameState.loadGame(slot);
    sound.playSfx('fanfare');
    setStatusMsg(success ? `Loaded game from Slot ${slot}!` : `No save found in Slot ${slot}.`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExport = () => {
    const jsonStr = gameState.exportSaveJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cozyhaven_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Exported save backup to JSON file!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = gameState.importSaveJson(content);
      if (success) {
        sound.playSfx('fanfare');
        setStatusMsg('Save file imported and loaded!');
      } else {
        setStatusMsg('Invalid save file format.');
      }
      setTimeout(() => setStatusMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleNewGame = () => {
    if (window.confirm('Start a fresh new farm? Unsaved progress will be reset.')) {
      gameState.resetToNewGame();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
                Settings & Save Slots
              </h2>
              <p className="text-xs font-semibold text-haven-600">Audio preferences, cloud backups, and controls.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="mb-3 px-3 py-1.5 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-xs font-black animate-fade-in">
            {statusMsg}
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {/* Audio Controls */}
          <div className="bg-white p-4 rounded-2xl border-2 border-haven-300 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-haven-900 uppercase">Audio Atmosphere</h3>
              <button
                onClick={handleMuteToggle}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                  muted ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-haven-200 border-haven-300 text-haven-800'
                }`}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{muted ? 'Unmute' : 'Mute All'}</span>
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-haven-700 mb-1">
                <span>Music Volume</span>
                <span>{musicVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVol}
                onChange={(e) => handleMusicChange(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-haven-700 mb-1">
                <span>SFX Volume</span>
                <span>{sfxVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={(e) => handleSfxChange(parseInt(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>
          </div>

          {/* Save Slots (1, 2, 3) */}
          <div className="bg-white p-4 rounded-2xl border-2 border-haven-300 space-y-2">
            <h3 className="text-xs font-black text-haven-900 uppercase">Save Game Slots (Local-First Persistence)</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="p-2.5 rounded-xl bg-haven-50 border border-haven-200 text-center">
                  <div className="text-xs font-black text-haven-900 mb-2">Slot {slot}</div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleSaveSlot(slot)}
                      className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase shadow-xs active:scale-95 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleLoadSlot(slot)}
                      className="w-full py-1 bg-haven-200 hover:bg-haven-300 text-haven-800 rounded-lg text-[10px] font-black uppercase transition"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backup & Import Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex-1 py-2 bg-haven-200 hover:bg-haven-300 border border-haven-400 text-haven-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Save JSON</span>
            </button>
            <label className="flex-1 py-2 bg-haven-200 hover:bg-haven-300 border border-haven-400 text-haven-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Save JSON</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {/* Controls Quick Guide */}
          <div className="bg-haven-100 p-3 rounded-2xl border border-haven-300 text-xs text-haven-800">
            <div className="font-black mb-1.5 flex items-center gap-1 text-haven-900">
              <Keyboard className="w-4 h-4" />
              <span>Controls Guide</span>
            </div>
            <div className="grid grid-cols-2 gap-1 font-semibold text-[11px]">
              <div>WASD / Arrows: Move</div>
              <div>E: Talk / Forage / Enter</div>
              <div>Space: Use Tool / Harvest</div>
              <div>Q: Open Backpack</div>
              <div>1 - 9: Select Hotbar Tool</div>
              <div>Esc: Close Window</div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-haven-200">
            <button
              onClick={handleNewGame}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Start Fresh New Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
