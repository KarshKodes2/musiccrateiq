// frontend/src/components/common/VirtualizedTrackList.tsx
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  bpm?: number;
  key_signature?: string;
  energy_level?: number;
  duration?: number;
  rating?: number;
  era?: string;
}

interface VirtualizedTrackListProps {
  tracks: Track[];
  selectedTracks?: Set<number>;
  onTrackSelect?: (trackId: number, selected: boolean) => void;
  onTrackClick?: (track: Track) => void;
  onTrackDoubleClick?: (track: Track) => void;
  height?: number;
}

export const VirtualizedTrackList: React.FC<VirtualizedTrackListProps> = ({
  tracks,
  selectedTracks = new Set(),
  onTrackSelect,
  onTrackClick,
  onTrackDoubleClick,
  height = 600,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated height of each row in pixels
    overscan: 10, // Number of items to render above and below the visible area
  });

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="w-8"></div>
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4">
          <div className="col-span-3">Title</div>
          <div className="col-span-2">Artist</div>
          <div className="col-span-2">Album</div>
          <div className="col-span-1">BPM</div>
          <div className="col-span-1">Key</div>
          <div className="col-span-1">Energy</div>
          <div className="col-span-1">Era</div>
          <div className="col-span-1">Duration</div>
        </div>
      </div>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        style={{ height: `${height}px`, overflow: 'auto' }}
        className="relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const track = tracks[virtualRow.index];
            const isSelected = selectedTracks.has(track.id);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`px-4 py-2 flex items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                onClick={() => onTrackClick?.(track)}
                onDoubleClick={() => onTrackDoubleClick?.(track)}
              >
                {/* Checkbox */}
                <div className="w-8">
                  {onTrackSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onTrackSelect(track.id, e.target.checked);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 text-sm">
                  <div className="col-span-3 font-medium text-gray-900 truncate">
                    {track.title}
                  </div>
                  <div className="col-span-2 text-gray-500 truncate">
                    {track.artist}
                  </div>
                  <div className="col-span-2 text-gray-500 truncate">
                    {track.album || '-'}
                  </div>
                  <div className="col-span-1 text-gray-500">
                    {track.bpm || '-'}
                  </div>
                  <div className="col-span-1 text-gray-500">
                    {track.key_signature || '-'}
                  </div>
                  <div className="col-span-1 text-gray-500">
                    {track.energy_level ? '⚡'.repeat(track.energy_level) : '-'}
                  </div>
                  <div className="col-span-1 text-gray-500">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      track.era ? 'bg-purple-100 text-purple-700' : ''
                    }`}>
                      {track.era || '-'}
                    </span>
                  </div>
                  <div className="col-span-1 text-gray-500 font-mono text-xs">
                    {formatDuration(track.duration)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        Showing {rowVirtualizer.getVirtualItems().length} of {tracks.length} tracks
        {selectedTracks.size > 0 && ` • ${selectedTracks.size} selected`}
      </div>
    </div>
  );
};
