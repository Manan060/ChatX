import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserStore } from "./userStore";



export const useChatStore = create((set) =>({
    chatId :null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: async (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;
      
        if (!currentUser || !user) return;
      
        try {
          const currentUserDoc = await getDoc(doc(db, "users", currentUser.id));
          const otherUserDoc = await getDoc(doc(db, "users", user.id));
      
          const currentUserData = currentUserDoc.data();
          const otherUserData = otherUserDoc.data();
      
          const isCurrentUserBlocked = otherUserData.blocked?.includes(currentUser.id);
          const isReceiverBlocked = currentUserData.blocked?.includes(user.id);
      
          set({
            chatId,
            user: isCurrentUserBlocked ? null : user, 
            isCurrentUserBlocked,
            isReceiverBlocked,
          });
      
        } catch (error) {
          console.log("Failed to fetch block status:", error);
        }
      },
      
    
    
    changeBlock :()=>{
        set((state) => ({...state, isReceiverBlocked : !state.isReceiverBlocked}))
    },

   

}))