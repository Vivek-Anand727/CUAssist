import React, { useState, useEffect } from 'react';

const Signup = ({ onSignupComplete }: { onSignupComplete: () => void }) => {
  const [username, setUsername] = useState('');
  const [UID, setUID] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
      setResendCooldown(120); // 2 minutes
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
      setTimeout(onSignupComplete, 1500);
    } catch {
      setError('OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UID }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Resend failed');
        return;
      }

      setResendCooldown(120);
      setMessage('OTP resent to your CU Email.');
    } catch {
      setError('Resend failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={step === 1 ? handleSignup : handleVerify} className="flex flex-col gap-4 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center text-red-700">
        {step === 1 ? 'Sign Up' : 'Verify OTP'}
      </h2>

      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {message && <div className="text-green-600 text-sm text-center">{message}</div>}

      {step === 1 ? (
        <>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="p-3 rounded border"
          />
          <input
            type="text"
            value={UID}
            onChange={(e) => setUID(e.target.value)}
            placeholder="UID"
            required
            className="p-3 rounded border"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="p-3 rounded border"
          />
        </>
      ) : (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            required
            className="p-3 rounded border"
          />
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || loading}
            className={`text-blue-600 text-sm underline disabled:text-gray-400`}
          >
            {resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : 'Resend OTP'}
          </button>
        </>
      )}

      <button type="submit" disabled={loading} className="bg-red-600 text-white py-2 px-4 rounded">
        {loading ? 'Please wait...' : step === 1 ? 'Register' : 'Verify OTP'}
      </button>
    </form>
  );
};

export default Signup;
