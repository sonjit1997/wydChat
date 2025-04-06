import { useAuthStore } from "../store/useAuthStore";
import GroupChat from "./GroupChat";
import UserChat from "./UserChat";
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
