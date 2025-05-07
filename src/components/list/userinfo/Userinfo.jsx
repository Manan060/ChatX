import React, { useState } from 'react';
import './userinfo.css';
import { useUserStore } from '../../../util/userStore.js';
import { MdLogout } from "react-icons/md";
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { auth, db } from '../../../util/firebase';
import EditProfileModal from './EditProfileModal';
import { IoIosMore } from "react-icons/io";
import ChangePasswordModal from './ChangePasswordModal'; 

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); 

  const handleUpdate = async (updatedData) => {
    try {
      const userDocRef = db.collection('users').doc(currentUser.uid);
      await userDocRef.update(updatedData);
    } catch (err) {
      console.error('Error updating user info:', err);
    }
  };

  return (
    <>
      <div className="branding">
        <img src="./logo.svg" alt="Logo" className="branding-logo" />
      </div>

      <div className='userinfo'>
        <div className="user">
          {currentUser.profilePic ? (
            <img src={currentUser.profilePic} alt="Avatar" />
          ) : (
            <FaUserCircle className='icons-class' />
          )}
          <h2>{currentUser.username}</h2>
        </div>

        <div className="icons">
          <MdLogout className='icons-class' onClick={() => auth.signOut()} title='Logout' />
          <FaEdit className='icons-class' onClick={() => setIsModalOpen(true)} title='Edit Profile' />
          <IoIosMore className='icons-class' onClick={() => setShowMoreOptions(!showMoreOptions)} title='More'/>

          {showMoreOptions && (
            <div className="more-options">
              <button onClick={() => { setShowChangePasswordModal(true); setShowMoreOptions(false); }}>
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onUpdate={handleUpdate}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </>
  );
};

export default Userinfo;
