
import Dashboard from "@/components/layout/Dashboard";
import EventManager from "@/components/events/EventManager";
import WorkingDaysConfig from "@/components/settings/WorkingDaysConfig";

const EventsPage = () => {
  return (
    <Dashboard title="Events & Calendar">
      <div className="space-y-6">
        <EventManager />
        <WorkingDaysConfig />
      </div>
    </Dashboard>
  );
};

export default EventsPage;
