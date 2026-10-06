import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

type AppScreen = 'login' | 'dashboard';

function App() {
  const [screen, setScreen] = useState<AppScreen>('login');

  const handleLoginSuccess = () => {
    setScreen('dashboard');
  };

  const handleSignOut = () => {
    setScreen('login');
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
