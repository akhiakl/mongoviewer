import { TitleBar } from '@/renderer/components/title-bar';
import { mongoViewer } from '@/renderer/renderer-api';
import { TooltipProvider } from "@/renderer/components/ui/tooltip"
import { AppViewProvider, AppView } from './components/app-view';
import { useFocusRestore } from './hooks/use-focus-restore';


const { platform } = mongoViewer;

export default function App() {
  useFocusRestore();
  return (
    <AppViewProvider>
      <TooltipProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <TitleBar platform={platform} />
          <div className="flex min-h-0 flex-1 overflow-hidden p-2 md:p-3 border-t border-border ">
            <AppView />
          </div>
        </div>
      </TooltipProvider>
    </AppViewProvider>
  );
}