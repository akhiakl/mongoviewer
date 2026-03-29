import { TitleBar } from '@/renderer/components/title-bar';
import { mongoViewer } from '@/renderer/renderer-api';
import { TooltipProvider } from "@/renderer/components/ui/tooltip"
import { useFocusRestore } from './hooks/use-focus-restore';
import { Navigate, Route, Routes } from 'react-router';
import { Home } from './pages/home';
import { Connections } from './pages/connections';


const { platform } = mongoViewer;

export default function App() {
  useFocusRestore();
  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TitleBar platform={platform} />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connections/:connectionId" element={<Connections />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </TooltipProvider>
  );
}
