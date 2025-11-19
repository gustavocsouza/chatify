import { MailQuestion } from "lucide-react";

function NoRequestsFound() {
  return (
    <div className="flex sm:flex-col items-center justify-center sm:py-10 text-center sm:space-y-4">
      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center">
        <MailQuestion className="w-8 h-8 text-cyan-400" />
      </div>
      <div className="text-left sm:text-center pl-2">
        <h4 className="text-slate-200 font-medium mb-1">No requests yet</h4>
        <p className="text-slate-400 text-sm sm:px-6">
          You don't have any requests at the moment.
        </p>
      </div>
     
    </div>
  );
}
export default NoRequestsFound;