import { useState } from 'react';
import { Building2, FileText, Upload, CheckCircle, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { submitMetaVerification, getMetaOAuthUrl } from '../../services/metaService';

type SubStep = 'connect' | 'business-info' | 'method' | 'documents' | 'submitted';

interface Props {
  onComplete: () => void;
}

export function MetaVerificationStep({ onComplete }: Props) {
  const [subStep, setSubStep] = useState<SubStep>('connect');
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [method, setMethod] = useState<'BUSINESS_DOCUMENTS' | 'DOMAIN'>('BUSINESS_DOCUMENTS');

  const handleConnectMeta = async () => {
    setLoading(true);
    try {
      const url = await getMetaOAuthUrl();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    setLoading(true);
    try {
      await submitMetaVerification({ businessName, address, country, verificationMethod: method });
      setSubStep('submitted');
    } finally {
      setLoading(false);
    }
  };

  if (subStep === 'connect') {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-meta/10 flex items-center justify-center">
            <span className="text-meta font-bold text-sm">f</span>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Connect Meta Business Suite</h3>
            <p className="text-sm text-text-secondary">Link your Facebook Pages & Instagram</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          Connect your Meta account to manage posts, access analytics, sync leads, and run ads across
          Facebook and Instagram.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleConnectMeta} loading={loading} className="flex-1">
            Connect with Meta
          </Button>
          <Button variant="ghost" onClick={() => setSubStep('business-info')}>
            Skip connection, go to verification
          </Button>
        </div>
      </Card>
    );
  }

  if (subStep === 'business-info') {
    return (
      <Card>
        <h3 className="font-semibold text-text-primary mb-1">Business Information</h3>
        <p className="text-sm text-text-secondary mb-6">
          Enter your legal business details for Meta Business Verification.
        </p>
        <div className="space-y-4">
          <Input
            label="Legal business name"
            placeholder="Acme Corp LLC"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Input
            label="Business address"
            placeholder="123 Main St, Dubai, UAE"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            label="Country code"
            placeholder="AE"
            maxLength={2}
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
          />
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setSubStep('connect')}>Back</Button>
          <Button
            onClick={() => setSubStep('method')}
            disabled={!businessName || !address || !country}
            icon={<ChevronRight size={16} />}
          >
            Continue
          </Button>
        </div>
      </Card>
    );
  }

  if (subStep === 'method') {
    return (
      <Card>
        <h3 className="font-semibold text-text-primary mb-1">Verification Method</h3>
        <p className="text-sm text-text-secondary mb-6">
          Choose how you'll verify your business with Meta.
        </p>
        <div className="space-y-3">
          {(['BUSINESS_DOCUMENTS', 'DOMAIN'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={[
                'w-full text-left p-4 rounded-lg border transition-colors',
                method === m ? 'border-accent-purple bg-accent-purple-dim' : 'border-border hover:border-border-strong',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                {m === 'BUSINESS_DOCUMENTS' ? <FileText size={18} className="text-accent-purple-light" /> : <Building2 size={18} className="text-accent-cyan-light" />}
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {m === 'BUSINESS_DOCUMENTS' ? 'Business Documents' : 'Domain Verification'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {m === 'BUSINESS_DOCUMENTS'
                      ? 'Trade license, utility bill, or bank statement'
                      : 'Verify by adding a DNS record to your domain'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setSubStep('business-info')}>Back</Button>
          <Button onClick={() => setSubStep('documents')} icon={<ChevronRight size={16} />}>
            Continue
          </Button>
        </div>
      </Card>
    );
  }

  if (subStep === 'documents') {
    return (
      <Card>
        <h3 className="font-semibold text-text-primary mb-1">Upload Documents</h3>
        <p className="text-sm text-text-secondary mb-6">
          Upload the required verification documents. Accepted formats: PDF, JPG, PNG.
        </p>
        <div className="space-y-3">
          {['Trade License / Business Registration', 'Utility Bill (< 3 months old)', 'Bank Statement (optional)'].map((doc) => (
            <div
              key={doc}
              className="flex items-center justify-between p-4 rounded-lg border border-border border-dashed hover:border-border-strong transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Upload size={16} className="text-text-muted" />
                <span className="text-sm text-text-secondary">{doc}</span>
              </div>
              <span className="text-xs text-text-muted">Click to upload</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-4">
          Note: File upload integration requires a storage service (e.g. S3, Cloudflare R2).
          Implement file upload in the backend before enabling this in production.
        </p>
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setSubStep('method')}>Back</Button>
          <Button onClick={handleSubmitVerification} loading={loading}>
            Submit Verification
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-yellow-500/15 flex items-center justify-center mb-4">
          <CheckCircle size={24} className="text-yellow-400" />
        </div>
        <h3 className="font-semibold text-text-primary mb-2">Verification Submitted</h3>
        <p className="text-sm text-text-secondary mb-6">
          Meta will review your documents within <strong>2–5 business days</strong>. You'll receive an
          email notification when approved.
        </p>
        <Button onClick={onComplete}>Continue to LinkedIn →</Button>
      </div>
    </Card>
  );
}
