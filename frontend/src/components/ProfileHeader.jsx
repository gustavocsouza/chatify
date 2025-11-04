import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSoud } = useChatStore();
  const { selectedImg, setSelectedImg } = useState(null);

  const fileInputRef = useRef(null);

  function handleImageUpload(e) {}

  return (
    <div className="p-6 border-b border-slate-700/50 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar online">
            <button 
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img 
                src={selectedImg || authUser.profilePic || "/avatar.png"} 
                alt="User Image" 
                className="size-full object-cover"
              />
            </button>
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader