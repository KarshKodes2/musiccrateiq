// frontend/src/features/library/BatchEditModal.tsx
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, Music } from 'lucide-react';
import api from '@/services/api';

interface BatchEditModalProps {
  open: boolean;
  onClose: () => void;
  selectedTrackIds: number[];
  selectedTracks: any[];
}

interface BatchEditUpdates {
  genre?: string;
  bpm?: number;
  key?: string;
  rating?: number;
  energy_level?: number;
  era?: string;
  mood_tags?: string[]; // Array of mood tags
  genre_tags?: string[]; // Array of genre tags
}

interface CrateOperation {
  crateIds: number[];
  action: 'add' | 'remove';
}

const GENRES = [
  // Electronic & Dance
  'House',
  'Deep House',
  'Tech House',
  'Progressive House',
  'Techno',
  'Minimal Techno',
  'Hard Techno',
  'Trance',
  'EDM',
  'Drum & Bass',
  'Dubstep',
  'Electronic',

  // Urban & Hip Hop
  'Hip Hop',
  'Rap',
  'Trap',
  'R&B',

  // Nigerian & African
  'Afrobeat',      // Classic (Fela era)
  'Afrobeats',     // Modern (2010s+)
  'Highlife',
  'Juju',
  'Fuji',
  'Apala',
  'Hip-Life',
  'Street-Pop',

  // Gospel & Christian
  'Gospel',
  'Christian',
  'Worship',
  'Praise',

  // Pop & Rock
  'Pop',
  'Dance Pop',
  'Electropop',
  'Rock',
  'Alternative',

  // Other Genres
  'Reggae',
  'Dancehall',
  'Funk',
  'Soul',
  'Jazz',
  'Latin',
  'Salsa',
  'Reggaeton',
  'Country',
  'Folk',
  'Blues',
  'Classical',
  'Other',
];

const KEYS = [
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
  '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B',
  '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B',
];

// TODO: Add UI elements for era and mood selection in batch edit
// For now, these will be available via individual track editing
const ERAS = [
  '70s',
  '80s',
  '90s',
  '2000s',
  '2010s',
  '2020s',
];

const MOODS = [
  'Romantic',
  'Love',
  'Happy',
  'Energetic',
  'Chill',
  'Melancholic',
  'Uplifting',
  'Dark',
  'Peaceful',
  'Aggressive',
  'Sensual',
  'Nostalgic',
  'Euphoric',
  'Introspective',
];

// Silence unused warnings - will be used when UI is implemented
void ERAS;
void MOODS;

export function BatchEditModal({
  open,
  onClose,
  selectedTrackIds,
  selectedTracks: _selectedTracks,
}: BatchEditModalProps) {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState<BatchEditUpdates>({});
  const [crateOperation, setCrateOperation] = useState<CrateOperation>({
    crateIds: [],
    action: 'add',
  });
  const [filenamePattern, setFilenamePattern] = useState<string>('');

  // Fetch all crates for crate selection
  const { data: crates = [] } = useQuery({
    queryKey: ['crates'],
    queryFn: async () => {
      const response = await api.get('/api/crates');
      return response.data;
    },
  });

  // Batch update mutation
  const batchUpdateMutation = useMutation({
    mutationFn: async (data: { trackIds: number[]; updates: BatchEditUpdates }) => {
      const response = await api.post('/api/batch/update', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully updated ${data.updatedCount} track(s)${
          data.failedCount > 0 ? `, ${data.failedCount} failed` : ''
        }`
      );
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
    onError: (error: any) => {
      toast.error(`Batch update failed: ${error.response?.data?.error || error.message}`);
    },
  });

  // Batch crate operation mutation
  const crateMutation = useMutation({
    mutationFn: async (data: { trackIds: number[]; crateIds: number[]; action: 'add' | 'remove' }) => {
      const endpoint = data.action === 'add'
        ? '/api/batch/add-to-crates'
        : '/api/batch/remove-from-crates';
      const response = await api.post(endpoint, {
        trackIds: data.trackIds,
        crateIds: data.crateIds,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      const action = variables.action === 'add' ? 'added to' : 'removed from';
      toast.success(
        `Successfully ${action} ${variables.crateIds.length} crate(s) for ${data.updatedCount} track(s)`
      );
      queryClient.invalidateQueries({ queryKey: ['crates'] });
    },
    onError: (error: any) => {
      toast.error(`Crate operation failed: ${error.response?.data?.error || error.message}`);
    },
  });

  // Batch filename parsing mutation
  const parseFilenamesMutation = useMutation({
    mutationFn: async (data: { trackIds: number[]; pattern: string }) => {
      const response = await api.post('/api/batch/parse-filenames', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully parsed ${data.updatedCount} filename(s)${
          data.failedCount > 0 ? `, ${data.failedCount} failed` : ''
        }`
      );
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: (error: any) => {
      toast.error(`Filename parsing failed: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleApplyUpdates = () => {
    if (Object.keys(updates).length === 0) {
      toast.error('Please select at least one field to update');
      return;
    }

    batchUpdateMutation.mutate({
      trackIds: selectedTrackIds,
      updates,
    });
  };

  const handleApplyCrateOperation = () => {
    if (crateOperation.crateIds.length === 0) {
      toast.error('Please select at least one crate');
      return;
    }

    crateMutation.mutate({
      trackIds: selectedTrackIds,
      crateIds: crateOperation.crateIds,
      action: crateOperation.action,
    });
  };

  const handleParseFilenames = () => {
    if (!filenamePattern) {
      toast.error('Please select a filename pattern');
      return;
    }

    parseFilenamesMutation.mutate({
      trackIds: selectedTrackIds,
      pattern: filenamePattern,
    });
  };

  const toggleCrate = (crateId: number) => {
    setCrateOperation((prev) => ({
      ...prev,
      crateIds: prev.crateIds.includes(crateId)
        ? prev.crateIds.filter((id) => id !== crateId)
        : [...prev.crateIds, crateId],
    }));
  };

  const isLoading =
    batchUpdateMutation.isPending ||
    crateMutation.isPending ||
    parseFilenamesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Batch Edit Tracks
          </DialogTitle>
          <DialogDescription>
            Editing {selectedTrackIds.length} selected track{selectedTrackIds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata Updates Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Update Metadata</h3>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select
                value={updates.genre || ''}
                onValueChange={(value) =>
                  setUpdates((prev) => ({ ...prev, genre: value }))
                }
              >
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre..." />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BPM */}
            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                min="60"
                max="200"
                placeholder="Enter BPM..."
                value={updates.bpm || ''}
                onChange={(e) =>
                  setUpdates((prev) => ({
                    ...prev,
                    bpm: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>

            {/* Key */}
            <div className="space-y-2">
              <Label htmlFor="key">Musical Key (Camelot)</Label>
              <Select
                value={updates.key || ''}
                onValueChange={(value) =>
                  setUpdates((prev) => ({ ...prev, key: value }))
                }
              >
                <SelectTrigger id="key">
                  <SelectValue placeholder="Select key..." />
                </SelectTrigger>
                <SelectContent>
                  {KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Select
                value={updates.rating?.toString() || ''}
                onValueChange={(value) =>
                  setUpdates((prev) => ({ ...prev, rating: parseInt(value) }))
                }
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="Select rating..." />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {'★'.repeat(rating)}
                      {'☆'.repeat(5 - rating)} ({rating})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
              <Label htmlFor="energy">Energy Level (1-5)</Label>
              <Select
                value={updates.energy_level?.toString() || ''}
                onValueChange={(value) =>
                  setUpdates((prev) => ({ ...prev, energy_level: parseInt(value) }))
                }
              >
                <SelectTrigger id="energy">
                  <SelectValue placeholder="Select energy level..." />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleApplyUpdates}
              disabled={isLoading || Object.keys(updates).length === 0}
              className="w-full"
            >
              {batchUpdateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Apply Metadata Updates
            </Button>
          </div>

          <Separator />

          {/* Crate Operations Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Crate Operations</h3>

            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={crateOperation.action}
                onValueChange={(value: 'add' | 'remove') =>
                  setCrateOperation((prev) => ({ ...prev, action: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add to Crates</SelectItem>
                  <SelectItem value="remove">Remove from Crates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Crates ({crateOperation.crateIds.length} selected)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                {crates
                  .filter((crate: any) => !crate.is_smart)
                  .map((crate: any) => (
                    <div key={crate.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`crate-${crate.id}`}
                        checked={crateOperation.crateIds.includes(crate.id)}
                        onCheckedChange={() => toggleCrate(crate.id)}
                      />
                      <label
                        htmlFor={`crate-${crate.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {crate.name} ({crate.track_count || 0} tracks)
                      </label>
                    </div>
                  ))}
                {crates.filter((c: any) => !c.is_smart).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No manual crates available. Smart crates cannot be edited manually.
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleApplyCrateOperation}
              disabled={isLoading || crateOperation.crateIds.length === 0}
              className="w-full"
              variant="secondary"
            >
              {crateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {crateOperation.action === 'add' ? 'Add to' : 'Remove from'} Selected Crates
            </Button>
          </div>

          <Separator />

          {/* Parse Filenames Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parse Metadata from Filenames</h3>
            <p className="text-sm text-muted-foreground">
              Extract artist, title, BPM, or key from filename patterns
            </p>

            <div className="space-y-2">
              <Label htmlFor="pattern">Filename Pattern</Label>
              <Select
                value={filenamePattern}
                onValueChange={setFilenamePattern}
              >
                <SelectTrigger id="pattern">
                  <SelectValue placeholder="Select pattern..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist-title">Artist - Title</SelectItem>
                  <SelectItem value="title-artist">Title - Artist</SelectItem>
                  <SelectItem value="artist-title-bpm">Artist - Title - BPM</SelectItem>
                  <SelectItem value="artist-title-key">Artist - Title - Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleParseFilenames}
              disabled={isLoading || !filenamePattern}
              className="w-full"
              variant="outline"
            >
              {parseFilenamesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Parse Filenames
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
