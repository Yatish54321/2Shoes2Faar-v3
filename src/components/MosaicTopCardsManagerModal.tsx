import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Search,
  Check,
  RotateCcw,
  Users,
  ShieldCheck,
  MapPin,
  ArrowUpDown,
  MoveHorizontal
} from 'lucide-react';
import { Supporter } from '../types';
import { SupporterAvatar } from './SupporterAvatar';

interface MosaicTopCardsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSupporters: Supporter[];
  currentTopIds: string[];
  onSave: (newIds: string[]) => Promise<void>;
}

export const MosaicTopCardsManagerModal: React.FC<MosaicTopCardsManagerModalProps> = ({
  isOpen,
  onClose,
  allSupporters,
  currentTopIds,
  onSave
}) => {
  // Candidate pool of approved supporters
  const approvedSupporters = useMemo(() => {
    return allSupporters.filter(s => s.approved);
  }, [allSupporters]);

  // Working state of 10 selected supporter IDs
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const valid = currentTopIds.filter(id => approvedSupporters.some(s => s.id === id));
    if (valid.length >= 10) return valid.slice(0, 10);
    // Fill remaining up to 10
    const remaining = approvedSupporters.filter(s => !valid.includes(s.id)).map(s => s.id);
    return [...valid, ...remaining].slice(0, 10);
  });

  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if props change when opening
  React.useEffect(() => {
    if (isOpen) {
      const valid = currentTopIds.filter(id => approvedSupporters.some(s => s.id === id));
      const remaining = approvedSupporters.filter(s => !valid.includes(s.id)).map(s => s.id);
      setSelectedIds([...valid, ...remaining].slice(0, 10));
      setActiveSlotIndex(null);
      setSearchQuery('');
      setSaveSuccess(false);
    }
  }, [isOpen, currentTopIds, approvedSupporters]);

  if (!isOpen) return null;

  // Move item up (earlier slot)
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...selectedIds];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedIds(next);
  };

  // Move item down (later slot)
  const handleMoveDown = (index: number) => {
    if (index >= selectedIds.length - 1) return;
    const next = [...selectedIds];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedIds(next);
  };

  // Swap supporter in a slot
  const handleSelectSupporterForSlot = (slotIdx: number, newSupporterId: string) => {
    const next = [...selectedIds];
    // If the new supporter was in another slot, swap them
    const existingIndex = next.indexOf(newSupporterId);
    if (existingIndex !== -1) {
      next[existingIndex] = next[slotIdx];
    }
    next[slotIdx] = newSupporterId;
    setSelectedIds(next);
    setActiveSlotIndex(null);
    setSearchQuery('');
  };

  // Preset: Reset to standard chronological #1..#10
  const handlePresetChronological = () => {
    const sorted = [...approvedSupporters].sort(
      (a, b) => (a.supporterNumber || 0) - (b.supporterNumber || 0)
    );
    setSelectedIds(sorted.slice(0, 10).map(s => s.id));
  };

  // Preset: Latest claimed first
  const handlePresetLatest = () => {
    const sorted = [...approvedSupporters].sort(
      (a, b) => (b.supporterNumber || 0) - (a.supporterNumber || 0)
    );
    setSelectedIds(sorted.slice(0, 10).map(s => s.id));
  };

  // Filter candidate supporters for slot replacement modal
  const filteredCandidates = approvedSupporters.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.fullName.toLowerCase().includes(q) ||
      String(s.supporterNumber).includes(q) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.state && s.state.toLowerCase().includes(q))
    );
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(selectedIds);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (e) {
      console.error('Failed to save top cards arrangement:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="mosaic-top-cards-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="mosaic-top-cards-modal-content"
        className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin Dashboard Card Arranger
              </span>
              <span className="text-xs text-stone-400 font-medium">Mosaic Page Only</span>
            </div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100">
              Arrange Top 10 Community Cards (Mosaic Spotlight)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Customize the exact sequence and choice of 10 cards displayed in the "Community Faces" spotlight on the Mosaic page.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-medium">
              <Sparkles className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePresetChronological}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-semibold cursor-pointer transition-colors"
              >
                Default (#1 to #10)
              </button>
              <button
                type="button"
                onClick={handlePresetLatest}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-semibold cursor-pointer transition-colors"
              >
                Latest Claimed First
              </button>
            </div>
          </div>

          {/* Slots List (1 to 10) */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between px-1">
              <span>Card Slots (1 – 10)</span>
              <span className="text-[11px] font-normal text-stone-400">
                Use ◀ / ▶ or Move Up / Down to reorder slots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedIds.map((supporterId, idx) => {
                const supporter = approvedSupporters.find(s => s.id === supporterId);
                const isFirst = idx === 0;
                const isLast = idx === selectedIds.length - 1;

                if (!supporter) {
                  return (
                    <div
                      key={`empty-slot-${idx}`}
                      className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-between"
                    >
                      <span className="text-xs text-stone-400 font-semibold">
                        Slot #{idx + 1}: (Unassigned)
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSlotIndex(idx)}
                        className="px-2.5 py-1 bg-[#C2410C] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Choose Supporter
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={supporter.id || `slot-${idx}`}
                    className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 group hover:border-[#C2410C]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Slot Badge */}
                      <span className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Supporter Avatar & Details */}
                      <SupporterAvatar
                        photoUrl={supporter.photoUrl}
                        name={supporter.fullName}
                        supporterNumber={supporter.supporterNumber}
                        id={supporter.id}
                        size="sm"
                        className="shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {supporter.fullName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                          <span className="font-bold text-[#C2410C] dark:text-amber-400">
                            #{supporter.supporterNumber}
                          </span>
                          <span className="truncate">
                            {supporter.city}, {supporter.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Slot Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-stone-200 dark:border-stone-700 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={isLast}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-stone-200 dark:border-stone-700 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSlotIndex(idx)}
                        title="Swap Supporter"
                        className="px-2 py-1 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supporter Picker Drawer / Submodal for Selected Slot */}
          {activeSlotIndex !== null && (
            <div className="p-4 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border border-amber-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    Select Replacement Supporter for Slot #{activeSlotIndex + 1}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Pick any approved supporter from the registry to place into this spotlight position.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, # number, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                  autoFocus
                />
              </div>

              {/* Candidates Grid */}
              <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                {filteredCandidates.slice(0, 30).map((cand) => {
                  const isCurrentInSlot = selectedIds[activeSlotIndex] === cand.id;
                  const isAlreadyInOtherSlot = selectedIds.includes(cand.id) && !isCurrentInSlot;

                  return (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => handleSelectSupporterForSlot(activeSlotIndex, cand.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isCurrentInSlot
                          ? 'bg-[#C2410C]/10 border-[#C2410C] text-[#C2410C]'
                          : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <SupporterAvatar
                          photoUrl={cand.photoUrl}
                          name={cand.fullName}
                          supporterNumber={cand.supporterNumber}
                          id={cand.id}
                          size="sm"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                            {cand.fullName}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate">
                            #{cand.supporterNumber} • {cand.city}, {cand.state}
                          </p>
                        </div>
                      </div>

                      {isCurrentInSlot ? (
                        <span className="text-[10px] font-bold text-[#C2410C] px-1.5 py-0.5 rounded bg-[#C2410C]/10">
                          Current
                        </span>
                      ) : isAlreadyInOtherSlot ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                          Swap
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-500 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Saved successfully!
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Top 10 Arrangement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
