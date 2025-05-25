import { useState } from 'react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [UID, setUID] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, UID, password }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-red-700">Create Account</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="p-3 rounded border border-gray-300 focus:outline-red-600"
      />
      <input
        type="text"
        placeholder="UID"
        value={UID}
        onChange={(e) => setUID(e.target.value)}
        required
        className="p-3 rounded border border-gray-300 focus:outline-red-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-3 rounded border border-gray-300 focus:outline-red-600"
      />
      <button
        type="submit"
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
      >
        Register
      </button>
    </form>
  );
};

export default Signup;
