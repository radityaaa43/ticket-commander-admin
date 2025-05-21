
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TicketProvider } from './context/TicketContext.tsx'

createRoot(document.getElementById("root")!).render(
  <TicketProvider>
    <App />
  </TicketProvider>
);
