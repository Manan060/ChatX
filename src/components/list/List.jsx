import React from 'react'
import ChatList from './chatList/ChatList'
import './List.css'
import Userinfo from './userinfo/Userinfo'

const List = () => {
  return (
    <div className='list'>
      <Userinfo/>
      <ChatList/>

    </div>
  )
}

export default List
