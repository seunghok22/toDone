import { useTaskStore } from "@/store/useTaskStore";
import { Button } from "@/atoms/button";
import { invoke } from "@tauri-apps/api/core";

export function SettingsModal() {
  const { isSettingsModalOpen, setSettingsModalOpen, allTabPeriod, setAllTabPeriod } = useTaskStore();

  const handleQuit = async () => {
    await invoke('quit_app');
  };

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col border border-border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold tracking-tight">Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setSettingsModalOpen(false)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">'All' Tab Period</label>
            <p className="text-xs text-muted-foreground mb-1">Select the time frame for tasks shown in the Kanban board. This also determines how far back overdue in-progress tasks will carry over into the Daily &amp; Weekly tabs.</p>
            <select
              value={allTabPeriod}
              onChange={(e) => setAllTabPeriod(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 font-medium"
            >
              <option value="all">All Time (Show Everything)</option>
              <option value="day">Daily (Based on Selected Date)</option>
              <option value="week">Weekly (Week of Selected Date)</option>
              <option value="month">Monthly (Month of Selected Date)</option>
              <option value="year">Yearly (Year of Selected Date)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">App</label>
            <p className="text-xs text-muted-foreground mb-1">Completely quit the toDone application and remove it from the menu bar.</p>
            <Button
              variant="ghost"
              onClick={handleQuit}
              className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/20 rounded-lg h-10 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Quit toDone
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-muted/10">
          <Button onClick={() => setSettingsModalOpen(false)} className="font-semibold px-6 hover:scale-105 transition-transform">Done</Button>
        </div>
      </div>
    </div>
  );
}
