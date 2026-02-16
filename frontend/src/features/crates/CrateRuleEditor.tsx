// frontend/src/features/crates/CrateRuleEditor.tsx
import React from 'react';

export interface CrateRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'range';
  value: any;
}

interface CrateRuleEditorProps {
  rule: CrateRule;
  onChange: (rule: CrateRule) => void;
  onRemove: () => void;
}

export const CrateRuleEditor: React.FC<CrateRuleEditorProps> = ({
  rule,
  onChange,
  onRemove,
}) => {
  const fieldOptions = [
    { value: 'bpm', label: 'BPM' },
    { value: 'key_signature', label: 'Key' },
    { value: 'energy_level', label: 'Energy Level' },
    { value: 'era', label: 'Era' },
    { value: 'genre_tags', label: 'Genre' },
    { value: 'mood_tags', label: 'Mood' },
    { value: 'rating', label: 'Rating' },
    { value: 'danceability', label: 'Danceability' },
    { value: 'valence', label: 'Valence' },
    { value: 'explicit_content', label: 'Explicit' },
    { value: 'year', label: 'Year' },
  ];

  const operatorOptions: Record<string, Array<{ value: string; label: string }>> = {
    bpm: [
      { value: 'range', label: 'Range' },
      { value: 'gt', label: '>' },
      { value: 'gte', label: '≥' },
      { value: 'lt', label: '<' },
      { value: 'lte', label: '≤' },
      { value: 'eq', label: '=' },
    ],
    key_signature: [
      { value: 'eq', label: '=' },
      { value: 'in', label: 'In' },
    ],
    energy_level: [
      { value: 'range', label: 'Range' },
      { value: 'gt', label: '>' },
      { value: 'gte', label: '≥' },
      { value: 'lt', label: '<' },
      { value: 'lte', label: '≤' },
      { value: 'eq', label: '=' },
    ],
    era: [
      { value: 'eq', label: '=' },
      { value: 'in', label: 'In' },
    ],
    genre_tags: [
      { value: 'contains', label: 'Contains' },
      { value: 'in', label: 'In' },
    ],
    mood_tags: [
      { value: 'contains', label: 'Contains' },
      { value: 'in', label: 'In' },
    ],
    rating: [
      { value: 'gte', label: '≥' },
      { value: 'eq', label: '=' },
    ],
    danceability: [
      { value: 'gte', label: '≥' },
      { value: 'range', label: 'Range' },
    ],
    valence: [
      { value: 'gte', label: '≥' },
      { value: 'range', label: 'Range' },
    ],
    explicit_content: [
      { value: 'eq', label: '=' },
    ],
    year: [
      { value: 'range', label: 'Range' },
      { value: 'gte', label: '≥' },
      { value: 'lte', label: '≤' },
    ],
  };

  const eraOptions = ['70s', '80s', '90s', '2000s', '2010s', '2020s'];

  const genreOptions = [
    'Afrobeat', 'Afrobeats', 'Highlife', 'Juju', 'Fuji', 'Apala',
    'Hip-Life', 'Street-Pop', 'Gospel', 'Hip Hop', 'R&B', 'Pop',
    'House', 'Techno', 'EDM', 'Rock', 'Jazz', 'Soul', 'Funk',
    'Reggae', 'Dancehall', 'Soca', 'Amapiano', 'Gqom'
  ];

  const moodOptions = [
    'romantic', 'love', 'energetic', 'peaceful', 'worship', 'praise',
    'celebration', 'joy', 'melancholic', 'uplifting', 'chill', 'party'
  ];

  const keyOptions = [
    '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
    '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B',
    '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'
  ];

  const handleFieldChange = (newField: string) => {
    const defaultOperator = operatorOptions[newField]?.[0]?.value || 'eq';
    onChange({
      field: newField,
      operator: defaultOperator as any,
      value: getDefaultValue(newField, defaultOperator),
    });
  };

  const handleOperatorChange = (newOperator: string) => {
    onChange({
      ...rule,
      operator: newOperator as any,
      value: getDefaultValue(rule.field, newOperator),
    });
  };

  const getDefaultValue = (field: string, operator: string): any => {
    if (operator === 'range') {
      if (field === 'bpm') return [100, 130];
      if (field === 'energy_level') return [3, 5];
      if (field === 'year') return [2000, 2020];
      return [0, 100];
    }
    if (operator === 'in' || operator === 'contains') {
      return [];
    }
    if (field === 'explicit_content') return 0;
    if (field === 'energy_level') return 3;
    if (field === 'rating') return 3;
    return '';
  };

  const renderValueInput = () => {
    if (rule.operator === 'range') {
      return (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={Array.isArray(rule.value) ? rule.value[0] : ''}
            onChange={(e) => onChange({
              ...rule,
              value: [Number(e.target.value), Array.isArray(rule.value) ? rule.value[1] : 0]
            })}
            className="w-20 px-2 py-1 border border-border rounded bg-card text-foreground"
            placeholder="Min"
          />
          <span>-</span>
          <input
            type="number"
            value={Array.isArray(rule.value) ? rule.value[1] : ''}
            onChange={(e) => onChange({
              ...rule,
              value: [Array.isArray(rule.value) ? rule.value[0] : 0, Number(e.target.value)]
            })}
            className="w-20 px-2 py-1 border border-border rounded bg-card text-foreground"
            placeholder="Max"
          />
        </div>
      );
    }

    if (rule.field === 'era' && (rule.operator === 'in' || rule.operator === 'eq')) {
      return (
        <select
          multiple={rule.operator === 'in'}
          value={rule.operator === 'in' ? rule.value : [rule.value]}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            onChange({
              ...rule,
              value: rule.operator === 'in' ? selected : selected[0]
            });
          }}
          className="px-2 py-1 border border-border rounded bg-card text-foreground"
        >
          {eraOptions.map(era => (
            <option key={era} value={era}>{era}</option>
          ))}
        </select>
      );
    }

    if (rule.field === 'genre_tags' && (rule.operator === 'in' || rule.operator === 'contains')) {
      return (
        <select
          multiple
          value={rule.value || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            onChange({ ...rule, value: selected });
          }}
          className="px-2 py-1 border border-border rounded min-w-[200px] bg-card text-foreground"
          size={5}
        >
          {genreOptions.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      );
    }

    if (rule.field === 'mood_tags' && (rule.operator === 'in' || rule.operator === 'contains')) {
      return (
        <select
          multiple
          value={rule.value || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            onChange({ ...rule, value: selected });
          }}
          className="px-2 py-1 border border-border rounded min-w-[200px] bg-card text-foreground"
          size={5}
        >
          {moodOptions.map(mood => (
            <option key={mood} value={mood}>{mood}</option>
          ))}
        </select>
      );
    }

    if (rule.field === 'key_signature') {
      return (
        <select
          multiple={rule.operator === 'in'}
          value={rule.operator === 'in' ? rule.value : [rule.value]}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            onChange({
              ...rule,
              value: rule.operator === 'in' ? selected : selected[0]
            });
          }}
          className="px-2 py-1 border border-border rounded bg-card text-foreground"
        >
          {keyOptions.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      );
    }

    if (rule.field === 'explicit_content') {
      return (
        <select
          value={rule.value}
          onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
          className="px-2 py-1 border border-border rounded bg-card text-foreground"
        >
          <option value={0}>Clean</option>
          <option value={1}>Explicit</option>
        </select>
      );
    }

    if (rule.field === 'energy_level' || rule.field === 'rating') {
      return (
        <input
          type="number"
          min="1"
          max="5"
          value={rule.value}
          onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
          className="w-20 px-2 py-1 border border-border rounded bg-card text-foreground"
        />
      );
    }

    if (rule.field === 'danceability' || rule.field === 'valence') {
      return (
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={rule.value}
          onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
          className="w-20 px-2 py-1 border border-border rounded bg-card text-foreground"
        />
      );
    }

    return (
      <input
        type="number"
        value={rule.value}
        onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
        className="w-24 px-2 py-1 border border-border rounded bg-card text-foreground"
      />
    );
  };

  return (
    <div className="flex gap-2 items-center bg-muted p-2 rounded">
      <select
        value={rule.field}
        onChange={(e) => handleFieldChange(e.target.value)}
        className="px-2 py-1 border border-border rounded bg-card text-foreground"
      >
        {fieldOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={rule.operator}
        onChange={(e) => handleOperatorChange(e.target.value)}
        className="px-2 py-1 border border-border rounded bg-card text-foreground"
      >
        {operatorOptions[rule.field]?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {renderValueInput()}

      <button
        onClick={onRemove}
        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
        title="Remove rule"
      >
        ✕
      </button>
    </div>
  );
};
