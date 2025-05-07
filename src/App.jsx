import { useState, useEffect } from 'react';
import List from './components/list/List';
import Chat from './components/chat/Chat';
import Detail from './components/detail/Detail';
import Auth from './components/auth/Auth';
import './App.css';
import Notification from './components/notification/Notification';
import { useForm, FormProvider } from "react-hook-form";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './util/firebase';
import { useUserStore } from './util/userStore';
import { useChatStore } from './util/chatStore';
import { FaSpinner } from 'react-icons/fa';

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const methods = useForm();

  const [showDetail, setShowDetail] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [mobileView, setMobileView] = useState(false);
  const [step, setStep] = useState("list"); 


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (windowWidth <= 768) {
      setMobileView(true);
    } else {
      setMobileView(false);
    }
  }, [windowWidth]);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user ? user.uid : null);
    });

    return () => unSub();
  }, [fetchUserInfo]);

  useEffect(() => {
    setShowDetail(false);
    if (mobileView) setStep("chat"); 
  }, [chatId, mobileView]);

  if (isLoading)
    return (
      <div className="loading">
        Loading <FaSpinner className="spinner-icon" />
      </div>
    );

  return (
    <div className="app">
      {currentUser ? (
        <div className="container">
          {!mobileView && (
            <>
              <List />
              {chatId && <Chat setShowDetail={setShowDetail} />}
              {chatId && showDetail && <Detail />}
            </>
          )}

          {mobileView && (
            <>
              {step === "list" && (
                <List onSelect={() => setStep("chat")} />
              )}
              {step === "chat" && chatId && (
                <Chat
                  setShowDetail={() => setStep("detail")}
                  goBack={() => setStep("list")}
                />
              )}
              {step === "detail" && chatId && (
                <Detail goBack={() => setStep("chat")} />
              )}
            </>
          )}
        </div>
      ) : (
        <FormProvider {...methods}>
          <Auth />
          <Notification />
        </FormProvider>
      )}
    </div>
  );
}

export default App;
