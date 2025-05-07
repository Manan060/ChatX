import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FaUser, FaSpinner } from "react-icons/fa";
import './auth.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../util/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../../util/cloudinaryUpload';

function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);




  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    control: controlLogin,
    formState: { errors: loginErrors }
  } = useForm();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    setError: setSignupError,
    clearErrors: clearSignupErrors,
    watch: watchSignup,
    control: controlSignup,
    formState: { errors: signupErrors }
  } = useForm({
    defaultValues: {
      bio: "Hey there, I am using ChatX"
    }
  });

  const profilePicFile = watchSignup("profilePic");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      clearSignupErrors("profilePic");
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onLoginSubmit = async (data) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Login successful!");
      console.log("Login Data:", data);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed.");
    }
    setLoading(false);
  };

  const onSignupSubmit = async (data) => {
    setLoading(true);
    const { username, email, password, profilePic, bio } = data;

    if (!profilePic || profilePic.length === 0) {
      setSignupError("profilePic", { type: "manual", message: "Profile picture is required" });
      setLoading(false);
      return;
    }

  
    const wordCount = bio.trim().split(/\s+/).length;
    if (wordCount > 12) {
      setSignupError("bio", {
        type: "manual",
        message: "Bio must be a maximum of 12 words"
      });
      setLoading(false);
      return;
    }

    const file = profilePic[0];

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await uploadToCloudinary(file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        profilePic: imgUrl,
        blocked: [],
        bio,
      });

      await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });

      toast.success("Account Created! Please Login now!");
      console.log("Signup Data:", data);
      setIsSignup(false);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="l-container">
      <img src="./logo.svg" alt="logo" className="logo" />
      <p className="subtitle">"A Professional Networking Platform"</p>

      <div className="form-container">
        <div className={`toggle-container ${isSignup ? 'signup' : ''}`}>
          <button className="toggle-btn" onClick={() => setIsSignup(false)}>Login</button>
          <button className="toggle-btn" onClick={() => setIsSignup(true)}>Signup</button>
        </div>

        {/* Login Form */}
        <form className={`form ${!isSignup ? 'active' : ''}`} onSubmit={handleLoginSubmit(onLoginSubmit)}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...registerLogin("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email"
                }
              })}
            />
            {loginErrors.email && <p className="error">{loginErrors.email.message}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input">
              <Controller
                name="password"
                control={controlLogin}
                defaultValue=""
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                )}
              />
              <button type="button" className="toggle-password" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                {showLoginPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>
            {loginErrors.password && <p className="error">{loginErrors.password.message}</p>}
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <FaSpinner className="spinner-icon-1" /> : "Login"}
          </button>
          <p className="form-footer">
            Don't have an account? <a href="#" onClick={() => setIsSignup(true)}>Create Now</a>
          </p>
        </form>

        {/* Signup Form */}
        <form className={`form ${isSignup ? 'active' : ''}`} onSubmit={handleSignupSubmit(onSignupSubmit)}>
          <div className="input-group profile-pic-group">
            <label htmlFor="profilePic" className="profile-pic-label">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              id="profilePic"
              {...registerSignup("profilePic", {
                validate: fileList =>
                  fileList && fileList.length > 0 || "Profile picture is required"
              })}
              onChange={handleImageChange}
            />
            {signupErrors.profilePic && <p className="error">{signupErrors.profilePic.message}</p>}
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

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...registerSignup("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email"
                }
              })}
            />
            {signupErrors.email && <p className="error">{signupErrors.email.message}</p>}
          </div>

          <div className="input-group">
            <label>User Name</label>
            <input
              type="text"
              placeholder="John123"
              {...registerSignup("username", { required: "Username is required" })}
            />
            {signupErrors.username && <p className="error">{signupErrors.username.message}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input">
              <Controller
                name="password"
                control={controlSignup}
                defaultValue=""
                rules={{
                  required: "Password is required",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: "Password must contain 1 uppercase, 1 lowercase, 1 number, and be 8+ characters"
                  }
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                )}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              >
                {showSignupPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>
            {signupErrors.password && <p className="error">{signupErrors.password.message}</p>}
            <p className="password-hint">
              Password must be at least 8 characters with 1 Uppercase, 1 Lowercase and 1 number
            </p>
          </div>

          <div className="input-group">
            <label>Bio</label>
            <textarea
              rows={2}
              placeholder="Hey there, I am using ChatX"
              {...registerSignup("bio", {
                required: "Bio is required",
                validate: value => {
                  const wordCount = value.trim().split(/\s+/).length;
                  return wordCount <= 12 || "Bio must be a maximum of 12 words";
                }
              })}
            />
            {signupErrors.bio && <p className="error">{signupErrors.bio.message}</p>}
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              I agree to the <a href="#" className="form-link">Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <FaSpinner className="spinner-icon-1" /> : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
