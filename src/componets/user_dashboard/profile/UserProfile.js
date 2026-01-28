import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Badge,
  Button,
  Spinner,
  Alert,
  Tab,
  Tabs,
  ListGroup,
  Form,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaLinkedin,
  FaExternalLinkAlt,
  FaAward,
  FaFileAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserHeader from "../UserHeader";
import UserLeftNav from "../UserLeftNav";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";

const UserProfile = () => {
  const navigate = useNavigate();
  const { auth, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for user data
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // State for document upload
  const [selectedDocumentType, setSelectedDocumentType] = useState("");

  // Check device width
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!auth?.access || !auth?.unique_id) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // URL encode the unique_id to handle forward slashes
      const encodedUserId = encodeURIComponent(auth.unique_id);
      
      // Make API request with authentication token
      const apiUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/?user_id=${encodedUserId}`;
      
      const response = await authFetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update user data state with response data
      if (result.success && result.data) {
        setUserData(result.data);
        // Initialize edit form data with user data
        setEditFormData(result.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      if (err.message.includes("401") || err.message.includes("403")) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate("/Login", { replace: true });
        }, 3000);
      } else if (err.message.includes("404")) {
        setError('User profile not found.');
      } else if (err.message.includes("Failed to fetch")) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchUserData();
    }
  }, [authLoading, isAuthenticated]);

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (!userData?.profile_image || imageError) {
      return null;
    }
    
    const profilePhoto = userData.profile_image;
    
    // If it's a full URL, return as is
    if (profilePhoto.startsWith('http')) {
      return profilePhoto;
    }
    
    // If it's a relative path, prepend the base URL
    return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${profilePhoto}`;
  };

  // Get document URL
  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    
    // If it's a full URL, return as is
    if (documentPath.startsWith('http')) {
      return documentPath;
    }
    
    // If it's a relative path, prepend the base URL
    return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${documentPath}`;
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditMode(true);
    setSuccessMessage("");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original user data
    setEditFormData(userData);
    setSelectedDocumentType("");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array field changes (talent_scope, social_media_link, additional_link)
  const handleArrayFieldChange = (fieldName, index, value) => {
    const updatedArray = [...editFormData[fieldName]];
    updatedArray[index] = value;
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: updatedArray
    }));
  };

  // Add new item to array field
  const addArrayItem = (fieldName) => {
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ""]
    }));
  };

  // Remove item from array field
  const removeArrayItem = (fieldName, index) => {
    const updatedArray = [...editFormData[fieldName]];
    updatedArray.splice(index, 1);
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: updatedArray
    }));
  };

  // Handle form submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    
    try {
      if (!auth?.access || !auth?.unique_id) {
        throw new Error("Authentication required");
      }
      
      // URL encode the unique_id to handle forward slashes
      const encodedUserId = encodeURIComponent(auth.unique_id);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(editFormData).forEach(key => {
        const isFileField = ['profile_image', 'portfolio_file', 'national_level_certificate', 
                          'internation_level_certificate_award', 'state_level_certificate', 
                          'district_level_certificate', 'college_level_certificate', 
                          'other_certificate'].includes(key);
        
        if (isFileField) {
          if (editFormData[key] instanceof File) {
            formDataToSend.append(key, editFormData[key]);
          }
        } else if (Array.isArray(editFormData[key])) {
          formDataToSend.append(key, JSON.stringify(editFormData[key]));
        } else if (editFormData[key] !== null && editFormData[key] !== undefined && editFormData[key] !== '') {
          formDataToSend.append(key, editFormData[key]);
        }
      });
      
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/?user_id=${encodedUserId}`,
        {
          method: "PUT",
          body: formDataToSend
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const updatedUserData = { ...userData };
        
        if (result.data) {
          Object.keys(result.data).forEach(key => {
            updatedUserData[key] = result.data[key];
          });
        }
        
        setUserData(updatedUserData);
        setEditFormData(updatedUserData);
        
        setSuccessMessage("Profile updated successfully!");
        setIsEditMode(false);
        
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.message.includes("401") || err.message.includes("403")) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate("/Login", { replace: true });
        }, 3000);
      } else if (err.message.includes("400")) {
        setError(`Bad request: ${err.message}`);
      } else if (err.message.includes("Failed to fetch")) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        profile_image: file
      }));
    }
  };

  // Handle document file change
  const handleDocumentChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        [documentType]: file
      }));
    }
  };

  // Handle document type selection
  const handleDocumentTypeSelect = (documentType) => {
    setSelectedDocumentType(documentType);
  };

  // Document types for dropdown
  const documentTypes = [
    { key: 'portfolio_file', label: 'Portfolio' },
    { key: 'national_level_certificate', label: 'National Level Certificate' },
    { key: 'internation_level_certificate_award', label: 'International Level Certificate' },
    { key: 'state_level_certificate', label: 'State Level Certificate' },
    { key: 'district_level_certificate', label: 'District Level Certificate' },
    { key: 'college_level_certificate', label: 'College Level Certificate' },
    { key: 'other_certificate', label: 'Other Certificate' }
  ];

  // Check if a document exists
  const documentExists = (documentType) => {
    return userData && userData[documentType];
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  // If not authenticated, show message and redirect
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <Alert variant="warning">
              You must be logged in to view this page.
            </Alert>
            <Button variant="primary" onClick={() => navigate('/Login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while loading user data
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <UserLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  // If there's an error, show message
  if (error) {
    return (
      <div className="dashboard-container">
        <UserLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body dashboard-main-container">
            <Alert variant="danger">
              {error}
            </Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content-dash">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body dashboard-main-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="page-title">User Profile</h1>
            {isEditMode ? (
              <div>
                <Button variant="success" className="me-2" onClick={handleSaveProfile} disabled={isSubmitting}>
                  {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : <FaSave className="me-1" />}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline-secondary" onClick={handleCancelEdit}>
                  <FaTimes className="me-1" /> Cancel
                </Button>
              </div>
            ) : (
              <Button variant="primary" onClick={handleEditClick}>
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            )}
          </div>

          {successMessage && (
            <Alert variant="success" className="mb-4">
              {successMessage}
            </Alert>
          )}

          <div className="row">
            {/* Profile Sidebar */}
            <Col lg={4} className="mb-4">
              <Card className="profile-sidebar">
                <Card.Body>
                  <div className="text-center">
                    {isEditMode ? (
                      <div>
                        <Image
                          src={getUserPhotoUrl() || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'User')}&background=0d6efd&color=fff&size=128`}
                          roundedCircle
                          className="profile-photo mb-3"
                          onError={handleImageError}
                        />
                        <Form.Group controlId="formProfileImage">
                          <Form.Label>Change Photo</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </Form.Group>
                      </div>
                    ) : (
                      <Image
                        src={getUserPhotoUrl() || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'User')}&background=0d6efd&color=fff&size=128`}
                        roundedCircle
                        className="profile-photo mb-3"
                        onError={handleImageError}
                      />
                    )}
                    <h3 className="profile-name">
                      {userData?.full_name || 'User'}
                    </h3>
                    <p className="profile-email">{userData?.email || 'email@example.com'}</p>
                    <p className="profile-phone">{userData?.mobile || 'Phone number'}</p>
                    <Badge bg="primary" className="profile-role">
                      {userData?.role || 'User'}
                    </Badge>
                  </div>

                  <div className="profile-stats mt-4">
                    <div className="d-flex justify-content-around">
                      <div className="stat-item text-center">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Events</div>
                      </div>
                      <div className="stat-item text-center">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Followers</div>
                      </div>
                      <div className="stat-item text-center">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Following</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Profile Content */}
            <Col lg={8} className="mb-4">
              <Card className="profile-content">
                <Card.Body>
                  <Tabs defaultActiveKey="personal" id="profile-tabs">
                    <Tab eventKey="personal" title="Personal Information">
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formFullName" className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={editFormData.full_name || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </Form.Group>

                        <Form.Group controlId="formEmail" className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={editFormData.email || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </Form.Group>

                        <Form.Group controlId="formPhone" className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={editFormData.phone || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </Form.Group>

                        <Form.Group controlId="formDateOfBirth" className="mb-3">
                          <Form.Label>Date of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            name="date_of_birth"
                            value={editFormData.date_of_birth || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </Form.Group>

                        <Form.Group controlId="formGender" className="mb-3">
                          <Form.Label>Gender</Form.Label>
                          <Form.Select
                            name="gender"
                            value={editFormData.gender || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="formUserType" className="mb-3">
                          <Form.Label>User Type</Form.Label>
                          <Form.Select
                            name="user_type"
                            value={editFormData.user_type || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          >
                            <option value="individual">Individual</option>
                            <option value="organization">Organization</option>
                          </Form.Select>
                        </Form.Group>

                        {editFormData.user_type === 'organization' && (
                          <Form.Group controlId="formTeamName" className="mb-3">
                            <Form.Label>Team/Organization Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="team_name"
                              value={editFormData.team_name || ''}
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        )}
                      </Form>
                    </Tab>

                    <Tab eventKey="contact" title="Contact Information">
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formAddress" className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={editFormData.address || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </Form.Group>

                        <Row>
                          <Col md={4}>
                            <Form.Group controlId="formCountry" className="mb-3">
                              <Form.Label>Country</Form.Label>
                              <Form.Control
                                type="text"
                                name="country"
                                value={editFormData.country || ''}
                                onChange={handleInputChange}
                                disabled={!isEditMode}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="formState" className="mb-3">
                              <Form.Label>State</Form.Label>
                              <Form.Control
                                type="text"
                                name="state"
                                value={editFormData.state || ''}
                                onChange={handleInputChange}
                                disabled={!isEditMode}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="formCity" className="mb-3">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                name="city"
                                value={editFormData.city || ''}
                                onChange={handleInputChange}
                                disabled={!isEditMode}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    </Tab>

                    <Tab eventKey="professional" title="Professional Information">
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formIntroduction" className="mb-3">
                          <Form.Label>Introduction</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="introduction"
                            value={editFormData.introduction || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </Form.Group>

                        <Form.Group controlId="formTalentScope" className="mb-3">
                          <Form.Label>Talent Scope</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.talent_scope && editFormData.talent_scope.map((talent, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="text"
                                    value={talent}
                                    onChange={(e) => handleArrayFieldChange('talent_scope', index, e.target.value)}
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('talent_scope', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('talent_scope')}
                              >
                                <FaPlus className="me-1" /> Add Talent
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.talent_scope && userData.talent_scope.length > 0 ? (
                                userData.talent_scope.map((talent, index) => (
                                  <Badge key={index} bg="secondary" className="me-2 mb-2">
                                    {talent}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-muted">No talents added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>
                      </Form>
                    </Tab>

                    <Tab eventKey="social" title="Social Media">
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formSocialMediaLinks" className="mb-3">
                          <Form.Label>Social Media Links</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.social_media_link && editFormData.social_media_link.map((link, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="url"
                                    value={link}
                                    onChange={(e) => handleArrayFieldChange('social_media_link', index, e.target.value)}
                                    placeholder="https://example.com"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('social_media_link', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('social_media_link')}
                              >
                                <FaPlus className="me-1" /> Add Link
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.social_media_link && userData.social_media_link.length > 0 ? (
                                userData.social_media_link.map((link, index) => (
                                  <div key={index} className="mb-2">
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      {link} <FaExternalLinkAlt className="ms-1" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted">No social media links added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group controlId="formAdditionalLinks" className="mb-3">
                          <Form.Label>Additional Links</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.additional_link && editFormData.additional_link.map((link, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="url"
                                    value={link}
                                    onChange={(e) => handleArrayFieldChange('additional_link', index, e.target.value)}
                                    placeholder="https://example.com"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('additional_link', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('additional_link')}
                              >
                                <FaPlus className="me-1" /> Add Link
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.additional_link && userData.additional_link.length > 0 ? (
                                userData.additional_link.map((link, index) => (
                                  <div key={index} className="mb-2">
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      {link} <FaExternalLinkAlt className="ms-1" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted">No additional links added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group controlId="formPortfolioLinks" className="mb-3">
                          <Form.Label>Portfolio Links</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.portfolio_link && editFormData.portfolio_link.map((link, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="url"
                                    value={link}
                                    onChange={(e) => handleArrayFieldChange('portfolio_link', index, e.target.value)}
                                    placeholder="https://example.com"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('portfolio_link', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('portfolio_link')}
                              >
                                <FaPlus className="me-1" /> Add Link
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.portfolio_link && userData.portfolio_link.length > 0 ? (
                                userData.portfolio_link.map((link, index) => (
                                  <div key={index} className="mb-2">
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      {link} <FaExternalLinkAlt className="ms-1" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted">No portfolio links added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>
                      </Form>
                    </Tab>

                    <Tab eventKey="documents" title="Documents & Certificates">
                      <div className="mb-3">
                        {isEditMode ? (
                          <div>
                            <Form.Group className="mb-3">
                              <Form.Label>Select Document Type to Upload</Form.Label>
                              <DropdownButton
                                id="document-type-dropdown"
                                title={selectedDocumentType ? 
                                  documentTypes.find(type => type.key === selectedDocumentType)?.label : 
                                  "Select Document Type"
                                }
                                onSelect={handleDocumentTypeSelect}
                                className="mb-3"
                              >
                                {documentTypes.map(type => (
                                  <Dropdown.Item key={type.key} eventKey={type.key}>
                                    {type.label}
                                  </Dropdown.Item>
                                ))}
                              </DropdownButton>
                              
                              {selectedDocumentType && (
                                <Form.Group controlId={`form${selectedDocumentType}`} className="mb-3">
                                  <Form.Label>
                                    {documentTypes.find(type => type.key === selectedDocumentType)?.label}
                                  </Form.Label>
                                  <Form.Control
                                    type="file"
                                    onChange={(e) => handleDocumentChange(e, selectedDocumentType)}
                                  />
                                  {documentExists(selectedDocumentType) && (
                                    <div className="mt-2">
                                      <small className="text-muted">
                                        Current file: {userData[selectedDocumentType]}
                                      </small>
                                    </div>
                                  )}
                                </Form.Group>
                              )}
                            </Form.Group>
                          </div>
                        ) : (
                          <div>
                            <h5 className="mb-3">Uploaded Documents</h5>
                            {documentTypes.filter(type => documentExists(type.key)).length > 0 ? (
                              <ListGroup>
                                {documentTypes.filter(type => documentExists(type.key)).map(type => (
                                  <ListGroup.Item key={type.key} className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <FaFileAlt className="me-2" />
                                      {type.label}
                                    </div>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      href={getDocumentUrl(userData[type.key])}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FaExternalLinkAlt className="me-1" /> View
                                    </Button>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <p className="text-muted">No documents uploaded</p>
                            )}
                          </div>
                        )}
                      </div>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default UserProfile;