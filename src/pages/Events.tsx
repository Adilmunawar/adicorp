
import Dashboard from "@/components/layout/Dashboard";
import AdvancedEventManager from "@/components/events/AdvancedEventManager";
import RecurringEventManager from "@/components/events/RecurringEventManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Repeat, Globe } from "lucide-react";

const EventsPage = () => {
  return (
    <Dashboard title="Events & Calendar Management">
      <div className="space-y-6">
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-2 mb-4">
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Event Manager
            </TabsTrigger>
            <TabsTrigger 
              value="international" 
              className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
            >
              <Globe className="h-4 w-4 mr-2" />
              International Standards
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <AdvancedEventManager />
          </TabsContent>
          
          <TabsContent value="international">
            <RecurringEventManager />
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default EventsPage;
