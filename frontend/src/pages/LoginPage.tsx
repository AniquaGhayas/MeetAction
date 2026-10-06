import React from 'react';
import { LoginCard } from '../components/auth/LoginCard';
import { PageFooter } from '../components/auth/PageFooter';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleGoogleSignIn = () => {
    console.log('Initiating Google SSO flow...');
  };

  const handleAtlassianSignIn = () => {
    console.log('Initiating Atlassian Jira SSO flow...');
  };

  const handleEmailSignIn = (credentials: { email: string; password: string; rememberDevice: boolean }) => {
    console.log('Authenticating credentials:', credentials);
    // Simulate auth success — replace with real API call
    setTimeout(() => onLoginSuccess?.(), 1800);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-space-md relative overflow-x-hidden">
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
