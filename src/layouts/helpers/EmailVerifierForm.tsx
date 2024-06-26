import React, { useEffect, useState } from 'react';

interface VerificationResult {
  is_role_account: boolean;
  is_free_email: boolean;
  is_disposable: boolean;
  is_spamtrap: boolean;
  username: string;
  email: string;
  status: string;
  domain: string;
}

const EmailVerifierForm = ({ apiKey }: { apiKey: string }) => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationCount, setVerificationCount] = useState<number>(0);

  const dailyLimit = 20;

  useEffect(() => {
    const fetchVerificationCount = async () => {
      try {
        const response = await fetch('/api/dailyAPICount');
        const data = await response.json();
        setVerificationCount(data);
      } catch (error) {
        console.error('Failed to fetch verification count:', error);
      }
    };

    fetchVerificationCount();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(
        `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${apiKey}&mode=quick`
      );
      const data = await response.json();
      setVerificationResult(data);
      setVerificationCount(prevCount => prevCount + 1);

      await fetch('/api/dailyAPICount', {
        method: 'POST',
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnother = () => {
    setVerificationResult(null);
    setEmail('');
    setErrorMessage('');
  };

  const remainingVerifications = dailyLimit - verificationCount;

  return (
    <div className='border border-border/50 rounded-lg'>
      {remainingVerifications > 0 ? (

        verificationResult ? (
          <div className='text-center space-y-4'>
            <div className='pb-4 pt-6 border-b border-border/30 '>
              <h3 className='text-base'>Email Validation Result</h3>
            </div>
            <div className='text-sm'>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>Result: <span className={`capitalize ${verificationResult.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>{verificationResult.status}</span></p>
                <p>Role: <span className={verificationResult.is_role_account ? 'text-green-600' : 'text-red-600'}>{verificationResult.is_role_account ? 'Yes' : 'No'}</span></p>
                <p>Free: <span className={verificationResult.is_free_email ? 'text-green-600' : 'text-red-600'}>{verificationResult.is_free_email ? 'Yes' : 'No'}</span></p>
                <p>Disposable: <span className={verificationResult.is_disposable ? 'text-red-600' : 'text-green-600'}>{verificationResult.is_disposable ? 'Yes' : 'No'}</span></p>
                <p>Spamtrap: <span className={verificationResult.is_spamtrap ? 'text-red-600' : 'text-green-600'}>{verificationResult.is_spamtrap ? 'Yes' : 'No'}</span></p>

                <p>User: <span className='text-light'>{verificationResult.username}</span></p>
                <p>Domain: <span className='text-light'>{verificationResult.domain}</span></p>
                <p>Email: <span className='text-light'>{verificationResult.email}</span></p>
              </div>
            </div>

            <div className="pb-8 pt-4">
              <button onClick={handleVerifyAnother} className='btn btn-effect-0'>
                Verify Another Email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-y-6 p-8'>
            <input
              className='timeline-form-input w-[95%] md:w-[80%] placeholder:text-center'
              type="email"
              placeholder="Enter the email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={remainingVerifications <= 0}
            />
            <p className='text-sm text-text'>Remaining verifications for today: {remainingVerifications}</p>
            <button type="submit" className="btn btn-effect-0 block" disabled={isLoading || remainingVerifications <= 0}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )
      ) : (
        <p className='text-sm text-text'>You have reached the daily limit of email verifications. Please try again tomorrow.</p>
      )}
      {errorMessage && <p className='text-red-500 mt-4'>{errorMessage}</p>}
    </div>
  );
};

export default EmailVerifierForm;
