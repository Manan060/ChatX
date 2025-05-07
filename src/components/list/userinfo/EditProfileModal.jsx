import React, { useState, useEffect } from 'react';
import './editProfileModal.css';
import { FaUser, FaSpinner } from 'react-icons/fa';
import { doc, updateDoc } from 'firebase/firestore';


import { toast } from 'react-toastify';
import { db } from '../../../util/firebase';
import { uploadToCloudinary } from '../../../util/cloudinaryUpload';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [bio, setBio] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setBio(currentUser.bio || '');
      setPreview(currentUser.profilePic || null);
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (bio.trim().split(/\s+/).length > 12) {
      toast.error("Bio must be a maximum of 12 words");
      return;
    }

    setLoading(true);
    try {
      let imgUrl = currentUser.profilePic;

      if (newProfilePic) {
        imgUrl = await uploadToCloudinary(newProfilePic);
      }

      await updateDoc(doc(db, 'users', currentUser.id), {
        bio: bio.trim(),
        profilePic: imgUrl,
      });

      toast.success("Profile updated successfully!");
      onUpdate({ ...currentUser, bio: bio.trim(), profilePic: imgUrl });
      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Update failed. Try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>Edit Profile</h2>
        <div className="edit-profile-pic-section">
          <label htmlFor="profilePic">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <div className="profile-preview-wrapper">
            {preview ? (
              <img src={preview} alt="Preview" className="profile-pic-preview" />
            ) : (
              <div className="default-avatar">
                <FaUser className="default-avatar-icon" />
              </div>
            )}
          </div>
        </div>

        <div className="edit-bio-section">
          <label htmlFor="bio">Bio (max 12 words)</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Update your bio..."
          />
        </div>

        <div className="modal-buttons">
          <button className="save-btn" onClick={handleUpdate} disabled={loading}>
            {loading ? <FaSpinner className="spinner-icon-1" /> : 'Save'}
          </button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
