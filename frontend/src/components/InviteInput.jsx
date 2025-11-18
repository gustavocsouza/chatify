import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

function InviteInput() {
  const [ emailToInvite, setEmailToInvite ] = useState("");
  const { invite } = useChatStore();

  function handleInviteClick() {
    invite(emailToInvite);
    setEmailToInvite("");
  }

  return (
    <div>
      <p className="text-sm mb-1">Add new contact</p>
      <div
        className="flex gap-2 mb-6"
      >
        <input 
          placeholder="Email"
          className="input-invite h-10"
          value={emailToInvite}
          type="email"
          onChange={(e) => setEmailToInvite(e.target.value)}
        />
        <button 
          className={`hover:scale-105 transition-all ${!emailToInvite ? "cursor-not-allowed" : "cursor-pointer"}`}
          disabled={!emailToInvite}
          onClick={handleInviteClick}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  )
}

export default InviteInput;