import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit?: (credentials: { email: string; password: string; rememberDevice: boolean }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'connecting'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;

    setStatus('authenticating');
    if (onSubmit) {
      onSubmit({ email, password, rememberDevice });
    }

    setTimeout(() => {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('idle');
      }, 1000);
    }, 800);
  };

  const getButtonText = () => {
    switch (status) {
      case 'authenticating':
        return 'Authenticating...';
      case 'connecting':
        return 'Connecting Workspace...';
      default:
        return 'Sign In to Workspace';
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Work Email Field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="workEmail"
          className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"
        >
          <span>Work Email</span>
          <span className="text-secondary text-[11px]">Domain SSO enabled</span>
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px] pointer-events-none select-none">
            mail
          </span>
          <input
            id="workEmail"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.vance@company.com"
            className="w-full h-[40px] pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-secondary/60 font-body-md text-body-md transition-all outline-none focus:bg-surface-container-lowest focus:shadow-md"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="userPassword" className="font-label-md text-label-md text-on-surface font-medium">
            Password
          </label>
          <a
            href="#forgot-password"
            className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px] pointer-events-none select-none">
            lock
          </span>
          <input
            id="userPassword"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full h-[40px] pl-9 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-secondary/60 font-body-md text-body-md transition-all outline-none focus:bg-surface-container-lowest focus:shadow-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 p-1 rounded hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] block">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Checkbox & Remember Device */}
      <div className="flex items-center justify-between mt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center">
            <input
              id="rememberDevice"
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-4 h-4 rounded bg-surface-container-low peer-checked:bg-primary transition-colors flex items-center justify-center shadow-xs">
              <svg
                className={`w-3 h-3 text-on-primary transition-opacity ${
                  rememberDevice ? 'opacity-100' : 'opacity-0'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <span className="font-body-sm text-body-sm text-secondary group-hover:text-on-surface transition-colors">
            Remember this device for 30 days
          </span>
        </label>
      </div>

      {/* Primary Action Button */}
      <button
        type="submit"
        disabled={status !== 'idle'}
        className={`w-full h-11 mt-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer ${
          status !== 'idle' ? 'opacity-90 cursor-wait' : ''
        }`}
      >
        <span>{getButtonText()}</span>
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
          arrow_forward
        </span>
      </button>
    </form>
  );
};
