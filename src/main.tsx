
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check for saved theme before rendering to avoid flash
const darkMode = window.localStorage.getItem('theme') === 'dark';
if (darkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
