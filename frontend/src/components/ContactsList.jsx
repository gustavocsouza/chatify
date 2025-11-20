import { useEffect } from "react";
import { TrashIcon } from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ContactsList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div className="relative">
          <div
            key={contact._id}
            className={`
                bg-cyan-500/10 sm:p-4 py-2 pr-4 pl-2 rounded-lg cursor-pointer hover:bg-cyan-500/20 
                transition-colors flex items-center justify-between
              `}
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={contact.profilePic || "/avatar.png"} />
                </div>
              </div>
              <h4 className="text-slate-200 sm:font-medium text-sm sm:text-base">{contact.fullName}</h4>
            </div>
          </div>
        
        </div>
      ))}
    </>
  );
}
export default ContactsList;

