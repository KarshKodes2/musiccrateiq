// frontend/src/features/crates/SmartCrateBuilder.tsx
import React, { useState, useEffect } from 'react';
import { CrateRuleEditor, CrateRule } from './CrateRuleEditor';
import { api } from '../../services/api';

interface SmartCrateCriteria {
  logic: 'AND' | 'OR';
  rules: CrateRule[];
}

interface SmartCrateBuilderProps {
  existingCrate?: {
    id?: number;
    name: string;
    description?: string;
    criteria: SmartCrateCriteria;
    color?: string;
    icon?: string;
  };
  onSave?: (crate: any) => void;
  onCancel?: () => void;
}

export const SmartCrateBuilder: React.FC<SmartCrateBuilderProps> = ({
  existingCrate,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(existingCrate?.name || '');
  const [description, setDescription] = useState(existingCrate?.description || '');
  const [color, setColor] = useState(existingCrate?.color || '#3B82F6');
  const [icon, setIcon] = useState(existingCrate?.icon || '📦');
  const [logic, setLogic] = useState<'AND' | 'OR'>(existingCrate?.criteria?.logic || 'AND');
  const [rules, setRules] = useState<CrateRule[]>(
    existingCrate?.criteria?.rules || [
      { field: 'bpm', operator: 'range', value: [100, 130] }
    ]
  );
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconOptions = ['📦', '🎵', '🎧', '🎤', '🎸', '🎹', '🥁', '🎺', '🎷', '🎻', '🔥', '⚡', '✨', '🌟', '💎', '🏆', '❤️', '💜', '💙', '💚', '💛', '🧡', '🇳🇬', '✝️', '🙏'];

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  useEffect(() => {
    // Auto-preview on rule changes (debounced)
    const timer = setTimeout(() => {
      fetchPreview();
    }, 500);

    return () => clearTimeout(timer);
  }, [rules, logic]);

  const fetchPreview = async () => {
    if (rules.length === 0) {
      setPreviewCount(0);
      return;
    }

    try {
      setLoading(true);
      const criteria = { logic, rules };
      const response = await api.post('/crates/preview', { criteria });
      setPreviewCount(response.data.count);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching preview:', err);
      setError('Failed to preview tracks');
      setPreviewCount(null);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    setRules([
      ...rules,
      { field: 'bpm', operator: 'range', value: [100, 130] }
    ]);
  };

  const updateRule = (index: number, newRule: CrateRule) => {
    const newRules = [...rules];
    newRules[index] = newRule;
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a crate name');
      return;
    }

    if (rules.length === 0) {
      setError('Please add at least one rule');
      return;
    }

    try {
      setLoading(true);
      const crateData = {
        name: name.trim(),
        description: description.trim(),
        type: 'smart',
        is_smart: true,
        color,
        icon,
        criteria: { logic, rules },
      };

      let response;
      if (existingCrate?.id) {
        response = await api.put(`/crates/${existingCrate.id}`, crateData);
      } else {
        response = await api.post('/crates', crateData);
      }

      setError(null);
      if (onSave) {
        onSave(response.data);
      }
    } catch (err: any) {
      console.error('Error saving crate:', err);
      setError(err.response?.data?.error || 'Failed to save crate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {existingCrate?.id ? 'Edit Smart Crate' : 'Create Smart Crate'}
        </h2>
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-foreground"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Crate Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., High Energy House Music"
            className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this crate contains..."
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map((iconOption) => (
                <button
                  key={iconOption}
                  onClick={() => setIcon(iconOption)}
                  className={`text-2xl px-3 py-2 border rounded-lg hover:bg-accent ${
                    icon === iconOption ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`h-10 rounded-lg border-2 ${
                    color === colorOption.value ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-muted-foreground">
            Rules
          </label>
          <select
            value={logic}
            onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}
            className="px-3 py-1 border border-border rounded-lg text-sm font-medium bg-muted text-foreground"
          >
            <option value="AND">Match ALL rules (AND)</option>
            <option value="OR">Match ANY rule (OR)</option>
          </select>
        </div>

        <div className="space-y-2 bg-muted p-4 rounded-lg">
          {rules.map((rule, index) => (
            <CrateRuleEditor
              key={index}
              rule={rule}
              onChange={(newRule) => updateRule(index, newRule)}
              onRemove={() => removeRule(index)}
            />
          ))}

          <button
            onClick={addRule}
            className="w-full px-4 py-2 border border-dashed border-border rounded-lg text-muted-foreground hover:bg-card hover:border-primary hover:text-foreground"
          >
            + Add Rule
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Preview: {loading ? 'Calculating...' : previewCount !== null ? `${previewCount} tracks match` : 'Add rules to preview'}
          </span>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="text-sm text-primary hover:text-primary/80 underline"
          >
            Refresh Preview
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p><strong className="text-foreground">Tip:</strong> Smart crates automatically update when you scan your library.</p>
        <p>Use multiple rules to create precise collections (e.g., "BPM 120-130 AND Energy ≥ 4 AND Genre contains Afrobeats").</p>
      </div>
    </div>
  );
};
