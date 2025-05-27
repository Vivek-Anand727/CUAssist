import React, {  useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './Login';
import Signup from './SignUp';
import Home from './Home';

  const Auth = ({ onAuth }: { onAuth: () => void }) => { //onAuth is a function 
  const [isLogin, setIsLogin] = useState(true); //isLogin is true means Login page is to be displayed 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 via-pink-100 to-red-200">
      <div className="bg-white/90 shadow-xl rounded-xl p-10 w-full max-w-md">
        {isLogin ? <Login onLogin={onAuth} /> : <Signup onSignupComplete={() => setIsLogin(true)} />}
        <p className="mt-6 text-center text-gray-700">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); // !! converts any value to boolean

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Auth onAuth={handleLogin} /> 
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
