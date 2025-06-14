
import Dashboard from "@/components/layout/Dashboard";
import TimelineLogsList from "@/components/timeline/TimelineLogsList";

const TimelineLogsPage = () => {
  return (
    <Dashboard title="Timeline Logs">
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">System Activity Timeline</h2>
            <p className="text-white/70">
              Track all important changes and activities in your system with detailed timestamps
            </p>
          </div>
          <TimelineLogsList />
        </div>
      </div>
    </Dashboard>
  );
};

export default TimelineLogsPage;
