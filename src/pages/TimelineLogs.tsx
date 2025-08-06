
import Dashboard from "@/components/layout/Dashboard";
import TimelineLogsList from "@/components/timeline/TimelineLogsList";

const TimelineLogsPage = () => {
  return (
    <Dashboard title="Timeline Logs">
      <div className="space-y-6">
        <div className="glass-card p-6">
          <TimelineLogsList />
        </div>
      </div>
    </Dashboard>
  );
};

export default TimelineLogsPage;
