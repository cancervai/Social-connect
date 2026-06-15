import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { MetaVerificationStep } from './MetaVerificationStep';
import { LinkedInConnectStep } from './LinkedInConnectStep';

type Step = 'meta-verification' | 'linkedin-connect' | 'complete';

const steps: Step[] = ['meta-verification', 'linkedin-connect', 'complete'];

const stepLabels: Record<Step, string> = {
  'meta-verification': 'Meta Business',
  'linkedin-connect': 'LinkedIn',
  complete: 'Done',
};

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('meta-verification');
  const navigate = useNavigate();

  const stepIndex = steps.indexOf(currentStep);

  const goNext = () => {
    const next = steps[stepIndex + 1];
    if (next) setCurrentStep(next);
  };

  if (currentStep === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">You're all set!</h2>
        <p className="text-text-secondary mb-8">
          Your accounts are connected. Let's take you to the dashboard.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-accent-purple hover:bg-accent-purple-light text-white px-6 py-2.5 rounded-md font-medium transition-colors"
        >
          Go to Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center gap-2 mb-8 justify-center">
        {steps.slice(0, -1).map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={[
                'w-2.5 h-2.5 rounded-full transition-colors',
                idx < stepIndex
                  ? 'bg-green-400'
                  : idx === stepIndex
                  ? 'bg-accent-purple'
                  : 'bg-border-strong',
              ].join(' ')}
            />
            <span className={`text-xs ${idx === stepIndex ? 'text-text-primary' : 'text-text-muted'}`}>
              {stepLabels[step]}
            </span>
            {idx < steps.length - 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {currentStep === 'meta-verification' && <MetaVerificationStep onComplete={goNext} />}
      {currentStep === 'linkedin-connect' && <LinkedInConnectStep onComplete={goNext} />}
    </div>
  );
}
