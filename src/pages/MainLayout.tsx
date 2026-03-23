import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/atoms/tabs";
import { Button } from "@/atoms/button";
import { Input } from "@/atoms/input";
import { Checkbox } from "@/atoms/checkbox";

export function MainLayout() {
  // Early return rule application
  const isReady = true;
  if (!isReady) return <div className="p-4">Loading...</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto h-screen p-6 flex flex-col gap-6 select-none">
      <header className="flex justify-between items-center pb-2 border-b border-border/50">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">toDone</h1>
        <Button size="sm" variant="ghost">Settings</Button>
      </header>
      
      <Tabs defaultValue="daily" className="w-full h-full flex flex-col items-center">
        <TabsList className="mb-6 w-fit">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="w-full flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {/* Example Task Card utilizing Surface depths */}
            <div className="bg-card p-4 rounded-xl flex items-center gap-3 border border-border">
              <Checkbox id="task-1" />
              <label htmlFor="task-1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Phase 2: UI 뼈대 및 컴포넌트 개발
              </label>
            </div>
            <div className="bg-card p-4 rounded-xl flex items-center gap-3 border border-border">
              <Checkbox id="task-2" />
              <label htmlFor="task-2" className="text-sm font-medium leading-none text-muted-foreground line-through">
                Phase 1: 초기 세팅 및 DevOps
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Input placeholder="Add a new task..." className="flex-1 bg-input !border-none" />
            <Button>Add</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="w-full flex-1">
          <p className="text-muted-foreground text-center mt-10">Weekly View Content</p>
        </TabsContent>
        <TabsContent value="monthly" className="w-full flex-1">
          <p className="text-muted-foreground text-center mt-10">Monthly View Content</p>
        </TabsContent>
        <TabsContent value="all" className="w-full flex-1">
          <p className="text-muted-foreground text-center mt-10">All Tasks Content</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
