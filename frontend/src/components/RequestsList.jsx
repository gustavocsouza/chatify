import { useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoRequestsFound from "./NoRequestsFound";

function RequestsList() {
  const { requests, acceptRequest, isRequestsLoading, getAllRequests } = useChatStore();

  useEffect(() => {
    getAllRequests();
  }, [getAllRequests]);

  if (isRequestsLoading) return <UsersLoadingSkeleton />;

  if (requests.length === 0) return <NoRequestsFound />

  return (
    <>
      {requests.map((request) => (
        <div
          key={request._id}
          className={
            `bg-cyan-500/10 p-4 rounded-lg cursor-pointer 
            hover:bg-cyan-500/20 transition-colors flex items-center justify-between`
          }
          onClick={() => acceptRequest(request._id)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar`}>
              <div className="size-12 rounded-full">
                <img src={request.profilePic || "/avatar.png"} />
              </div>
            </div>
            <div className="flex flex-col">
              <h4 className="text-slate-200 font-medium">{request.fullName}</h4>
              <p className="text-slate-200 text-sm">{request.email}</p>
            </div>
          </div>
          <button>
            <CheckIcon />
          </button>
        </div>
      ))}
    </>
  );
}
export default RequestsList;