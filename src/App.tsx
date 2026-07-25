import AdminScreen from './admin/AdminScreen';
import DisplayScreen from './display/DisplayScreen';

function Launcher() {
  return (
    <div className="launcher">
      <div className="logo-text">פונקט פארקערט</div>
      <h2>POC — שני מסכים סינכרוניים</h2>
      <div className="launcher-buttons">
        <a className="btn btn-primary" href="/admin">מסך ניהול</a>
        <a className="btn" href="/display" target="_blank" rel="noreferrer">מסך קהל (חלון חדש)</a>
      </div>
      <p className="launcher-note">פתחו את מסך הניהול בחלון הזה, ואת מסך הקהל בחלון נפרד — וגררו אותו למסך השני.</p>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return <AdminScreen />;
  if (path.startsWith('/display')) return <DisplayScreen />;
  return <Launcher />;
}
