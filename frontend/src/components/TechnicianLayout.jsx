import { useState } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { TechnicianSidebar } from './Sidebar';
import NotificationPanel from './NotificationPanel';

/**
 * Technician layout wrapper with sidebar and notifications.
 */
export default function TechnicianLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Sidebar */}
      <TechnicianSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[#1F2937] bg-[#020617]/95 shadow-lg shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-[#9CA3AF] hover:bg-white/5 lg:hidden"
            >
              <HiMenuAlt3 className="h-6 w-6" />
            </button>

            <div className="flex flex-1" />

            {/* Notifications */}
            <NotificationPanel />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
