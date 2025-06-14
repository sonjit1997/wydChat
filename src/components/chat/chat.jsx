import { useAuthStore } from "@/store/useAuthStore";
import UserChat from "./directChat/directChat";
import GroupChat from "./groupChat/groupChat";
const Chat = ({ socket }) => {
  const { selectedUserOrGroup } = useAuthStore();

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
