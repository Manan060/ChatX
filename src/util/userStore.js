import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";


export const useUserStore = create((set) =>({
    currentUser:null,
    isLoading: true,

    fetchUserInfo: async(uid) => {
        if(!uid) return set({currentUser:null, isLoading:false})

        try {
                const docRef = doc(db, "users", uid)
                const docsnap = await getDoc(docRef)

                if(docsnap.exists()){

                    set({currentUser:docsnap.data(),isLoading:false})
                }

                else{
                    set({currentUser: null, isLoading:false})
                }
            
        } catch (error) {
            console.log(error);
            return set({currentUser:null, isLoading:false})
        }
    }

}))