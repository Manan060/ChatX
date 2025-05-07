import { async } from '@firebase/util'
import React from 'react'
import './adduser.css'
import { collection, query, where,getDoc, getDocs, setDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../../../../util/firebase';
import { useState } from 'react';
import { useUserStore } from '../../../../util/userStore';
import { FaUserCircle } from "react-icons/fa";


const AddUser = () => {

  const[user,setUser] = useState(null)

  const{currentUser} = useUserStore()

  const handleAdd = async ()=>{

    const chatRef = collection(db, "chats");
    const usersChatRef = collection(db, "userchats");

    try {
      
      const newChatRef = doc(chatRef)

      await setDoc(newChatRef,{
      createdAt: serverTimestamp(),
      messages: [],
    })

    await updateDoc(doc(usersChatRef,user.id),{

      chats : arrayUnion({
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: Date.now(),
      })



    })

    await updateDoc(doc(usersChatRef,currentUser.id),{

      chats : arrayUnion({
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      })



    })


  } catch (error) {
    console.log(error)
  }

  }

  const handleSearch = async (e) =>{

    e.preventDefault() 
    const formData = new FormData(e.target)
    const username = formData.get("username")

    try {
      
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", username));

        const querySnapShot = await getDocs(q)

        if(!querySnapShot.empty){
          setUser(querySnapShot.docs[0].data())
        }


    } catch (error) {
      console.log(error)
    }

  }



  return (
    <div className='adduser'>

        <form className='adduser-modal' onSubmit={handleSearch}>
            <input type="text" placeholder='Username' name='username' />
            <button>Search</button>
        </form>

       {user && <div className="s-user">
                <div className="user-detail">
                {  <img src={user.profilePic } alt="" /> ||  <FaUserCircle className='icons-class' />}
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add</button>
        </div>
        } 
    </div>
  )
}

export default AddUser
