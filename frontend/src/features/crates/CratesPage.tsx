// frontend/src/features/crates/CratesPage.tsx
import React, { useState, useEffect } from 'react';
import { SmartCrateBuilder } from './SmartCrateBuilder';
import { api } from '../../services/api';

interface Crate {
  id: number;
  name: string;
  description?: string;
  type: string;
  is_smart: boolean;
  color?: string;
  icon?: string;
  track_count?: number;
  criteria?: any;
}

const CratesPage: React.FC = () => {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingCrate, setEditingCrate] = useState<Crate | null>(null);
  const [selectedCrate, setSelectedCrate] = useState<Crate | null>(null);
  const [crateTracks, setCrateTracks] = useState<any[]>([]);

  useEffect(() => {
    loadCrates();
  }, []);

  const loadCrates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/crates');
      setCrates(response.data);
    } catch (error) {
      console.error('Error loading crates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingCrate(null);
    setShowBuilder(true);
  };

  const handleEditCrate = (crate: Crate) => {
    setEditingCrate(crate);
    setShowBuilder(true);
  };

  const handleSaveCrate = async () => {
    await loadCrates();
    setShowBuilder(false);
    setEditingCrate(null);
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingCrate(null);
  };

  const handleSelectCrate = async (crate: Crate) => {
    setSelectedCrate(crate);
    try {
      const response = await api.get(`/crates/${crate.id}/tracks`);
      setCrateTracks(response.data);
    } catch (error) {
      console.error('Error loading crate tracks:', error);
    }
  };

  const handleRefreshSmartCrate = async (crateId: number) => {
    try {
      await api.post(`/crates/${crateId}/refresh`);
      await loadCrates();
      if (selectedCrate?.id === crateId) {
        handleSelectCrate(crates.find(c => c.id === crateId)!);
      }
    } catch (error) {
      console.error('Error refreshing crate:', error);
    }
  };

  const handleDeleteCrate = async (crateId: number) => {
    if (!confirm('Are you sure you want to delete this crate?')) {
      return;
    }

    try {
      await api.delete(`/crates/${crateId}`);
      await loadCrates();
      if (selectedCrate?.id === crateId) {
        setSelectedCrate(null);
        setCrateTracks([]);
      }
    } catch (error) {
      console.error('Error deleting crate:', error);
    }
  };

  if (showBuilder) {
    return (
      <SmartCrateBuilder
        existingCrate={editingCrate ? {
          id: editingCrate.id,
          name: editingCrate.name,
          description: editingCrate.description,
          criteria: editingCrate.criteria ? JSON.parse(editingCrate.criteria) : undefined,
          color: editingCrate.color,
          icon: editingCrate.icon,
        } : undefined}
        onSave={handleSaveCrate}
        onCancel={handleCancelBuilder}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Crates List */}
      <div className="w-80 bg-card border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Crates</h2>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
            >
              + New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading crates...</div>
        ) : (
          <div className="divide-y divide-border">
            {crates.map((crate) => (
              <div
                key={crate.id}
                onClick={() => handleSelectCrate(crate)}
                className={`p-4 cursor-pointer hover:bg-accent/50 ${
                  selectedCrate?.id === crate.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{crate.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate text-foreground">{crate.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {crate.track_count || 0} tracks
                        {crate.is_smart && ' • Smart'}
                      </p>
                    </div>
                  </div>
                  {crate.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: crate.color }}
                    />
                  )}
                </div>
                {crate.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{crate.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crate Details */}
      <div className="flex-1 overflow-y-auto bg-background">
        {selectedCrate ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCrate.icon || '📦'}</span>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{selectedCrate.name}</h1>
                  {selectedCrate.description && (
                    <p className="text-muted-foreground mt-1">{selectedCrate.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {selectedCrate.is_smart && (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        Smart Crate
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {crateTracks.length} tracks
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedCrate.is_smart && (
                  <button
                    onClick={() => handleRefreshSmartCrate(selectedCrate.id)}
                    className="px-3 py-1.5 border border-border rounded-lg hover:bg-accent text-sm text-foreground"
                  >
                    Refresh
                  </button>
                )}
                <button
                  onClick={() => handleEditCrate(selectedCrate)}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-accent text-sm text-foreground"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCrate(selectedCrate.id)}
                  className="px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Tracks Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      BPM
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Energy
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {crateTracks.length > 0 ? (
                    crateTracks.map((track) => (
                      <tr key={track.id} className="hover:bg-accent/50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                          {track.title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {track.artist}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {track.bpm || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {track.key_signature || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {track.energy_level ? '⚡'.repeat(track.energy_level) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        {selectedCrate.is_smart
                          ? 'No tracks match the criteria. Try refreshing the crate.'
                          : 'No tracks in this crate yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-lg">Select a crate to view its tracks</p>
              <p className="text-sm mt-2">or create a new smart crate to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CratesPage;
