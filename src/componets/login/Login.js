// src/componets/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary
import LoginImg from "../../assets/images/hero-area.jpg";
import { Button } from 'react-bootstrap';

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get the login function from AuthContext
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_or_phone: emailOrPhone,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // On successful login, call the login function from AuthContext
        // This will save the tokens and update the authentication state globally
        login(data);

        // --- ROLE-BASED REDIRECTION LOGIC ---
        let redirectTo;
        if (data.role === 'admin') {
          redirectTo = "/DashBoard"; // Admin dashboard
        } else {
          // Default to user dashboard for 'user' role or any other role
          redirectTo = "/UserDashBoard";
        }

        // Redirect the user to their role-specific dashboard
        navigate(redirectTo, { replace: true });
      } else {
        // If the server returns an error, display the error message
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-box">
      <div className="dashboard-body container">
        <div className="ay-box-container">
          <div className="br-registration-heading">
            <form onSubmit={handleSubmit}>
              <div className="mt-3 row">
                <div className="d-flex justify-content-center align-items-center login-img col-lg-6 col-md-6 col-sm-12">
                  <img src={LoginImg} className="img-fluid" />
                </div>
                <div className="p-4 col-lg-6 col-md-6 col-sm-12">
                  <div className='Login-page'>
                    <h1 className="pb-4">Login</h1>
                  </div>
                  
                  {/* Display error message if it exists */}
                  {error && <div className="alert alert-danger" role="alert">{error}</div>}
                  
                  <div className="mb-3">
                    <label className="br-label form-label">Email or Mobile Number <span className="br-span-star">*</span></label>
                    <input 
                      placeholder="Email or Phone" 
                      className="mb-3 form-control" 
                      name="email_or_phone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                 <div className="mb-3">
  <label className="br-label form-label">Password <span className="br-span-star">*</span></label>
  <div className="password-wrapper" style={{ position: 'relative' }}>
    <input 
      placeholder="Password" 
      className="form-control" 
      type={showPassword ? "text" : "password"} 
      name="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      disabled={isLoading}
      style={{ paddingRight: '40px' }}
    />
    <span 
      className="ShowPassword-wrapper" 
      onClick={togglePasswordVisibility}
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        height: '100%'
      }}
    >
      <svg 
        stroke="currentColor" 
        fill="currentColor" 
        stroke-width="0" 
        viewBox="0 0 576 512" 
        height="1.2em" 
        width="1.2em" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: '#6c757d' }}
      >
        <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
      </svg>
    </span>
  </div>
</div>
                  <div className="text-center mt-3">
                    <button type="submit" className="w-100 trilok-submit-btn btn btn-primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {' '}Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                    <div className='mt-3'>
                  <Link to="/ForgotPassword"> <Button className='w-100'>Forgot Password</Button> </Link> 
                  </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;