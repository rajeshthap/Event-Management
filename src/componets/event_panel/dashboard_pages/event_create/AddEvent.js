import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Image } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";


import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaClock, FaMoneyBillWave, FaTag, FaImage, FaLink, FaUsers, FaInfoCircle } from "react-icons/fa";
import DashBoardHeader from "../../DashBoardHeader";
import LeftNav from "../../LeftNav";
import { useAuthFetch } from "../../../context/AuthFetch";
import { useAuth } from "../../../context/AuthContext";

const AddEvent = () => {
  const { auth, logout, refreshAccessToken } = useAuth();
  const admin_id = auth?.unique_id;
  
  console.log("Admin ID:", admin_id);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state for Event with all fields
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_date_time: "",
    venue: "",
    event_type: "",
    organizer_name: "",
    organizer_contact: "",
    organizer_email: "",
    registration_deadline: "",
    max_participants: "",
    event_image: null,
    event_status: "upcoming",
    registration_fee: "",
    event_category: "",
    tags: "",
    is_featured: false,
    event_link: "",
    additional_notes: ""
  });
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  
  // State for description validation error
  const [descriptionError, setDescriptionError] = useState("");
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      // Handle file upload for event image
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
        
        // Create preview for image
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === "checkbox") {
      // Handle checkbox for is_featured
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle text inputs, selects, etc.
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate description length
      if (name === "description") {
        const wordCount = value.trim().split(/\s+/).length;
        if (value.trim() === "") {
          setDescriptionError("Description is required.");
        } else if (wordCount <= 10) {
          setDescriptionError(`Description must be more than 10 words. You have entered ${wordCount} words.`);
        } else {
          setDescriptionError(""); // Clear error if valid
        }
      }
    }
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      event_name: "",
      description: "",
      event_date_time: "",
      venue: "",
      event_type: "",
      organizer_name: "",
      organizer_contact: "",
      organizer_email: "",
      registration_deadline: "",
      max_participants: "",
      event_image: null,
      event_status: "upcoming",
      registration_fee: "",
      event_category: "",
      tags: "",
      is_featured: false,
      event_link: "",
      additional_notes: ""
    });
    setImagePreview(null);
    setMessage("");
    setShowAlert(false);
    setDescriptionError("");
  };

  // Handle form submission (POST request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors before submitting
    if (descriptionError) {
      setMessage("Please fix the validation errors before submitting.");
      setVariant("danger");
      setShowAlert(true);
      return;
    }
    
    setIsSubmitting(true);
    setShowAlert(false);
    
    try {
      // Create a FormData object to send the data
      const dataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'event_image' && formData[key] instanceof File) {
          dataToSend.append(key, formData[key]);
        } else if (key !== 'event_image') {
          dataToSend.append(key, formData[key]);
        }
      });
      
      console.log("Submitting event data:");
      for (let pair of dataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      
      // Use fetch directly for FormData
      const url = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/";
      let response = await fetch(url, {
        method: "POST",
        body: dataToSend,
        headers: {
          Authorization: `Bearer ${auth?.access}`,
        },
      });
      
      // If unauthorized, try refreshing token and retry once
      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error("Session expired");
        response = await fetch(url, {
          method: "POST",
          body: dataToSend,
          headers: {
            Authorization: `Bearer ${newAccess}`,
          },
        });
      }
      
      console.log("POST Response status:", response.status);
      
      // Handle bad API responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData = null;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          /* not JSON */
        }
        console.error("Server error response:", errorData || errorText);
        throw new Error((errorData && errorData.message) || "Failed to add event");
      }
      
      // SUCCESS PATH
      const result = await response.json();
      console.log("POST Success response:", result);
      
      if (result.success) {
        setMessage("Event added successfully!");
        setVariant("success");
        setShowAlert(true);
        clearForm();
        
        // Hide success alert after 3 seconds
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to add event");
      }
      
    } catch (error) {
      // FAILURE PATH
      console.error("Error adding event:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      
      // Hide error alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <h1 className="page-title">Add Event</h1>
            
            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              {/* Basic Event Information */}
              <Card className="mb-4">
                <Card.Header as="h5">Basic Event Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaInfoCircle className="me-2" />Event Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter event name"
                          name="event_name"
                          value={formData.event_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaTag className="me-2" />Event Category</Form.Label>
                        <Form.Select
                          name="event_category"
                          value={formData.event_category}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select category</option>
                          <option value="conference">Conference</option>
                          <option value="workshop">Workshop</option>
                          <option value="seminar">Seminar</option>
                          <option value="cultural">Cultural</option>
                          <option value="sports">Sports</option>
                          <option value="social">Social</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaCalendarAlt className="me-2" />Event Date & Time</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="event_date_time"
                          value={formData.event_date_time}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaClock className="me-2" />Registration Deadline</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="registration_deadline"
                          value={formData.registration_deadline}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaMapMarkerAlt className="me-2" />Venue</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter venue"
                          name="venue"
                          value={formData.venue}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaLink className="me-2" />Event Link (for virtual events)</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="Enter event link"
                          name="event_link"
                          value={formData.event_link}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description (must be more than 10 words)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter event description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      isInvalid={!!descriptionError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {descriptionError}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              {/* Event Image */}
              <Card className="mb-4">
                <Card.Header as="h5">Event Image</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaImage className="me-2" />Upload Event Image</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          name="event_image"
                          onChange={handleChange}
                        />
                        <Form.Text className="text-muted">
                          Supported formats: JPG, PNG, GIF. Max size: 5MB.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      {imagePreview && (
                        <div className="image-preview-container">
                          <p className="mb-2">Image Preview:</p>
                          <Image src={imagePreview} alt="Event preview" thumbnail style={{ maxWidth: '200px' }} />
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              {/* Organizer Information */}
              <Card className="mb-4">
                <Card.Header as="h5">Organizer Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaUser className="me-2" />Organizer Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter organizer name"
                          name="organizer_name"
                          value={formData.organizer_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter contact number"
                          name="organizer_contact"
                          value={formData.organizer_contact}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email address"
                          name="organizer_email"
                          value={formData.organizer_email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              {/* Event Details */}
              <Card className="mb-4">
                <Card.Header as="h5">Event Details</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Event Type</Form.Label>
                        <Form.Select
                          name="event_type"
                          value={formData.event_type}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select event type</option>
                          <option value="in-person">In-Person</option>
                          <option value="virtual">Virtual</option>
                          <option value="hybrid">Hybrid</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Event Status</Form.Label>
                        <Form.Select
                          name="event_status"
                          value={formData.event_status}
                          onChange={handleChange}
                          required
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaUsers className="me-2" />Max Participants</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter maximum participants"
                          name="max_participants"
                          value={formData.max_participants}
                          onChange={handleChange}
                          min="1"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaMoneyBillWave className="me-2" />Registration Fee</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter registration fee (0 for free)"
                          name="registration_fee"
                          value={formData.registration_fee}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaTag className="me-2" />Tags (comma separated)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter tags (e.g., tech, innovation, networking)"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Additional Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter any additional notes or special instructions"
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Feature this event"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <div className="d-flex gap-2 mt-3">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Add Event"}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={clearForm}
                  type="button"
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Container>
        </div>
      </div>
    </>
  );
};

export default AddEvent;