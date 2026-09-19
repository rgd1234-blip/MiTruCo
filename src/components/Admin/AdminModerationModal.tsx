/**
 * MiTruCo Admin & Moderation Queue Modal
 * Allows authorized administrators to audit safety reports,
 * inspect provider latencies, and review abuse flags.
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { SafetyReport } from '../../types';

interface AdminModerationModalProps {
  onClose: () => void;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({ onClose }) => {
  const { themeConfig, providers } = useApp();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const data = await ApiService.getModerationReports();
    setReports(data.reports || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-3xl rounded-2xl border p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[85vh]"
        style={{ backgroundColor: themeConfig.bgBase, borderColor: themeConfig.borderBase, color: themeConfig.textBase }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: themeConfig.borderBase }}>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base">System Moderation & Safety Queue</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Reports */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
              Active Abuse & Safety Incidents ({reports.length})
            </h4>
            <button
              onClick={fetchReports}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80"
              style={{ color: themeConfig.accentColor }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {reports.length === 0 ? (
            <div
              className="p-6 rounded-xl border text-center text-xs opacity-75"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
            >
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-bold">No unresolved reports in moderation queue</p>
              <p className="text-[11px] mt-0.5">Cohort protection boundaries are actively enforced.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border text-xs space-y-1.5"
                  style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-600">{rep.reason}</span>
                    <span className="text-[10px] opacity-60">{new Date(rep.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px]">
                    Reported User: <strong>{rep.reportedUserName}</strong> (ID: {rep.reportedUserId})
                  </p>
                  {rep.details && <p className="text-[11px] opacity-80 italic">"{rep.details}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Provider Latencies */}
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: themeConfig.borderBase }}>
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
            Provider Architecture Health
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-lg border flex items-center justify-between"
                style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
              >
                <div>
                  <span className="font-bold block">{p.name}</span>
                  <span className="text-[10px] opacity-60">Status: {p.status}</span>
                </div>
                {p.latencyMs && (
                  <span className="font-mono text-[10px] opacity-75">{p.latencyMs}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
