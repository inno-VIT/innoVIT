// <--------- Enhanced Version ----------->
import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Loading from './unicollab/components/Loading'

const Protected = ({ children, fallback = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const validateToken = async () => {
      try {
        setError(null)
        const response = await axios.get(
          'https://innovit-server.onrender.com/api/auth/validate-token',
          {
            withCredentials: true,
            timeout: 10000, // 10 second timeout
          },
        )

        if (response.data.valid) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setError('Session expired. Please log in again.')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        setIsAuthenticated(false)

        if (error.code === 'ECONNABORTED') {
          setError('Connection timeout. Please check your internet connection.')
        } else if (error.response?.status === 401) {
          setError('Session expired. Please log in again.')
        } else {
          setError('Authentication failed. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [])

  // Show loading state
  if (loading) {
    return <Loading message='Verifying authentication...' />
  }

  // Show custom fallback if provided
  if (fallback && !isAuthenticated) {
    return fallback
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location, error }} />
  }

  // Render protected content
  return children
}

export default Protected

// import { useNavigate } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const Protected = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const validateToken = async () => {
//       try {
//         const response = await axios.get("https://innovit-server.onrender.com/api/auth/validate-token", { withCredentials: true });
//         if (response.data.valid) {
//           setIsAuthenticated(true);
//         } else {
//           setIsAuthenticated(false);
//         }
//       } catch (error) {
//         setIsAuthenticated(false);
//         navigate("/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     validateToken();
//   }, [navigate]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return <div>You need to sign in to access this content.</div>;
//   }

//   return (
//     <div>
//       {/* Protected content goes here */}
//       <h1>Welcome to the protected content!</h1>
//     </div>
//   );
// };

// export default Protected;
