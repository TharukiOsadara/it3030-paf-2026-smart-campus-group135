import React, { useState, useEffect } from 'react';
import { Catalogue } from './components/Catalogue';
import { AdminPanel } from './components/AdminPanel';
import { LayoutGrid, ShieldAlert, Sun, Moon } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('catalogue');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <header
        className="sticky top-0 z-10 transition-colors duration-300"
        style={{
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transform -skew-x-6"
                style={{
                  background: 'linear-gradient(135deg, #0A84FF 0%, #8B74EA 100%)',
                  boxShadow: '0 4px 14px rgba(10, 132, 255, 0.22)'
                }}
              >
                <span className="font-bold text-white text-lg leading-none">S</span>
              </div>

              <h1 className="text-xl font-bold tracking-tight">
                <span
                  style={{
                    background: 'linear-gradient(135deg, #0A84FF 0%, #8B74EA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Smart Campus
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <nav className="flex gap-1">
                <button
                  onClick={() => setActiveTab('catalogue')}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  style={
                    activeTab === 'catalogue'
                      ? {
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-default)'
                        }
                      : {
                          color: 'var(--text-secondary)',
                          border: '1px solid transparent'
                        }
                  }
                >
                  <LayoutGrid className="w-4 h-4" />
                  Catalogue
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  style={
                    activeTab === 'admin'
                      ? {
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-default)'
                        }
                      : {
                          color: 'var(--text-secondary)',
                          border: '1px solid transparent'
                        }
                  }
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </button>
              </nav>

              <div className="w-px h-6 mx-1" style={{ background: 'var(--border-default)' }}></div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {activeTab === 'catalogue' ? 'Resource Catalogue' : 'Admin Dashboard'}
          </h2>

          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            {activeTab === 'catalogue'
              ? 'Browse and filter available resources across all locations.'
              : 'Manage resources, update details, and monitor availability.'}
          </p>
        </div>

        {activeTab === 'catalogue' ? <Catalogue /> : <AdminPanel />}
      </main>
    </div>
  );
}

export default App;
