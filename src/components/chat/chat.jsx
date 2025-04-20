import { useAuthStore } from "@/store/useAuthStore";
import GroupChat from "./groupChat/groupChat";
import UserChat from "./directChat/directChat";
const Chat = ({socket}) => {
  const {selectedUserOrGroup } = useAuthStore();

  return (
    <>
      {selectedUserOrGroup.type === "group" ? (
        <>
          <GroupChat socket={socket} />
        </>
      ) : (
        <UserChat socket={socket} />
      )}
    </>
  );
};

export default Chat;
