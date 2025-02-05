// ... existing imports ...
import * as React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">
        {/* potentially wrap children with a provider */}
        {children}
      </div>
    </div>
  );
}
