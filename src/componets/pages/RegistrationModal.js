// src/components/RegistrationModal.js

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Alert, Dropdown, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/registration.css';

const RegistrationModal = ({ show, handleClose }) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    profile_image: null,
    profile_image_preview: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    address: '',
    introduction: '',
    talent_scope: [],
    portfolio_links: [''],
    agreeTerms: false
  });

  // Verification form state
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // UI state
  const [currentStep, setCurrentStep] = useState('registration'); // 'registration' or 'verification'
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // To store detailed API response for debugging
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // Talent scope options
  const talentOptions = [
    'Dancing',
    'Acting',
    'Singing',
    'Music',
    'Creative Writing',
    'Painting',
    'Photography'
  ];

  // Form validation for registration
  const validateForm = () => {
    const newErrors = {};

    // Profile image validation
    if (!formData.profile_image) {
      newErrors.profile_image = 'Profile image is required';
    }

    // First name validation - only letters and spaces
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name)) {
      newErrors.first_name = 'First name should only contain letters and spaces';
    }

    // Last name validation - only letters and spaces
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = 'Last name should only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Date of birth validation - no future dates
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to beginning of day for accurate comparison
      
      if (dob > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      } else {
        const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 13) {
          newErrors.date_of_birth = 'You must be at least 13 years old to register';
        }
      }
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Phone validation - exactly 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Talent scope validation
    if (formData.talent_scope.length === 0) {
      newErrors.talent_scope = 'Please select at least one talent scope';
    }

    // Portfolio links validation
    const validPortfolioLinks = formData.portfolio_links.filter(link => link.trim() !== '');
    if (validPortfolioLinks.length === 0) {
      newErrors.portfolio_links = 'Please add at least one portfolio link';
    } else {
      const linkErrors = [];
      validPortfolioLinks.forEach((link, index) => {
        if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(link)) {
          linkErrors[index] = 'Please enter a valid URL';
        }
      });
      if (linkErrors.length > 0) {
        newErrors.portfolio_links = linkErrors;
      }
    }

    // Introduction validation
    if (!formData.introduction.trim()) {
      newErrors.introduction = 'Please introduce yourself';
    } else if (formData.introduction.length < 50) {
      newErrors.introduction = 'Introduction must be at least 50 characters long';
    } else if (formData.introduction.length > 500) {
      newErrors.introduction = 'Introduction must be less than 500 characters';
    }

    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verification form validation
  const validateVerificationForm = () => {
    const newErrors = {};
    
    if (!verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (!/^[0-9]{6}$/.test(verificationCode)) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change for registration form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for different fields
    let processedValue = value;
    
    if (name === 'phone') {
      // Only allow digits for phone, max 10
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (name === 'first_name' || name === 'last_name') {
      // Only allow letters and spaces for names
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle verification code change
  const handleVerificationCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(value);
    
    // Clear error if it exists
    if (errors.verificationCode) {
      setErrors(prev => ({
        ...prev,
        verificationCode: ''
      }));
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profile_image: 'Please upload a valid image file (JPEG, JPG, PNG, or GIF)'
        }));
        return;
      }
      
      // Validate file size (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          profile_image: 'Image size should be less than 1MB'
        }));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profile_image: file,
          profile_image_preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Clear error if it exists
      if (errors.profile_image) {
        setErrors(prev => ({
          ...prev,
          profile_image: ''
        }));
      }
    }
  };

  // Remove profile image
  const removeProfileImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_image: null,
      profile_image_preview: ''
    }));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle talent scope selection
  const handleTalentScopeChange = (talent) => {
    setFormData(prev => {
      const newTalentScope = prev.talent_scope.includes(talent)
        ? prev.talent_scope.filter(t => t !== talent)
        : [...prev.talent_scope, talent];
      
      return { ...prev, talent_scope: newTalentScope };
    });

    // Clear error if it exists
    if (errors.talent_scope) {
      setErrors(prev => ({
        ...prev,
        talent_scope: ''
      }));
    }
  };

  // Handle portfolio links
  const handlePortfolioLinkChange = (index, value) => {
    const newPortfolioLinks = [...formData.portfolio_links];
    newPortfolioLinks[index] = value;
    setFormData(prev => ({ ...prev, portfolio_links: newPortfolioLinks }));

    // Clear error for this specific link if it exists
    if (errors.portfolio_links && Array.isArray(errors.portfolio_links) && errors.portfolio_links[index]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (Array.isArray(newErrors.portfolio_links)) {
          newErrors.portfolio_links = [...newErrors.portfolio_links];
          newErrors.portfolio_links[index] = '';
        }
        return newErrors;
      });
    } else if (errors.portfolio_links && typeof errors.portfolio_links === 'string') {
      // Clear the general portfolio_links error if it's a string
      setErrors(prev => ({
        ...prev,
        portfolio_links: ''
      }));
    }
  };

  const addPortfolioLink = () => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, '']
    }));
  };

  const removePortfolioLink = (index) => {
    if (formData.portfolio_links.length > 1) {
      const newPortfolioLinks = [...formData.portfolio_links];
      newPortfolioLinks.splice(index, 1);
      setFormData(prev => ({ ...prev, portfolio_links: newPortfolioLinks }));
    }
  };

  // Handle registration form submission
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError('');
      setApiResponse(null);
      
      try {
        // Create FormData for file upload
        const apiFormData = new FormData();
        
        // Add all form fields
        apiFormData.append('first_name', formData.first_name);
        apiFormData.append('last_name', formData.last_name);
        apiFormData.append('email', formData.email);
        apiFormData.append('password', formData.password);
        apiFormData.append('date_of_birth', formData.date_of_birth);
        apiFormData.append('country', formData.country);
        apiFormData.append('state', formData.state);
        apiFormData.append('city', formData.city);
        apiFormData.append('phone', JSON.stringify(formData.phone));
        apiFormData.append('address', formData.address);
        apiFormData.append('introduction', formData.introduction);
        
        // Add profile image
        if (formData.profile_image) {
          apiFormData.append('profile_image', formData.profile_image);
        }
        
        // Add talent scope as JSON string - this is the key fix
        apiFormData.append('talent_scope', JSON.stringify(formData.talent_scope));
        
        // Add portfolio links as JSON string - using the same approach for consistency
        const validPortfolioLinks = formData.portfolio_links.filter(link => link.trim() !== '');
        apiFormData.append('portfolio_link', JSON.stringify(validPortfolioLinks));

        // Log the form data for debugging
        console.log('Submitting registration data:');
        for (let [key, value] of apiFormData.entries()) {
          console.log(`${key}:`, value);
        }

        // API call
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/', {
          method: 'POST',
          body: apiFormData
          // Don't set Content-Type header when using FormData, browser sets it automatically with boundary
        });
        
        const data = await response.json();
        console.log('API Response:', data); // Log the response for debugging
        setApiResponse(data); // Store response for debugging
        
        if (response.ok) {
          // On success, move to verification step
          setRegisteredEmail(formData.email);
          setSubmitSuccess(true);
          setIsSubmitting(false);
          
          // Reset form after successful submission
          setTimeout(() => {
            setFormData({
              profile_image: null,
              profile_image_preview: '',
              first_name: '',
              last_name: '',
              email: '',
              password: '',
              confirmPassword: '',
              date_of_birth: '',
              country: '',
              state: '',
              city: '',
              phone: '',
              address: '',
              introduction: '',
              talent_scope: [],
              portfolio_links: [''],
              agreeTerms: false
            });
            
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            
            setSubmitSuccess(false);
            setCurrentStep('verification');
          }, 2000);
        } else {
          // Handle API errors with more detail
          let errorMessage = 'Registration failed. Please try again later.';
          
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.errors) {
            // If there are field-specific errors, extract them
            const errorMessages = Object.values(data.errors).flat();
            errorMessage = errorMessages.join(', ');
          } else if (data.detail) {
            errorMessage = data.detail;
          }
          
          setApiError(errorMessage);
          setIsSubmitting(false);
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        setApiError(`Network error: ${error.message}. Please check your connection and try again.`);
        setIsSubmitting(false);
      }
    }
  };

  // Handle verification form submission
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (validateVerificationForm()) {
      setIsSubmitting(true);
      setApiError('');
      
      try {
        // API call for verification
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/verify-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registeredEmail,
            code: verificationCode
          })
        });
        
        const data = await response.json();
        console.log('Verification API Response:', data); // Log the response for debugging
        
        if (response.ok) {
          // On success
          setVerificationSuccess(true);
          setIsSubmitting(false);
          
          // Navigate to login page after successful verification
          setTimeout(() => {
            handleClose();
            navigate('/login');
          }, 2000);
        } else {
          // Handle API errors
          let errorMessage = 'Verification failed. Please try again later.';
          
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.detail) {
            errorMessage = data.detail;
          }
          
          setApiError(errorMessage);
          setIsSubmitting(false);
        }
        
      } catch (error) {
        console.error('Verification error:', error);
        setApiError(`Network error: ${error.message}. Please check your connection and try again.`);
        setIsSubmitting(false);
      }
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    setIsSubmitting(true);
    setApiError('');
    setResendSuccess(false);
    
    try {
      // API call to resend code
      const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/resend-verification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail
        })
      });
      
      const data = await response.json();
      console.log('Resend Code API Response:', data); // Log the response for debugging
      
      if (response.ok) {
        // On success
        setResendSuccess(true);
        setIsSubmitting(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setResendSuccess(false);
        }, 3000);
      } else {
        // Handle API errors
        let errorMessage = 'Failed to resend code. Please try again later.';
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        
        setApiError(errorMessage);
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error('Resend code error:', error);
      setApiError(`Network error: ${error.message}. Please check your connection and try again.`);
      setIsSubmitting(false);
    }
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
      setErrors({});
      setApiError('');
      setSubmitSuccess(false);
      setVerificationSuccess(false);
      setCurrentStep('registration');
      setVerificationCode('');
      setRegisteredEmail('');
      setResendSuccess(false);
      setApiResponse(null);
    }
  }, [show]);

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split('T')[0];

  // Check if portfolio_links error is a string or array
  const getPortfolioLinkError = (index) => {
    if (errors.portfolio_links) {
      if (Array.isArray(errors.portfolio_links)) {
        return errors.portfolio_links[index];
      }
      return errors.portfolio_links;
    }
    return '';
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {currentStep === 'registration' ? 'User Registration' : 'Email Verification'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentStep === 'registration' ? (
          // Registration Form
          submitSuccess ? (
            <Alert variant="success">
              Registration successful! Please check your email for verification code.
            </Alert>
          ) : (
            <Form onSubmit={handleRegistrationSubmit}>
              {apiError && <Alert variant="danger">{apiError}</Alert>}
              
              {/* Debug information - remove in production */}
              {process.env.NODE_ENV === 'development' && apiResponse && (
                <Alert variant="info">
                  <strong>Debug Info:</strong>
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </Alert>
              )}
              
              {/* Profile Image Upload */}
              <Form.Group className="mb-4 profile-image-upload">
                <div className="d-flex flex-column align-items-center">
                  <div className="profile-image-container mb-3">
                    {formData.profile_image_preview ? (
                      <div className="position-relative">
                        <Image 
                          src={formData.profile_image_preview} 
                          alt="Profile Preview" 
                          className="profile-image-preview rounded-circle"
                          width={150}
                          height={150}
                        />
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="position-absolute top-0 end-0 m-1"
                          onClick={removeProfileImage}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="profile-image-placeholder rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-circle" style={{ fontSize: '5rem' }}></i>
                      </div>
                    )}
                  </div>
                  
                  <Form.Label className="form-label">Profile Image *</Form.Label>
                  <Form.Control
                    type="file"
                    ref={fileInputRef}
                    name="profile_image"
                    onChange={handleProfileImageChange}
                    isInvalid={!!errors.profile_image}
                    accept="image/*"
                    className="profile-image-input"
                  />
                  <Form.Text className="text-muted">
                    Upload a profile picture (JPEG, JPG, PNG, or GIF, max 1MB)
                  </Form.Text>
                  <Form.Control.Feedback type="invalid" className="val-error">
                    {errors.profile_image}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      isInvalid={!!errors.first_name}
                      placeholder="Enter your first name"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.first_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      isInvalid={!!errors.last_name}
                      placeholder="Enter your last name"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.last_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="Enter your email"
                />
                <Form.Control.Feedback type="invalid" className='val-error'>
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Enter your password"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      placeholder="Confirm your password"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Talent Scope *</Form.Label>
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle variant="outline-secondary" id="talent-scope-dropdown">
                    Select Your Talents
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {talentOptions.map((talent, index) => (
                      <Dropdown.Item key={index} as="div">
                        <Form.Check
                          type="checkbox"
                          id={`talent-${index}`}
                          label={talent}
                          checked={formData.talent_scope.includes(talent)}
                          onChange={() => handleTalentScopeChange(talent)}
                        />
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                {formData.talent_scope.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">Selected: {formData.talent_scope.join(', ')}</small>
                  </div>
                )}
                {errors.talent_scope && (
                  <div className="val-error mt-1 text-danger">
                    {errors.talent_scope}
                  </div>
                )}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      isInvalid={!!errors.date_of_birth}
                      max={today} // Prevent future dates
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.date_of_birth}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      isInvalid={!!errors.phone}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Portfolio Links *</Form.Label>
                {formData.portfolio_links.map((link, index) => (
                  <div key={index} className="d-flex mb-2">
                    <Form.Control
                      type="url"
                      value={link}
                      onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                      isInvalid={!!getPortfolioLinkError(index)}
                      placeholder="https://example.com/portfolio"
                    />
                    {formData.portfolio_links.length > 1 && (
                      <Button
                        variant="outline-danger"
                        className="ms-2"
                        onClick={() => removePortfolioLink(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addPortfolioLink}
                  className="mt-2"
                >
                  + Add Another Link
                </Button>
                {errors.portfolio_links && typeof errors.portfolio_links === 'string' && (
                  <div className="val-error mt-1 text-danger">
                    {errors.portfolio_links}
                  </div>
                )}
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country *</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      isInvalid={!!errors.country}
                      placeholder="Country"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.country}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State *</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      isInvalid={!!errors.state}
                      placeholder="State"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.state}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      isInvalid={!!errors.city}
                      placeholder="City"
                    />
                    <Form.Control.Feedback type="invalid" className='val-error'>
                      {errors.city}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address *</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  isInvalid={!!errors.address}
                  placeholder="Enter your full address"
                />
                <Form.Control.Feedback type="invalid" className='val-error'>
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Introduction *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleChange}
                  isInvalid={!!errors.introduction}
                  placeholder="Tell us about yourself, your experience, and what you hope to achieve..."
                />
                <div className="d-flex justify-content-between">
                  <Form.Control.Feedback type="invalid" className='val-error'>
                    {errors.introduction}
                  </Form.Control.Feedback>
                  <small className={`text-muted ${errors.introduction ? 'mt-4' : ''}`}>
                    {formData.introduction.length}/500 characters
                  </small>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="agree-terms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  isInvalid={!!errors.agreeTerms}
                  label={
                    <span>
                      I agree with the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-underline">
                        Terms and Conditions
                      </a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-underline">
                        Privacy Policy
                      </a>
                    </span>
                  }
                />
                <Form.Control.Feedback type="invalid" className='val-error'>
                  {errors.agreeTerms}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          )
        ) : (
          // Email Verification Form
          verificationSuccess ? (
            <Alert variant="success">
              Email verified successfully! Redirecting to login page...
            </Alert>
          ) : (
            <Form onSubmit={handleVerificationSubmit}>
              {apiError && <Alert variant="danger">{apiError}</Alert>}
              {resendSuccess && <Alert variant="success">Verification code sent successfully!</Alert>}
              
              <div className="text-center mb-4">
                <i className="bi bi-envelope-check" style={{ fontSize: '4rem', color: '#0d6efd' }}></i>
                <h4 className="mt-3">Verify Your Email</h4>
                <p className="text-muted">
                  We've sent a verification code to <strong>{registeredEmail}</strong>
                </p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Verification Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  isInvalid={!!errors.verificationCode}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center"
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                />
                <Form.Control.Feedback type="invalid" className='val-error'>
                  {errors.verificationCode}
                </Form.Control.Feedback>
              </Form.Group>
              
              <div className="text-center mb-4">
                <p className="text-muted">
                  Didn't receive the code?{' '}
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={handleResendCode}
                    disabled={isSubmitting}
                  >
                    Resend Code
                  </Button>
                </p>
              </div>
            </Form>
          )
        )}
      </Modal.Body>
      <Modal.Footer>
        {currentStep === 'registration' ? (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRegistrationSubmit} 
              disabled={isSubmitting || submitSuccess}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleVerificationSubmit} 
              disabled={isSubmitting || verificationSuccess}
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RegistrationModal;