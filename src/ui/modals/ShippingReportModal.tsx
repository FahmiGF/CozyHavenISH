import React from 'react';
import { DayEarningsReport } from '../../types/game';
import { getItemEmoji } from '../Hotbar';
import { X, Sparkles, Coins } from 'lucide-react';

interface ShippingReportModalProps {
  report: DayEarningsReport;
  onClose: () => void;
}

export const ShippingReportModal: React.FC<ShippingReportModalProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-md bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto mb-2 text-amber-700 animate-bounce">
          <Sparkles className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-haven-950 uppercase mb-0.5">Morning Shipping Report</h3>
        <p className="text-xs font-semibold text-haven-600 mb-4">
          Produce shipped overnight has been sold on the mainland market!
        </p>

        {/* Shipped items list */}
        <div className="bg-white p-3 rounded-2xl border-2 border-haven-300 max-h-48 overflow-y-auto space-y-1.5 mb-4 text-left">
          {report.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200 text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getItemEmoji(item.itemId)}</span>
                <span className="text-haven-900">
                  {item.quantity}x {item.itemId.replace('crop_', '').replace('forage_', '')}
                </span>
              </div>
              <span className="font-mono text-amber-700">🪙 +{item.totalPrice}</span>
            </div>
          ))}
        </div>

        {/* Total revenue */}
        <div className="flex items-center justify-between bg-amber-100 p-3 rounded-xl border border-amber-300 mb-5 font-black text-sm text-amber-950 font-mono">
          <span>Total Overnight Earnings:</span>
          <span className="text-base text-amber-800 flex items-center gap-1">
            <Coins className="w-4 h-4" />
            <span>🪙 +{report.totalEarnings.toLocaleString()} Coins</span>
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-cozy transition active:scale-98"
        >
          Collect Coins & Start Day!
        </button>
      </div>
    </div>
  );
};
