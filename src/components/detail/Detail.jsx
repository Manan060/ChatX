import React, { useEffect, useState } from 'react';
import './Detail.css';
import { db } from '../../util/firebase';
import { useChatStore } from '../../util/chatStore';
import { useUserStore } from '../../util/userStore';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';


const Detail = () => {


  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user.id)
          : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className='detail'>
      <div className='user-info'>
        <img
          src={
            isCurrentUserBlocked || isReceiverBlocked
              ? './avatar.png'
              : user?.profilePic || './avatar.png'
          }
          alt='User Avatar'
        />
        <h2>{isCurrentUserBlocked || isReceiverBlocked ? 'User' : user?.username}</h2>
        <p>{isCurrentUserBlocked || isReceiverBlocked ? '---' : user?.bio || 'bio not present'}</p>
      </div>

      <div className='info'>

        <button className='blockbtn' onClick={handleBlock}>
          {isCurrentUserBlocked
            ? 'You are Blocked'
            : isReceiverBlocked
            ? 'User Blocked'
            : 'Block User'}
        </button>
      </div>
    </div>
  );
};

export default Detail;
