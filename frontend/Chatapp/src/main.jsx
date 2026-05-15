import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import DownloadPage from './components/download.jsx';
import Login from './components/login.jsx';
import Register from './components/register.jsx';
import ChatApp from './Application/ChatApp.jsx';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
    }
])
boot.render(
  <React.StrictMode>
    <RouterProvider router={routing}/>
  </React.StrictMode>
);

