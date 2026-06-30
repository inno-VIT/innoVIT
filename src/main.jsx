import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext.jsx'
import { SocketProvider } from './utils/SocketContext.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import './axiosConfig.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
          <ToastContainer
            position='bottom-right'
            autoClose={500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            theme='dark'
            draggable
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)

// import React from 'react'
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import { AuthProvider } from './utils/AuthContext.jsx'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import App from './App.jsx'
// import "./axiosConfig.js";

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <AuthProvider>
//       <BrowserRouter>
//         <App />
//         <ToastContainer
//           position='bottom-right'
//           autoClose={500}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           theme='dark'
//           draggable
//         />
//       </BrowserRouter>
//     </AuthProvider>
//   </StrictMode>,
// )
