import React, { useState } from 'react';
import Login from './Login';
import Signup from './SignUp';

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#ff6b6b,#ffffff,#ff8787,#ffeaea)] bg-[length:400%_400%] z-0" />

      {/* Form container */}
      <div className="relative z-10 bg-white/80 shadow-xl rounded-xl p-10 w-full max-w-md backdrop-blur-md">
        {isLogin ? <Login /> : <Signup />}

        <p className="mt-6 text-center text-gray-700">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-500 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default App;
