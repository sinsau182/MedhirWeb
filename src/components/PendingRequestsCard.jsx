import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

const PendingRequestsCard = () => {
  const {
    data: counts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/requests/counts"],
  });

  return (
    <Card className="bg-white rounded-xl border border-gray-100 shadow-md p-6 mb-6 relative overflow-hidden transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Pending Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total requests awaiting action:{" "}
            {isLoading ? "..." : counts?.total || 0}
          </p>
        </div>
        <div className="bg-[#FDF7E8] text-[#E6A339] font-bold py-3 px-5 rounded-lg flex flex-col items-center shadow-sm">
          <span className="text-2xl">
            {isLoading ? "..." : counts?.total || 0}
          </span>
          <span className="text-xs mt-1">Pending Approvals</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500 py-2">
          Loading request statistics...
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 py-2">
          Error loading request statistics. Please try again.
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 mt-4">
          <RequestBadge color="blue" count={counts?.leave || 0} label="Leave" />
          <RequestBadge
            color="amber"
            count={counts?.profile || 0}
            label="Profile"
          />
          <RequestBadge
            color="green"
            count={counts?.expense || 0}
            label="Expense"
          />
          <RequestBadge
            color="purple"
            count={counts?.advance || 0}
            label="Advance"
          />
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#4267B2] via-[#E6A339] to-[#22C55E]"></div>
    </Card>
  );
};

const RequestBadge = ({ color, count, label }) => (
  <div
    className={`flex items-center gap-2 bg-${color}-50 px-3 py-2 rounded-lg`}
  >
    <div className={`w-3 h-3 bg-${color}-700 rounded-full`}></div>
    <span className={`text-sm font-medium text-${color}-700`}>
      {label} ({count})
    </span>
  </div>
);

export default PendingRequestsCard;
