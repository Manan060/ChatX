import React, { useEffect, useState } from 'react';
import { db } from '../../../util/firebase';
import { useUserStore } from '../../../util/userStore';
import { useChatStore } from '../../../util/chatStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import AddUser from './adduser/AddUser';
import './chatlist.css';
import { FaSearch } from 'react-icons/fa';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addmode, setAddMode] = useState(false);

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'userchats', currentUser.id), async (res) => {
      const items = res.data().chats;

      const promises = items.map(async (item) => {
        const userDocSnap = await getDoc(doc(db, 'users', item.receiverId));
        const user = userDocSnap.data();

  
        const chatDocSnap = await getDoc(doc(db, 'chats', item.chatId));
        const chatData = chatDocSnap.data();
        const lastMessage = chatData?.messages?.[chatData.messages.length - 1] || {};

        return {
          ...item,
          user,
          lastMessage,
        };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map(({ user, ...rest }) => rest);
    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

    if (chatIndex !== -1) userChats[chatIndex].isSeen = true;

    try {
      await updateDoc(doc(db, 'userchats', currentUser.id), {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.error('Error updating isSeen:', error);
    }
  };


  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No timestamp available'; 

  
    const date = new Date(timestamp);

 
    if (isToday(date)) {
      return formatDistanceToNow(date) + " ago"; 
    }


    if (isYesterday(date)) {
      return "Yesterday"; 
    }


    return format(date, 'PPPp');
  };

  return (
    <div className='chatlist'>
      <div className='search'>
        <div className='searchBar'>
          <FaSearch className='icons-class' />
          <input type='text' placeholder='Search' />
        </div>
        <img
          src={addmode ? './minus.png' : './plus.png'}
          className='add'
          alt=''
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {chats.map((chat) => {
        
        const senderName = chat.lastMessage?.senderId === currentUser.id
          ? "Me"
          : chat.user.username;

     
        const messageContent = chat.lastMessage?.img
          ? " Photo📷"
          : chat.lastMessage?.text || 'No messages yet';

        return (
          <div
            className='item'
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{ backgroundColor: chat?.isSeen ? 'transparent' : '#5183fe' }}
          >
            <img
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? './avatar.png'
                  : chat.user.profilePic
              }
              alt=''
            />
            <div className='texts'>
              <span>
                {chat.user.blocked.includes(currentUser.id)
                  ? 'User'
                  : chat.user.username}
              </span>
              <p>
                {`${senderName}: ${messageContent}`} 
              </p>
              {chat.createdAt && (
                <span className="timestamp">
                  {formatTimestamp(chat.createdAt)} 
                </span>
              )}
            </div>
          </div>
        );
      })}

      {addmode && <AddUser />}
    </div>
  );
};

export default ChatList;

