import { useState } from 'react';

const Login = () => {
  const [UID, setUID] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UID, password }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-red-700">Login</h2>
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
        Login
      </button>
    </form>
  );
};

export default Login;
