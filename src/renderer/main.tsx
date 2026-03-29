import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app';
import { initializeTheme, ThemeProvider } from './components/theme-provider';
import './index.css';

const rootElement = document.querySelector<HTMLDivElement>('#app');

if (!rootElement) {
    throw new Error('App container was not found.');
}

initializeTheme();

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
