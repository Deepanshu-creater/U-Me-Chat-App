import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import DownloadPage from './components/download.jsx';
import Login from './components/login.jsx';
import Register from './components/register.jsx';
import ChatApp from './Application/ChatApp.jsx';
<<<<<<< HEAD
import { createBrowserRouter, RouterProvider } from "react-router-dom";
=======
import FeedbackForm from './components/feedback.jsx';
import { StartProjectForm } from './components/spfform.jsx';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SuggestFeatureForm } from './components/safform.jsx';
import ResetPassword from './components/resetpassword.jsx';
>>>>>>> f71df190e18281f2f16661fb65e5d89f76e6c66b
const boot = ReactDOM.createRoot(document.getElementById('root'));
let routing= createBrowserRouter([
    {
      path: '/',
      element: <App/>,
    },
    {
      path: '/download',
      element: <DownloadPage/>,
    },
    {
      path: '/login',
      element: <Login/>,
    },
    {
      path: '/register',
      element: <Register/>,
    },
    {
      path: '/chat',
      element: <ChatApp/>
<<<<<<< HEAD
=======
    },
    {
      path:"/feedback",
      element: <FeedbackForm/>
    },
    {
      path: '/start-project',
      element: <StartProjectForm/>
    },
    {
      path: '/suggest-feature',
      element: <SuggestFeatureForm/>
    },
    {
      path: '/reset-password',
      element: <ResetPassword/>
>>>>>>> f71df190e18281f2f16661fb65e5d89f76e6c66b
    }
])
boot.render(
  <React.StrictMode>
    <RouterProvider router={routing}/>
  </React.StrictMode>
);

