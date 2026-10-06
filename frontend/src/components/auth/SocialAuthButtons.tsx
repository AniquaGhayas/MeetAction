import React from 'react';

interface SocialAuthButtonsProps {
  onGoogleSignIn?: () => void;
  onAtlassianSignIn?: () => void;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleSignIn,
  onAtlassianSignIn,
}) => {
  return (
    <>
      <div className="flex flex-col gap-2.5 mb-5">
        {/* Google SSO */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full h-10 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-center gap-3 text-on-surface font-label-md text-label-md shadow-sm active:scale-[0.99] duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Atlassian SSO */}
        <button
          type="button"
          onClick={onAtlassianSignIn}
          className="w-full h-10 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-center gap-3 text-on-surface font-label-md text-label-md shadow-sm active:scale-[0.99] duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M11.53 2c-.22.37-.36.81-.36 1.28v8.66c0 1.21.99 2.2 2.2 2.2h4.54c.48 0 .93-.15 1.3-.39L11.53 2z"
              fill="#0052CC"
            />
            <path
              d="M11.49 9.94c0-.49-.15-.94-.39-1.32L4.78 22h7.32c1.21 0 2.2-.99 2.2-2.2v-7.66c0-1.21-.99-2.2-2.2-2.2h-.61z"
              fill="#2684FF"
            />
          </svg>
          <span>Continue with Atlassian</span>
        </button>
      </div>

      {/* Styled Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="w-full h-px bg-surface-variant" />
        <span className="absolute bg-surface-container-lowest px-3 font-label-sm text-[10px] tracking-wider uppercase text-secondary font-medium">
          Or continue with email
        </span>
      </div>
    </>
  );
};
