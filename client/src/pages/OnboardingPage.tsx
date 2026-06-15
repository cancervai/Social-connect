import { Zap } from 'lucide-react';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';

export function OnboardingPage() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-accent-purple flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-text-primary">Social Connect</span>
      </div>

      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Connect your accounts</h1>
          <p className="text-text-secondary">
            Set up your social platforms to unlock the full dashboard. This takes about 5 minutes.
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
}
