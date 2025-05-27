import React, { useState } from 'react';

const Signup = ({ onSignupComplete }: { onSignupComplete: () => void }) => {
  const [username, setUsername] = useState('');
  const [UID, setUID] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 -> Filling details , 2 -> Filling OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, UID, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
        return;
      }

      setStep(2);
      setMessage('OTP sent to CU Email.');
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UID, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Verification failed');
        return;
      }

      setMessage('Signup complete! Redirecting to login...');
      setTimeout(onSignupComplete, 1500); // Redirect to login after 1.5 seconds
    } catch {
      setError('OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={step === 1 ? handleSignup : handleVerify} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-red-700">{step === 1 ? 'Sign Up' : 'Verify OTP'}</h2>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {message && <div className="text-green-600 text-sm text-center">{message}</div>}

      {step === 1 ? (
        <>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="p-3 rounded border" />
          <input type="text" value={UID} onChange={(e) => setUID(e.target.value)} placeholder="UID" required className="p-3 rounded border" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="p-3 rounded border" />
        </>
      ) : (
        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" required className="p-3 rounded border" />
      )}

      <button type="submit" disabled={loading} className="bg-red-600 text-white py-2 px-4 rounded">
        {loading ? 'Please wait...' : step === 1 ? 'Register' : 'Verify OTP'}
      </button>
    </form>
  );
};

export default Signup;
