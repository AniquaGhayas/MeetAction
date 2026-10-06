import React from 'react';
import { BrandHeader } from './BrandHeader';
import { SocialAuthButtons } from './SocialAuthButtons';
import { LoginForm } from './LoginForm';
import { AuthCallout } from './AuthCallout';

interface LoginCardProps {
  onGoogleSignIn?: () => void;
  onAtlassianSignIn?: () => void;
  onEmailSignIn?: (credentials: { email: string; password: string; rememberDevice: boolean }) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onGoogleSignIn,
  onAtlassianSignIn,
  onEmailSignIn,
}) => {
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl p-6 sm:p-8 flex flex-col relative overflow-hidden">
      {/* Top Warm Brand Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-fixed-dim" />

      {/* Brand Header */}
      <BrandHeader />

      {/* Social Authentication */}
      <SocialAuthButtons
        onGoogleSignIn={onGoogleSignIn}
        onAtlassianSignIn={onAtlassianSignIn}
      />

      {/* Email Login Form */}
      <LoginForm onSubmit={onEmailSignIn} />

      {/* Callout / Compliance Badge */}
      <AuthCallout />
    </div>
  );
};
