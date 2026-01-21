import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from "react-bootstrap";


import { useNavigate } from "react-router-dom";

import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import DashBoardHeader from "../../DashBoardHeader";
import LeftNav from "../../LeftNav";
import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";

const ManageEvent = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all events
  const [events, setEvents] = useState([]);
  
  // Form state for selected event
  const [formData, setFormData] = useState({
    id: null,
    event_id: "",
    event_name: "",
    description: "",
    event_date_time: "",
    venue: "",
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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

  // Fetch all events on component mount
  useEffect(() => {
    fetchAllEvents();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all events from API
  const fetchAllEvents = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events data");
      }

      const result = await response.json();
      console.log("GET All Events API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setEvents(result.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific event data by ID
  const fetchEventData = async (eventId) => {
    setIsLoading(true);
    try {
      console.log("Fetching event with ID:", eventId);
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch event data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Event Details API Response:", result);

      if (result.success) {
        let eventData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          eventData = result.data.find(item => item.id.toString() === eventId.toString());
          if (!eventData) {
            throw new Error(`Event with ID ${eventId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === eventId.toString()) {
            eventData = result.data;
          } else {
            throw new Error(`Returned event ID ${result.data.id} does not match requested ID ${eventId}`);
          }
        } else {
          throw new Error("Invalid event data structure in response");
        }

        setFormData({
          id: eventData.id,
          event_id: eventData.event_id,
          event_name: eventData.event_name,
          description: eventData.description,
          event_date_time: eventData.event_date_time,
          venue: eventData.venue,
        });

        setSelectedEventId(eventId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No event data found in response");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setMessage(error.message || "An error occurred while fetching event data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event card click
  const handleEventClick = (eventId) => {
    console.log("Event card clicked with ID:", eventId);
    fetchEventData(eventId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to event list
  const backToEventList = () => {
    setSelectedEventId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Enable adding new event
  const addNewEvent = () => {
    setFormData({
      id: null,
      event_id: "",
      event_name: "",
      description: "",
      event_date_time: "",
      venue: "",
    });
    setIsEditing(true);
    setSelectedEventId(null);
    setShowAlert(false);
  };

  // Handle form submission (POST for new, PUT for update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const payload = {
        event_id: formData.event_id,
        event_name: formData.event_name,
        description: formData.description,
        event_date_time: formData.event_date_time,
        venue: formData.venue,
      };

      console.log("Submitting data for event:", formData.event_name);
      console.log("Payload:", payload);

      let response;
      let successMessage;
      
      if (formData.id) {
        // Update existing event
        response = await authFetch(
          `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        successMessage = "Event updated successfully!";
      } else {
        // Create new event
        response = await authFetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        successMessage = "Event created successfully!";
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || "Failed to save event details"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.success) {
        setMessage(successMessage);
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);
        
        // Refresh the events list
        await fetchAllEvents();
        
        // If creating a new event, switch to view mode for the new event
        if (!formData.id && result.data && result.data.id) {
          fetchEventData(result.data.id);
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to save event details"
        );
      }
    } catch (error) {
      console.error("Error saving event details:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setIsSubmitting(true);
    try {
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/?id=${eventToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage("Event deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the events list
        await fetchAllEvents();
        
        // If we were viewing the deleted event, go back to the list
        if (selectedEventId === eventToDelete.id) {
          backToEventList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setMessage(error.message || "An error occurred while deleting the event");
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
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
        <div className="main-content-dash">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">Manage Events</h1>
              <Button variant="primary" onClick={addNewEvent}>
                <FaPlus /> Add New Event
              </Button>
            </div>

            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert
                variant={variant}
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {message}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading Events...</p>
              </div>
            ) : (
              <>
                {!selectedEventId ? (
                  // Events List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        <h2 className="mb-4">Select an Event to Edit</h2>
                        {events.length === 0 ? (
                          <Alert variant="info">
                            No events found. Click "Add New Event" to create one.
                          </Alert>
                        ) : (
                          <Row>
                            {events.map((event) => (
                              <Col md={6} lg={4} className="mb-4" key={event.id}>
                                <Card className="h-100 event-card profile-card">
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      <Card.Title as="h5" className="mb-3">
                                        {event.event_name}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>ID:</strong> {event.event_id}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Date & Time:</strong> {formatDate(event.event_date_time)}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Venue:</strong> {event.venue}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-3">
                                        {event.description && event.description.length > 100 
                                          ? `${event.description.substring(0, 100)}...` 
                                          : event.description}
                                      </Card.Text>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => handleEventClick(event.id)}
                                      >
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => showDeleteConfirmation(event)}
                                      >
                                        <FaTrash /> Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Event Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToEventList}>
                        <FaArrowLeft /> Back to Events List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5">
                        {formData.id ? `Edit Event: ${formData.event_name}` : "Add New Event"}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                       

                          <Form.Group className="mb-3">
                            <Form.Label>Event Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter event name"
                              name="event_name"
                              value={formData.event_name}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter event description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Date & Time</Form.Label>
                            <Form.Control
                              type="datetime-local"
                              name="event_date_time"
                              value={formData.event_date_time}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Venue</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter event venue"
                              name="venue"
                              value={formData.venue}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Form>
                      </Card.Body>
                    </Card>

                    <div className="d-flex gap-2 mt-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                          >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={resetForm}
                            type="button"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="primary"
                            onClick={enableEditing}
                            type="button"
                          >
                            <FaEdit /> Edit Event Details
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => showDeleteConfirmation(formData)}
                            type="button"
                          >
                            <FaTrash /> Delete Event
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the event "{eventToDelete?.event_name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteEvent}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageEvent;