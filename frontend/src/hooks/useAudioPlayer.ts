// Custom hook for audio player functionality
import { useAppSelector } from '../store';

export const useAudioPlayer = () => {
  const player = useAppSelector(state => state.audio.player);

  // Audio player logic will go here

  return {
    ...player,
    // Player methods will be exposed here
  };
};
