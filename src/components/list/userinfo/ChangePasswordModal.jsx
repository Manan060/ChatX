import React, { useState } from 'react';
import './changepasswordmodal.css';
import { auth } from '../../../util/firebase';
import { updatePassword } from 'firebase/auth';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      setSuccess("Password updated successfully.");
      setError('');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="changepassword-modal-overlay">
      <div className="changepassword-modal">
        <h2>Change Password</h2>

        <div className="changepassword-section">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="changepassword-error">{error}</p>}
        {success && <p className="changepassword-success">{success}</p>}

        <div className="changepassword-modal-buttons">
          <button className="changepassword-save-btn" onClick={handlePasswordChange}>Update</button>
          <button className="changepassword-cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
