import React from 'react';
import { LoginCard } from '../components/auth/LoginCard';
import { PageFooter } from '../components/auth/PageFooter';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { api } from '../api/client';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleGoogleSignIn = () => {
    console.log('Google OAuth flow will be configured in integration phase');
  };

  const handleAtlassianSignIn = () => {
    console.log('Atlassian OAuth flow will be configured in integration phase');
  };

  const handleEmailSignIn = async (credentials: { email: string; password: string; isRegister: boolean }) => {
    if (credentials.isRegister) {
      await api.register(credentials.email, credentials.password);
    } else {
      await api.login(credentials.email, credentials.password);
    }
    onLoginSuccess?.();
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-space-md relative overflow-x-hidden">
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle variant="button" />
      </div>

      <main className="w-full max-w-md mx-auto relative">
        <div className="flex flex-col w-full items-center justify-center py-space-sm sm:py-space-md">
          {/* Subtle decorative ambient radial glow behind auth card */}
          <div
            className="absolute w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"
            style={{ transform: 'translateY(-10%)' }}
          />

          {/* Main Login Card */}
          <LoginCard
            onGoogleSignIn={handleGoogleSignIn}
            onAtlassianSignIn={handleAtlassianSignIn}
            onEmailSignIn={handleEmailSignIn}
          />

          {/* Page Utility Footer */}
          <PageFooter />
        </div>
      </main>
    </div>
  );
};
