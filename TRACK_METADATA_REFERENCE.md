# Track Metadata Field Reference

MusicCrateIQ supports comprehensive metadata fields compatible with Serato DJ, Rekordbox, Traktor, and standard audio file formats.

## Standard Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Track title |
| `artist` | String | Primary artist name |
| `album` | String | Album name |
| `album_artist` | String | Album artist (for compilations) |
| `genre` | String | Primary genre |
| `label` | String | Record label |
| `remixer` | String | Remixer name |
| `composer` | String | Composer/songwriter |
| `conductor` | String | Conductor (classical) |
| `lyricist` | String | Lyricist |
| `publisher` | String | Publisher |
| `isrc` | String | International Standard Recording Code |
| `year` | Integer | Release year |
| `track_number` | Integer | Track position on album |
| `disc_number` | Integer | Disc number (multi-disc releases) |
| `total_tracks` | Integer | Total tracks on album |
| `total_discs` | Integer | Total discs |
| `compilation` | Boolean | Part of a compilation |
| `copyright` | String | Copyright notice |
| `encoded_by` | String | Encoding software |
| `original_artist` | String | Original artist (covers) |
| `original_album` | String | Original album |
| `original_year` | Integer | Original release year |

## Technical Metadata

| Field | Type | Description |
|-------|------|-------------|
| `duration` | Float | Track length in seconds |
| `bitrate` | Integer | Audio bitrate (kbps) |
| `sample_rate` | Integer | Sample rate (Hz) |
| `channels` | Integer | Audio channels (1=mono, 2=stereo) |
| `bit_depth` | Integer | Bit depth (16/24/32) |
| `codec` | String | Audio codec (MP3, AAC, FLAC, etc.) |
| `file_size` | Integer | File size in bytes |
| `file_type` | String | File extension |

## BPM/Tempo Analysis

| Field | Type | Description |
|-------|------|-------------|
| `bpm` | Float | Beats per minute |
| `bpm_locked` | Boolean | BPM is locked/verified |
| `bpm_confidence` | Float | BPM detection confidence (0-1) |
| `bpm_source` | Enum | Source: metadata, aubio, essentia, manual, pending |
| `original_bpm` | Float | Original BPM before adjustment |
| `bpm_range_low` | Float | Variable tempo low end |
| `bpm_range_high` | Float | Variable tempo high end |
| `time_signature` | String | Time signature (4/4, 3/4, 6/8) |

## Key Analysis

| Field | Type | Description |
|-------|------|-------------|
| `key_signature` | String | Musical key (e.g., "Cm", "F#") |
| `key_locked` | Boolean | Key is locked/verified |
| `key_confidence` | Float | Key detection confidence (0-1) |
| `key_source` | Enum | Source: metadata, aubio, essentia, manual, pending |
| `camelot_code` | String | Camelot wheel notation (1A-12B) |
| `open_key` | String | Open Key notation |

## Audio Characteristics

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `energy_level` | Integer | 1-5 | Overall energy/intensity |
| `danceability` | Float | 0-1 | How danceable the track is |
| `valence` | Float | 0-1 | Musical positivity/mood |
| `acousticness` | Float | 0-1 | Acoustic instrument presence |
| `instrumentalness` | Float | 0-1 | Vocal absence |
| `liveness` | Float | 0-1 | Live performance presence |
| `speechiness` | Float | 0-1 | Spoken word presence |
| `tempo_stability` | Float | 0-1 | BPM consistency |
| `dynamic_range` | Float | dB | Loudness range |
| `loudness` | Float | LUFS | Integrated loudness |
| `peak_level` | Float | dB | Peak amplitude |
| `perceived_loudness` | Float | - | Perceived loudness level |

## DJ Structure Analysis

| Field | Type | Description |
|-------|------|-------------|
| `intro_time` | Float | Intro end time (seconds) |
| `outro_time` | Float | Outro start time (seconds) |
| `first_beat` | Float | First beat position (seconds) |
| `first_downbeat` | Float | First downbeat position |
| `phrase_length` | Integer | Typical phrase length (bars) |
| `drop_time` | Float | Main drop position |
| `breakdown_time` | Float | Breakdown start position |

## Content Flags

| Field | Type | Description |
|-------|------|-------------|
| `explicit_content` | Boolean | Contains explicit content |
| `language` | String | Primary language (ISO 639-1) |
| `lyrics` | Text | Full lyrics text |
| `lyrics_synced` | Text | LRC format synced lyrics |

## Mood & Classification

| Field | Type | Description |
|-------|------|-------------|
| `mood` | String | Primary mood |
| `mood_tags` | JSON | Array of mood descriptors |
| `genre_tags` | JSON | Array of sub-genres |
| `style_tags` | JSON | Array of style tags |
| `situation_tags` | JSON | Situational tags (party, workout, chill) |
| `era` | Enum | Decade era (70s, 80s, 90s, 2000s, 2010s, 2020s) |
| `decade` | String | Decade string |

## User Data

| Field | Type | Description |
|-------|------|-------------|
| `color` | String | Track color (hex or name) |
| `rating` | Integer | Star rating (0-5) |
| `play_count` | Integer | Times played |
| `skip_count` | Integer | Times skipped |
| `last_played` | DateTime | Last play timestamp |
| `date_added` | DateTime | Library add date |
| `date_modified` | DateTime | Last modification date |
| `favorite` | Boolean | Marked as favorite |

## Serato DJ Fields

| Field | Type | Description |
|-------|------|-------------|
| `serato_id` | String | Serato internal ID |
| `serato_analysis_version` | String | Serato analysis version |
| `serato_autotags` | JSON | Auto-generated genre tags |
| `serato_markers` | JSON | Serato marker data |
| `serato_overview` | Text | Overview waveform data |
| `serato_beatgrid` | Text | Beatgrid in Serato format |
| `serato_offsets` | Text | Timing offset data |
| `serato_flip` | JSON | Serato Flip performance data |

## Rekordbox Fields

| Field | Type | Description |
|-------|------|-------------|
| `rekordbox_id` | String | Rekordbox internal ID |
| `rekordbox_analysis_version` | String | Analysis version |
| `rekordbox_color` | String | Track color in Rekordbox format |
| `rekordbox_rating` | Integer | Rekordbox rating (0-255) |
| `rekordbox_my_tag` | JSON | My Tag categories |
| `rekordbox_mix_name` | String | Mix name field |
| `rekordbox_phrase` | JSON | Phrase analysis data |
| `rekordbox_active_cue` | Integer | Active cue point index |
| `rekordbox_quantize` | Boolean | Quantize enabled |
| `rekordbox_tempo_range` | Integer | Tempo slider range (6/10/16/wide) |

## Traktor Fields

| Field | Type | Description |
|-------|------|-------------|
| `traktor_id` | String | Traktor internal ID |
| `traktor_grid_offset` | Float | Beatgrid offset (ms) |
| `traktor_grid_locked` | Boolean | Beatgrid locked |
| `traktor_stripe` | Text | Traktor stripe waveform |
| `traktor_analyzed` | Boolean | Has been analyzed |

## Universal DJ Data (JSON Format)

| Field | Type | Description |
|-------|------|-------------|
| `beatgrid` | JSON | Universal beatgrid format |
| `cue_points` | JSON | All cue points with names/colors |
| `hot_cues` | JSON | Hot cues (slots 1-8) |
| `memory_cues` | JSON | Memory cues (unlimited) |
| `loops` | JSON | Saved loops with positions/colors |
| `waveform_overview` | Base64 | Overview waveform image |
| `waveform_detail` | Base64 | Detailed waveform data |

### Cue Point JSON Format
```json
{
  "index": 1,
  "position": 32.456,
  "name": "Drop",
  "color": "#FF0000",
  "type": "hot_cue"
}
```

### Loop JSON Format
```json
{
  "index": 1,
  "start": 64.000,
  "end": 96.000,
  "name": "Build",
  "color": "#00FF00",
  "active": false
}
```

### Beatgrid JSON Format
```json
{
  "first_beat": 0.123,
  "bpm": 128.0,
  "time_signature": "4/4",
  "anchors": [
    { "beat": 1, "position": 0.123 },
    { "beat": 129, "position": 60.123 }
  ]
}
```

## Artwork

| Field | Type | Description |
|-------|------|-------------|
| `artwork_path` | String | Local artwork file path |
| `artwork_embedded` | Boolean | Has embedded artwork |
| `artwork_url` | String | External artwork URL |

## Organization

| Field | Type | Description |
|-------|------|-------------|
| `comment` | Text | User comments |
| `grouping` | String | Grouping field |
| `folder_path` | String | Folder location |
| `catalog_number` | String | Release catalog number |
| `release_type` | String | Single/EP/Album/Compilation |

## System Fields

| Field | Type | Description |
|-------|------|-------------|
| `file_path` | String | Full file path (unique key) |
| `file_hash` | String | MD5 hash for duplicate detection |
| `analysis_status` | Enum | pending, analyzing, complete, failed |
| `analysis_version` | String | Analysis engine version |
| `needs_reanalysis` | Boolean | Flag for re-analysis |
| `created_at` | DateTime | Record creation time |
| `updated_at` | DateTime | Last update time |

---

## Camelot Wheel Reference

The Camelot Wheel is used for harmonic mixing:

| Key | Camelot | Compatible Keys |
|-----|---------|-----------------|
| C Major | 8B | 7B, 9B, 8A |
| A Minor | 8A | 7A, 9A, 8B |
| G Major | 9B | 8B, 10B, 9A |
| E Minor | 9A | 8A, 10A, 9B |
| D Major | 10B | 9B, 11B, 10A |
| B Minor | 10A | 9A, 11A, 10B |
| A Major | 11B | 10B, 12B, 11A |
| F# Minor | 11A | 10A, 12A, 11B |
| E Major | 12B | 11B, 1B, 12A |
| C# Minor | 12A | 11A, 1A, 12B |
| B Major | 1B | 12B, 2B, 1A |
| G# Minor | 1A | 12A, 2A, 1B |
| F# Major | 2B | 1B, 3B, 2A |
| D# Minor | 2A | 1A, 3A, 2B |
| Db Major | 3B | 2B, 4B, 3A |
| Bb Minor | 3A | 2A, 4A, 3B |
| Ab Major | 4B | 3B, 5B, 4A |
| F Minor | 4A | 3A, 5A, 4B |
| Eb Major | 5B | 4B, 6B, 5A |
| C Minor | 5A | 4A, 6A, 5B |
| Bb Major | 6B | 5B, 7B, 6A |
| G Minor | 6A | 5A, 7A, 6B |
| F Major | 7B | 6B, 8B, 7A |
| D Minor | 7A | 6A, 8A, 7B |

---

## Data Import/Export

### Supported Import Formats
- **Serato**: Crates, subcrates, cue points, loops, beatgrids
- **Rekordbox**: Playlists, hot cues, memory cues, phrases
- **Traktor**: Collections, beatgrids, cue points
- **iTunes/Music.app**: Playlists, ratings, play counts
- **ID3v2.4/Vorbis/MP4**: All standard metadata tags

### Supported Export Formats
- Serato-compatible CSV
- Rekordbox XML
- M3U/M3U8 playlists
- JSON (full metadata)
