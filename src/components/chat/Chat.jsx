import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../util/firebase';
import { useChatStore } from '../../util/chatStore';
import { useUserStore } from '../../util/userStore';
import { uploadToCloudinary } from '../../util/cloudinaryUpload';
import { FaRegImage } from "react-icons/fa";
import { MdEmojiEmotions } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

const Chat = ({ setShowDetail }) => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null); 
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [isLoading, setIsLoading] = useState(false);

  const { chatId, user, isReceiverBlocked, isCurrentUserBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  // Ensure chat is loaded before rendering
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      console.log(res.data());  // Add this line to debug
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleEmoji = useCallback((e) => {
    setText(prev => prev + e.emoji);
    setOpen(false);
  }, []);

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = useCallback(async () => {
    if (text === "" && !img.file) return;

    setIsLoading(true);
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await uploadToCloudinary(img.file);
      }


      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });


      const userIds = [currentUser.id, user.id];
      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "📷 Photo";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImg({ file: null, url: "" });
    setText("");
    setIsLoading(false);
  }, [chatId, currentUser.id, text, user.id, img]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();

    if (isToday(date)) {
      return formatDistanceToNow(date) + " ago";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, 'PPPp');
  };

  const renderedMessages = useMemo(() => {
    return chat?.messages?.map((message, idx) => (
      <div
        className={message.senderId === currentUser?.id ? "message-own" : "message"}
        key={idx}
      >
        <div className={message.senderId === currentUser?.id ? "text-own" : "text"}>
          {message.img && (
            <img
              src={message.img}  // Image URL stored in Firebase
              alt="attachment"
              className={message.senderId === currentUser?.id ? "attachments" : "sender-attachments"}
            />
          )}
          {message.text && <p>{message.text}</p>}
          <span>{formatTimestamp(message.createdAt)}</span>
        </div>
      </div>
    ));
  }, [chat?.messages, currentUser?.id]);

  if (!chat) {
    return <div>Loading...</div>;  
  }

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img
            src={(isCurrentUserBlocked || isReceiverBlocked) ? "./avatar.png" : user?.profilePic || "./avatar.png"}
            alt=""
          />
          <div className="texts">
            <span>
              {(isCurrentUserBlocked || isReceiverBlocked) ? "User" : user?.username}
            </span>
            <p>{(isCurrentUserBlocked || isReceiverBlocked) ? "---" : (user?.bio || "bio not present")}</p>
          </div>
        </div>
        <div className="icons" onClick={() => setShowDetail(prev => !prev)}>
          <FaCircleInfo className='icons-class' title='Info'/>
        </div>
      </div>

      <div className="center">
        {renderedMessages}
        {img.url && (
          <div className="message-own" key={img.url}>
            <div className="text-own">
              <img src={img.url} alt="attachment" className='attachments' />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <FaRegImage className='icons-class' />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a Message" : 'Type a Message...'}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <MdEmojiEmotions onClick={() => setOpen(prev => !prev)} className='icons-class' />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className='sendButton'
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chat;
