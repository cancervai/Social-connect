import { useState } from 'react';
import { CheckCircle, Linkedin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getLinkedInOAuthUrl } from '../../services/linkedinService';

interface Props {
  onComplete: () => void;
}

export function LinkedInConnectStep({ onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await getLinkedInOAuthUrl();
      const popup = window.open(url, 'linkedin-oauth', 'width=600,height=700');

      const interval = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(interval);
          setConnected(true);
          setLoading(false);
        }
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">LinkedIn Connected!</h3>
          <p className="text-sm text-text-secondary mb-6">
            Your LinkedIn account has been connected successfully.
          </p>
          <Button onClick={onComplete}>Finish Setup →</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-linkedin/10 flex items-center justify-center">
          <Linkedin size={18} className="text-linkedin" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Connect LinkedIn</h3>
          <p className="text-sm text-text-secondary">Link your company page & ad account</p>
        </div>
      </div>
      <p className="text-sm text-text-secondary mb-6">
        Connect LinkedIn to schedule posts, monitor analytics, capture leads, and track ad campaign
        performance — all from one dashboard.
      </p>
      <ul className="text-sm text-text-secondary space-y-2 mb-6">
        {['Post to your company page', 'Access follower & engagement analytics', 'Sync lead gen form submissions', 'Monitor campaign spend and performance'].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <Button onClick={handleConnect} loading={loading} className="flex-1">
          Connect with LinkedIn
        </Button>
        <Button variant="ghost" onClick={onComplete}>
          Skip for now
        </Button>
      </div>
    </Card>
  );
}
