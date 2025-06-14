import React, { useState } from 'react';
import LandingPage from '../LandingPage/LandingPage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SmartAuthForm from './SmartAuthForm';

type AuthMode = 'landing' | 'login' | 'register' | 'smart';

const AuthContainer: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('landing');

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
  };

  const handleBackToLanding = () => {
    setAuthMode('landing');
  };

  // Smart Auth Mode (default for new users)
  if (authMode === 'smart') {
    return <SmartAuthForm onBack={handleBackToLanding} />;
  }

  // Traditional Login Form
  if (authMode === 'login') {
    return (
      <LoginForm 
        onToggleMode={() => setAuthMode('register')} 
        onBack={handleBackToLanding} 
      />
    );
  }

  // Traditional Register Form
  if (authMode === 'register') {
    return (
      <RegisterForm 
        onToggleMode={() => setAuthMode('login')} 
        onBack={handleBackToLanding} 
      />
    );
  }

  // Landing Page with enhanced CTAs
  return (
    <LandingPage 
      onLogin={() => setAuthMode('smart')} // Use smart auth by default
      onRegister={() => setAuthMode('smart')} // Use smart auth by default
      onTraditionalLogin={() => setAuthMode('login')} // Optional traditional login
      onTraditionalRegister={() => setAuthMode('register')} // Optional traditional register
    />
  );
};

export default AuthContainer;