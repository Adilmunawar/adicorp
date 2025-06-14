
import Dashboard from "@/components/layout/Dashboard";
import AdvancedEventManager from "@/components/events/AdvancedEventManager";

const EventsPage = () => {
  return (
    <Dashboard title="Events & Calendar Management">
      <div className="space-y-6">
        <AdvancedEventManager />
      </div>
    </Dashboard>
  );
};

export default EventsPage;
