import { useChatStore } from '../store/useChatStore'
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ChatsList from '../components/ChatsList';
import ContactsList from '../components/ContactsList';
import ChatContainer from '../components/ChatContainer';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import RequestsList from '../components/RequestsList';


function ChatPage() {
  const { activeTab, selectedUser, chatFullScreen } = useChatStore();

  const tabs = {
    "chats": <ChatsList />,
    "contacts": <ContactsList />,
    "requests": <RequestsList />,
  }

  return (
    <div className='relative w-full max-w-6xl h-[800px]'>
      <BorderAnimatedContainer>
        {/* Left Side */}
        <div className={`sm:w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col ${chatFullScreen ? "hidden" : ""}`}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className='flex-1 overflow-y-auto sm:p-4 p-2 space-x-2 space-y-0 sm:space-y-4 flex sm:flex-col'>
            {tabs[activeTab]}
          </div>
        </div>

        {/* Right Side */}
        <div className='flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm h-[50vh]'>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  )
}

export default ChatPage