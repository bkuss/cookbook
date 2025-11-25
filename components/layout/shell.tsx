'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="md:pl-64 min-h-screen transition-all duration-300 ease-in-out">
        <div className="pb-20 md:pb-0 h-full">
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
