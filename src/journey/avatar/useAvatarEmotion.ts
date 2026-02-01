import { useJourney } from '../JourneyStore';

export function useAvatarEmotion() {
  const emotion = useJourney((s) => s.emotion);
  if (!emotion) return 'idle';
  return `react-${emotion}`; // tex 'react-glad'
}




