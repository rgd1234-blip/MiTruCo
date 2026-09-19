/**
 * MiTruCo Activity Module
 * Unified timeline of past conversations, searches, study interactions,
 * and saved items with multi-select, search, and batch actions.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Trash2,
  Bookmark,
  Share2,
  CheckSquare,
  Square,
  MessageSquare,
  GraduationCap,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityRecord } from '../../types';
import { LocalDatabase } from '../../services/db';

export const ActivityView: React.FC = () => {
  const { themeConfig, selectConversation } = useApp();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const loadActivities = async () => {
    const list = await LocalDatabase.getActivities();
    setActivities(list);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'saved') return Boolean(act.bookmarked);
    return act.type === selectedFilter;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredActivities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredActivities.map((a) => a.id));
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await LocalDatabase.deleteActivity(id);
    }
    setSelectedIds([]);
    setIsMultiSelect(false);
    await loadActivities();
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await LocalDatabase.deleteActivity(id);
    await loadActivities();
  };

  const exportActivityJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredActivities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mitruco_activity_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'study':
        return <GraduationCap className="w-4 h-4 text-amber-500" />;
      case 'commerce':
      case 'saved_item':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div
      id="activity_view"
      className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors"
      style={{ backgroundColor: themeConfig.bgBase, color: themeConfig.textBase }}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Activity & Saved Memory
            </h2>
            <p className="text-xs opacity-75">
              Encrypted local records of conversations, searches, study milestones, and bookmarks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMultiSelect(!isMultiSelect)}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors hover:opacity-80"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
            >
              {isMultiSelect ? 'Cancel Selection' : 'Multi-select'}
            </button>

            {isMultiSelect && selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={exportActivityJSON}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-80"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
              title="Export JSON"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-2.5">
          <div
            className="flex items-center gap-2 p-2 rounded-xl border"
            style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
          >
            <Search className="w-4 h-4 opacity-60 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past activities, topics, formulas, or items..."
              className="w-full bg-transparent text-xs outline-hidden"
              style={{ color: themeConfig.textBase }}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['all', 'conversation', 'saved', 'study', 'search'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-full font-medium capitalize transition-all shrink-0 ${
                  selectedFilter === filter ? 'text-white shadow-xs' : 'border opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedFilter === filter ? themeConfig.accentColor : themeConfig.surfaceBase,
                  borderColor: themeConfig.borderBase,
                }}
              >
                {filter === 'saved' ? 'Saved Bookmarks' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Select Select All Row */}
        {isMultiSelect && (
          <div className="flex items-center justify-between px-2 py-1 text-xs opacity-80">
            <button onClick={handleSelectAll} className="flex items-center gap-1.5 font-semibold">
              {selectedIds.length === filteredActivities.length ? (
                <CheckSquare className="w-4 h-4 text-amber-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All ({filteredActivities.length})</span>
            </button>
            <span>{selectedIds.length} selected</span>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-2">
          {filteredActivities.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center text-xs opacity-75 space-y-2"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
            >
              <Clock className="w-8 h-8 mx-auto opacity-40 mb-2" />
              <p className="font-bold text-sm">No activity records found</p>
              <p>As you talk to MiTruCo, learn, research, or save bookmarks, records will appear here.</p>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isSelected = selectedIds.includes(act.id);

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (isMultiSelect) {
                      toggleSelect(act.id);
                    } else if (act.conversationId) {
                      selectConversation(act.conversationId);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs ${
                    isSelected ? 'ring-2' : ''
                  }`}
                  style={{
                    borderColor: isSelected ? themeConfig.accentColor : themeConfig.borderBase,
                    backgroundColor: themeConfig.surfaceBase,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isMultiSelect && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleSelect(act.id); }}>
                        {isSelected ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 opacity-50" />}
                      </button>
                    )}

                    <div className="p-2 rounded-xl" style={{ backgroundColor: themeConfig.bgBase }}>
                      {getTypeIcon(act.type)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold line-clamp-1">{act.title}</h4>
                      <p className="text-[11px] opacity-70 line-clamp-1 mt-0.5">{act.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-60">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>

                    <button
                      onClick={(e) => handleDeleteSingle(act.id, e)}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                      title="Delete activity record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
