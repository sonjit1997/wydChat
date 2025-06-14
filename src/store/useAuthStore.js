import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      logedInUser: null,
      selectedUserOrGroup: null,
      allUser: null,
      isGroupChanged: false, // ✅ New state
      isUpdateLastConversation: false, // ✅ New state

      // ✅ Setters
      setAllUser: (allUser) => set({ allUser }),
      setLogedInUser: (logedInUser) => set({ logedInUser }),
      setSelectedUserOrGroup: (selectedUserOrGroup) =>
        set({ selectedUserOrGroup }),
      setIsGroupChanged: (status) => set({ isGroupChanged: status }), // ✅ New setter
      setIsUpdateLastConversation: (status) =>
        set({ isUpdateLastConversation: status }), // ✅ New setter

      logout: () => {
        set({
          logedInUser: null,
          selectedUserOrGroup: null,
          allUser: null,
          isGroupChanged: false,
        });
        // localStorage.removeItem("auth-store"); // Clear persisted data
      },
    })
    // {
    //   name: "auth-store", // Name for localStorage key
    //   partialize: (state) => ({
    //     logedInUser: state.logedInUser,
    //     selectedUserOrGroup: state.selectedUserOrGroup,
    //     allUser: state.allUser,
    //   }),
    // }
  )
);
