import React, { useEffect } from 'react'
import {Routes,Route, Navigate} from "react-router-dom";
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

import ProfilePage from './pages/ProfilePage';
import SettingPage from './pages/SettingPage';
import SignUpPage from './pages/SignUpPage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from "lucide-react";
import {Toaster} from "react-hot-toast";
import Navbar from './components/Navbar';

function App() {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers}=useAuthStore();
  console.log({onlineUsers});
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  console.log("authUser",authUser);

  if(isCheckingAuth && !authUser)
    return(
   <div className='flex justify-center items-center h-screen'>
    <Loader className="size-10 animate-spin"/>
   </div>
    );
  return (
    <>
   <Navbar/>

  <Routes>

    <Route path="/" element={authUser ?<HomePage/>:<Navigate to="/login"/>}/>
    <Route path="/signup" element={!authUser ?<SignUpPage/>:<Navigate to="/"/>}/>
    <Route path="/login" element={!authUser ?<LoginPage/>:<Navigate to="/"/>}/>
    <Route path="/settings" element={<SettingPage/>}/>
    <Route path="/profile" element={authUser ?<ProfilePage/>:<Navigate to="/login"/>}/>

  </Routes>
  <Toaster/>

    </>
  )
}

export default App