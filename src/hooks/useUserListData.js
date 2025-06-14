import { useNotifications } from "@/context/NotificationContext";
import { db } from "@/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export const useUserListData = () => {
  const [groups, setGroups] = useState([]);
  const [combinedList, setCombinedList] = useState([]);
  const { notifications } = useNotifications();
  const {
    logedInUser,
    allUser,
    setAllUser,
    isGroupChanged,
    isUpdateLastConversation,
  } = useAuthStore();

  const fetchUsers = useCallback(async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const userList = usersSnap.docs.map((doc) => ({
      type: "user",
      ...doc.data(),
    }));

    const currentUserData = userList.find(
      (user) => user.uid === logedInUser?.uid
    );
    if (currentUserData) {
      logedInUser.publicKey = currentUserData.publicKey;
    }

    const filteredUsers = userList.filter(
      (user) => user.uid !== logedInUser?.uid
    );
    setAllUser(filteredUsers);
  }, [logedInUser, setAllUser]);

  const fetchGroups = useCallback(async () => {
    if (!logedInUser?.uid) return;

    const q = query(
      collection(db, "groups"),
      where("memberIds", "array-contains", logedInUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const groupsData = querySnapshot.docs.map((doc) => ({
      type: "group",
      groupId: doc.id,
      ...doc.data(),
    }));

    setGroups(groupsData);
  }, [logedInUser?.uid]);

  const fetchLastConversations = useCallback(async () => {
    if (!logedInUser) return;

    const convoQuery = query(
      collection(db, "lastConversations"),
      where("participants", "array-contains", logedInUser.uid)
    );
    const convoSnap = await getDocs(convoQuery);
    const convoData = {};
    convoSnap.docs.forEach((doc) => {
      convoData[doc.id] = doc.data();
    });

    const usersWithTimestamps = allUser?.map((user) => {
      const conversationId = [logedInUser.uid, user.uid].sort().join("_");
      return {
        ...user,
        lastMessageAt: convoData[conversationId]?.lastMessageAt || null,
        lastMessage: convoData[conversationId]?.lastMessage || "",
      };
    });

    const groupsWithTimestamps = groups?.map((group) => ({
      ...group,
      lastMessageAt: convoData[group.groupId]?.lastMessageAt || null,
      lastMessage: convoData[group.groupId]?.lastMessage || "",
    }));

    const mergedList = [...usersWithTimestamps, ...groupsWithTimestamps];

    mergedList.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
    });

    setCombinedList(mergedList);
  }, [allUser, groups, logedInUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, isGroupChanged]);

  useEffect(() => {
    fetchLastConversations();
  }, [
    fetchLastConversations,
    allUser,
    groups,
    isUpdateLastConversation,
    notifications,
  ]);

  const refreshAll = async () => {
    await Promise.all([fetchUsers(), fetchGroups()]);
    await fetchLastConversations();
  };

  return {
    groups,
    combinedList,
    refreshAll,
  };
};
