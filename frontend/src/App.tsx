import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

type AppScreen = 'login' | 'dashboard';

function App() {
  const [screen, setScreen] = useState<AppScreen>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#login') return 'login';
    // If user has a dashboard route or hash is present, or defaults to dashboard
    if (
      hash === '#dashboard' ||
      hash === '#transcript-review' ||
      hash === '#capture-and-ingest' ||
      hash === '#integrations-and-settings'
    ) {
      return 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        setScreen('login');
      } else if (
        hash === '#dashboard' ||
        hash === '#transcript-review' ||
        hash === '#capture-and-ingest' ||
        hash === '#integrations-and-settings'
      ) {
        setScreen('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLoginSuccess = () => {
    setScreen('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleSignOut = () => {
    setScreen('login');
    window.location.hash = 'login';
  };

  if (screen === 'dashboard') {
    return (
      <DashboardPage
        onSignOut={handleSignOut}
        onNewMeeting={() => console.log('New meeting clicked')}
      />
    );
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

export default App;
