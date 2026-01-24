import React, { useState, useEffect } from 'react';
import RegistrationModal from './RegistrationModal'; // Import the RegistrationModal component
import { Button, Form, Modal } from 'react-bootstrap';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [registeringForEvent, setRegisteringForEvent] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // For filtering events
  const [pendingEventId, setPendingEventId] = useState(null); // Store event ID if registration is pending

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        // Check if response is OK
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        // Get response text to check if it's HTML
        const responseText = await response.text();
        
        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If parsing fails, it's likely HTML
          console.error('Response is not valid JSON:', responseText.substring(0, 200));
          throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
        }
        
        if (data.success) {
          setEvents(data.data);
        } else {
          setError('Failed to fetch events: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error fetching events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Function to check if user exists
  const checkUserExists = async (email) => {
    if (!email) {
      setError('Please enter your email address');
      return false;
    }

    setCheckingUser(true);
    setError(null);

    try {
      const response = await fetch(`https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/get-userid/?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      // Check if response is OK
      if (!response.ok) {
        // 404 means user not found, so open registration modal
        if (response.status === 404) {
          setUserId(null);
          return false;
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      // Get response text to check if it's HTML
      const responseText = await response.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, it's likely HTML
        console.error('User check response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (data.user_id) {
        setUserId(data.user_id);
        return true;
      } else {
        setUserId(null);
        return false;
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Error checking user: ' + err.message);
      return false;
    } finally {
      setCheckingUser(false);
    }
  };

  // Function to register user for an event
  const registerForEvent = async (eventId) => {
    if (!userId) {
      // Show email modal without setting an error message
      setShowEmailModal(true);
      setPendingEventId(eventId);
      return;
    }

    setRegisteringForEvent(eventId);
    setRegistrationMessage('');

    try {
      const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-participant/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          event_id: eventId,
          user_id: userId
        })
      });

      // Get response text first to check if it's HTML
      const responseText = await response.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, it's likely HTML
        console.error('Registration response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      // Check if response is OK
      if (!response.ok) {
        // Try to extract error message from the response
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }
      
      // Success
      setRegistrationMessage('Successfully registered for the event!');
      console.log('Registration successful:', data);
    } catch (err) {
      console.error('Error registering for event:', err);
      setRegistrationMessage('Error registering for event: ' + err.message);
    } finally {
      setRegisteringForEvent(null);
    }
  };

  // Function to handle the register button click
  const handleRegisterClick = (eventId) => {
    // Store the event ID for later registration
    setPendingEventId(eventId);
    
    // If we already have a user ID, register directly
    if (userId) {
      registerForEvent(eventId);
    } else {
      // Show email modal to check user
      setShowEmailModal(true);
    }
  };

  // Function to handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      setError('Please enter your email address');
      return;
    }

    // Check if user exists
    const userExists = await checkUserExists(userEmail);
    
    if (userExists) {
      // User exists, close email modal and show message
      setShowEmailModal(false);
      setRegistrationMessage('Now you can apply for events');
      // If there's a pending event registration, complete it
      if (pendingEventId) {
        registerForEvent(pendingEventId);
        setPendingEventId(null);
      }
    } else {
      // User doesn't exist, close email modal and open registration modal
      setShowEmailModal(false);
      setShowRegistrationModal(true);
    }
  };

  // Function to handle the check button click in the main form
  const handleCheckEmail = async () => {
    const userExists = await checkUserExists(userEmail);
    
    if (userExists) {
      // User exists, show success message
      setRegistrationMessage('Now you can apply for events');
    } else {
      // User doesn't exist, show registration modal
      setShowRegistrationModal(true);
    }
  };

  // Function to handle registration success
  const handleRegistrationSuccess = (userData) => {
    setUserEmail(userData.email);
    setUserId(userData.user_id);
    setShowRegistrationModal(false);
    setRegistrationMessage('Now you can apply for events');
    
    // If there's a pending event registration, complete it
    if (pendingEventId) {
      registerForEvent(pendingEventId);
      setPendingEventId(null);
    }
  };

  // Function to format date from ISO string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return { month, day };
  };

  // Function to format time from ISO string
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  // Function to determine badge class based on event type
  const getBadgeClass = (eventType) => {
    if (!eventType) return 'academic'; // Default class when event_type is null
    return eventType.toLowerCase();
  };

  // Function to determine status badge and class based on event status
  const getStatusBadge = (event) => {
    if (event.is_past) {
      return { text: 'Past', className: 'past-event' };
    } else if (event.is_present) {
      return { text: 'Ongoing', className: 'present-event' };
    } else if (event.is_upcoming) {
      return { text: 'Upcoming', className: 'upcoming-event' };
    }
    return { text: 'Unknown', className: 'unknown-event' };
  };

  // Function to filter events based on status
  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'past') return event.is_past;
    if (activeFilter === 'present') return event.is_present;
    if (activeFilter === 'upcoming') return event.is_upcoming;
    return true;
  });

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          <h5>Error loading events</h5>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section id="events" className="events section">
        {/* Registration Message */}
        {registrationMessage && (
          <div className="container mb-4">
            <div className={`alert ${registrationMessage.includes('Successfully') ? 'alert-success' : 'alert-info'}`} role="alert">
              {registrationMessage}
            </div>
          </div>
        )}

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4">
            {filteredEvents.map((event, index) => {
              const { month, day } = formatDate(event.event_date_time);
              const time = formatTime(event.event_date_time);
              const status = getStatusBadge(event);
              const aosDelay = 200 + (index % 3) * 100; // Cycle through 200, 300, 400 for animation delays

              return (
                <div key={event.id} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={aosDelay}>
                  <div className={`event-item ${status.className}`}>
                    <div className="event-header">
                      <div className="event-date-overlay">
                        <span className="date">{month}<br/>{day}</span>
                      </div>
                      <div className="event-status-badge">
                        <span className={`badge ${status.className}`}>{status.text}</span>
                      </div>
                    </div>
                    <div className="event-details">
                      <div className="event-category">
                        <span className={`badge ${getBadgeClass(event.event_type)}`}>
                          {event.event_type || 'Event'}
                        </span>
                        <span className="event-time">{time}</span>
                      </div>
                      <h3>{event.event_name}</h3>
                      <p>{event.description}</p>
                      <div className="event-info">
                        <div className="info-row">
                          <i className="bi bi-geo-alt"></i>
                          <span>{event.venue}</span>
                        </div>
                      
                      </div>
                      <div className="event-footer">
                        {!event.is_past && (
                          <button 
                            className="register-btn"
                            onClick={() => handleRegisterClick(event.event_id)}
                            disabled={registeringForEvent === event.event_id}
                          >
                            {registeringForEvent === event.event_id ? 'Registering...' : 'Register Now'}
                          </button>
                        )}
                        {event.is_past && (
                          <button className="register-btn" disabled>
                            Event Ended
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="events-navigation" data-aos="fade-up" data-aos-delay="500">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('all')}
                  >
                    All Events
                  </button>
                  <button 
                    className={`filter-tab ${activeFilter === 'upcoming' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button 
                    className={`filter-tab ${activeFilter === 'present' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('present')}
                  >
                    Ongoing
                  </button>
                  <button 
                    className={`filter-tab ${activeFilter === 'past' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('past')}
                  >
                    Past
                  </button>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <a href="#" className="view-calendar-btn">
                  <i className="bi bi-calendar3"></i>
                  View Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEmailSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                We'll check if you have an account with us.
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={checkingUser}>
                {checkingUser ? 'Checking...' : 'Continue'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Registration Modal */}
      <RegistrationModal 
        show={showRegistrationModal} 
        handleClose={() => {
          setShowRegistrationModal(false);
          setPendingEventId(null);
        }}
        onRegistrationSuccess={handleRegistrationSuccess}
        userEmail={userEmail}
      />
    </div>
  );
}

export default Events;