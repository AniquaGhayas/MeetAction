import React from 'react';

export const AuthCallout: React.FC = () => {
  return (
    <div className="mt-6 pt-4 bg-surface-container-low/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 py-4 flex flex-col items-center gap-2 text-center">
      <p className="font-body-sm text-body-sm text-secondary">
        Don't have an account?{' '}
        <a
          href="#signup"
          className="text-primary font-semibold hover:underline decoration-primary transition-colors"
        >
          Create enterprise space
        </a>
      </p>

      {/* Security / Compliance Micro-Badge */}
      <div className="flex items-center gap-1.5 text-secondary/80 font-label-sm text-[11px] pt-1">
        <span
          className="material-symbols-outlined text-[14px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified_user
        </span>
        <span>Protected by AES-256 • SOC2 &amp; HIPAA compliant</span>
      </div>
    </div>
  );
};
