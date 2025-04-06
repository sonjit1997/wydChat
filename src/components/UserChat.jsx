import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import useEditUserMessage from '../hooks/useEditUserMessage';
import useFormattedMessageDate from '../hooks/useFormattedMessageDate';
import useGroupedMessages from '../hooks/useGroupedMessages';
import { useAuthStore } from '../store/useAuthStore';
import { decryptMessage, encryptMessage } from '../utils/cryptoUtils';
import { getPrivateKey } from '../utils/indexedDBUtils';
import ChatMessages from './ChatMessages';
import InputBox from './InputBox';

const UserChat = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { formatMessageDate } = useFormattedMessageDate();
  const groupedMessages = useGroupedMessages(messages);
  const {
    selectedUserOrGroup,
    setIsUpdateLastConversation,
    logedInUser,
    isUpdateLastConversation,
  } = useAuthStore();
  const {
    editText,
    setEditText,
    editingMessageId,
    handleEditMessage,
    handleUpdateMessage,
  } = useEditUserMessage(selectedUserOrGroup, logedInUser);

  useEffect(() => {
    if (selectedUserOrGroup) {
      const q = query(
        collection(db, 'messages'),
        where('senderId', 'in', [logedInUser.uid, selectedUserOrGroup.uid]),
        where('recipientId', 'in', [logedInUser.uid, selectedUserOrGroup.uid]),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const decryptedMessages = [];
        const privateKey = await getPrivateKey(logedInUser.uid);
        if (!privateKey) {
          console.error("User's private key not found!");
          return;
        }

        for (const docSnap of querySnapshot.docs) {
          const msg = { id: docSnap.id, ...docSnap.data() };
          try {
            const encryptedText = msg.senderId === logedInUser.uid
              ? msg.encryptedTextForSender
              : msg.encryptedTextForRecipient;
            if (!encryptedText) throw new Error('Encrypted text not found!');
            msg.text = decryptMessage(encryptedText, privateKey);
          } catch (error) {
            console.error('Decryption error:', error);
            msg.text = '🔒 Encrypted Message (Decryption Failed)';
          }
          decryptedMessages.push(msg);
        }

        setMessages(decryptedMessages);

        const unseenMessages = decryptedMessages.filter(
          (msg) => msg.recipientId === logedInUser.uid && !msg.seen
        );
        if (unseenMessages.length > 0) {
          const batch = writeBatch(db);
          unseenMessages.forEach((msg) => {
            const msgRef = doc(db, 'messages', msg.id);
            batch.update(msgRef, { seen: true });
          });
          await batch.commit();
        }
      });

      return () => unsubscribe();
    }
  }, [logedInUser.uid, selectedUserOrGroup]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (text.trim() === '') return;

    try {
      const recipientPublicKey = await getUserPublicKey(selectedUserOrGroup.uid);
      const senderPublicKey = await getUserPublicKey(logedInUser.uid);
      if (!recipientPublicKey || !senderPublicKey) {
        console.error('Public key missing.');
        return;
      }

      const encryptedTextForRecipient = encryptMessage(text, recipientPublicKey);
      const encryptedTextForSender = encryptMessage(text, senderPublicKey);

      await addDoc(collection(db, 'messages'), {
        encryptedTextForRecipient,
        encryptedTextForSender,
        createdAt: serverTimestamp(),
        sender: logedInUser.displayName,
        senderId: logedInUser.uid,
        recipientId: selectedUserOrGroup.uid,
        seen: false,
        isEdited: false,
      });

      const conversationId = [logedInUser.uid, selectedUserOrGroup.uid].sort().join('_');
      await setDoc(
        doc(db, 'lastConversations', conversationId),
        {
          lastMessageAt: serverTimestamp(),
          lastMessage: text,
          participants: [logedInUser.uid, selectedUserOrGroup.uid],
        },
        { merge: true }
      );

      socket.emit('sendMessage', {
        sender: logedInUser.uid,
        receiver: selectedUserOrGroup.uid,
        senderName: logedInUser.displayName,
        message: encryptedTextForRecipient,
      });

      setText('');
      setIsUpdateLastConversation(!isUpdateLastConversation);
    } catch (error) {
      console.error('Error encrypting message:', error);
    }
  };

  const getUserPublicKey = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().publicKey : null;
  };

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on('typing', ({ sender }) => {
      if (sender !== logedInUser.uid) setIsTyping(true);
    });
    socket.on('stopTyping', () => setIsTyping(false));
    return () => {
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket, logedInUser.uid]);

  const handleTyping = () => {
    socket.emit('typing', {
      chatType: 'dm',
      sender: logedInUser.uid,
      receiver: selectedUserOrGroup.uid,
    });
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', {
        chatType: 'dm',
        receiver: selectedUserOrGroup.uid,
      });
    }, 1500);
  };

  if (!selectedUserOrGroup) return null;

  return (
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          {selectedUserOrGroup.username.charAt(0).toUpperCase()}
        </div>
        <h2 style={styles.username}>
          {selectedUserOrGroup.username.charAt(0).toUpperCase() +
            selectedUserOrGroup.username.slice(1)}
        </h2>
      </div>
      <ChatMessages
        messages={groupedMessages}
        isGroupChat={false}
        selectedUserOrGroup={selectedUserOrGroup}
        logedInUser={logedInUser}
        users={[]}
        isTyping={isTyping}
        typingText={`${selectedUserOrGroup.username} is typing...`}
        formatMessageDate={formatMessageDate}
        handleEditMessage={handleEditMessage}
        editingMessageId={editingMessageId}
        editText={editText}
        setEditText={setEditText}
        handleUpdateMessage={handleUpdateMessage}
      />
      <InputBox
        sendMessage={sendMessage}
        setText={setText}
        text={text}
        handleTyping={handleTyping}
      />
    </div>
  );
};

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    margin: '0 auto',
    backgroundColor: '#1F1F1F',
    color: '#fff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '11px',
    backgroundColor: '#141414',
    color: '#fff',
  },
  avatar: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    border: '1px solid #1F1F1F',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    marginRight: '10px',
    color: '#141414',
  },
  username: {
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default UserChat;