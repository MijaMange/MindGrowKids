import JourneyLayout from '../../journey/JourneyLayout';
import { useJourney } from '../../journey/JourneyStore';
import StepEmotion from '../../journey/steps/StepEmotion';
import StepWhy from '../../journey/steps/StepWhy';
import StepDraw from '../../journey/steps/StepDraw';
import StepSummary from '../../journey/steps/StepSummary';

const STEPS = [StepEmotion, StepWhy, StepDraw, StepSummary];

export default function JourneyPage() {
  const step = useJourney((s) => s.step);
  const Comp = STEPS[step] || StepEmotion;
  return <JourneyLayout stepCount={STEPS.length}>{<Comp />}</JourneyLayout>;
}


