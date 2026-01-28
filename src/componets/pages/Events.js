import React, { useState, useEffect } from 'react';
import RegistrationModal from './RegistrationModal'; // Import the RegistrationModal component
import { Button, Container, Form, Modal } from 'react-bootstrap';

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
  const [registeredEvents, setRegisteredEvents] = useState([]); // Store events user has registered for

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
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
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

  const fetchRegisteredEvents = async (userId) => {
    try {
      const response = await fetch(`https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-participant/?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Registered events response is not valid JSON:', responseText.substring(0, 200));
        return [];
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data.map(registration => registration.event_id);
      }
      return [];
    } catch (err) {
      console.error('Error fetching registered events:', err);
      return [];
    }
  };

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
      
      if (!response.ok) {
        if (response.status === 404) {
          setUserId(null);
          return false;
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('User check response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (data.user_id) {
        setUserId(data.user_id);
        const userRegisteredEvents = await fetchRegisteredEvents(data.user_id);
        setRegisteredEvents(userRegisteredEvents);
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

  const registerForEvent = async (eventId) => {
    if (!userId) {
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

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Registration response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (!response.ok) {
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
      
      setRegistrationMessage('Successfully registered for the event!');
      console.log('Registration successful:', data);
      if (!registeredEvents.includes(eventId)) {
        setRegisteredEvents(prev => [...prev, eventId]);
      }
    } catch (err) {
      console.error('Error registering for event:', err);
      setRegistrationMessage('Error registering for event: ' + err.message);
    } finally {
      setRegisteringForEvent(null);
    }
  };

  const handleRegisterClick = (eventId) => {
    setPendingEventId(eventId);
    if (userId) {
      registerForEvent(eventId);
    } else {
      setShowEmailModal(true);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      setError('Please enter your email address');
      return;
    }

    const userExists = await checkUserExists(userEmail);
    
    if (userExists) {
      setShowEmailModal(false);
      setRegistrationMessage('Now you can apply for events');
      if (pendingEventId) {
        registerForEvent(pendingEventId);
        setPendingEventId(null);
      }
    } else {
      setShowEmailModal(false);
      setShowRegistrationModal(true);
    }
  };

  const handleCheckEmail = async () => {
    const userExists = await checkUserExists(userEmail);
    
    if (userExists) {
      setRegistrationMessage('Now you can apply for events');
    } else {
      setShowRegistrationModal(true);
    }
  };

  const handleRegistrationSuccess = (userData) => {
    setUserEmail(userData.email);
    setUserId(userData.user_id);
    setShowRegistrationModal(false);
    setRegistrationMessage('Now you can apply for events');
    
    fetchRegisteredEvents(userData.user_id).then(userRegisteredEvents => {
      setRegisteredEvents(userRegisteredEvents);
    });
    
    if (pendingEventId) {
      registerForEvent(pendingEventId);
      setPendingEventId(null);
    }
  };

  // --- UPDATED: Improved date formatting function ---
  const formatDate = (dateString) => {
    if (!dateString) return { day: 'N/A', monthYear: 'N/A' };
    
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options); // e.g., "15 Jan 2024"
    
    const parts = formattedDate.split(' ');
    return {
      day: parts[0],
      monthYear: `${parts[1]} ${parts[2]}`
    };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const getBadgeClass = (eventType) => {
    if (!eventType) return 'academic';
    return eventType.toLowerCase();
  };

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
    <Container className='box-shadow'>
      <section id="events" className="events section">
        {registrationMessage && (
          <div className="container  mb-4">
          

            <div className={`alert ${registrationMessage.includes('Successfully') ? 'alert-success' : 'alert-info'}`} role="alert">
              {registrationMessage}
            </div>
          </div>
        )}

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row section-title g-4">
              <h2>Events</h2>
            {filteredEvents.map((event, index) => {
              // --- UPDATED: Using the new formatDate function ---
              const { day, monthYear } = formatDate(event.event_date_time);
              const time = formatTime(event.event_date_time);
              const status = getStatusBadge(event);
              const aosDelay = 200 + (index % 3) * 100;

              return (
                <div key={event.id} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={aosDelay}>
                  <div className={`event-item ${status.className}`}>
                    <div className="event-header">
                      <div className="event-date-overlay">
                        {/* --- UPDATED: Displaying the new date format --- */}
                        <span className="date">{day}{monthYear}</span>
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
                        {/* --- UPDATED: Added a clear display for the event type --- */}
                        <div className="info-row">
                          <i className="bi bi-tag"></i>
                          <span>Type: {event.event_type || 'General'}</span>
                        </div>
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
                            disabled={registeringForEvent === event.event_id || registeredEvents.includes(event.event_id)}
                          >
                            {registeredEvents.includes(event.event_id) 
                              ? 'Already Registered' 
                              : (registeringForEvent === event.event_id ? 'Registering...' : 'Register Now')}
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

      <RegistrationModal 
        show={showRegistrationModal} 
        handleClose={() => {
          setShowRegistrationModal(false);
          setPendingEventId(null);
        }}
        onRegistrationSuccess={handleRegistrationSuccess}
        userEmail={userEmail}
      />
    </Container>
  );
}

export default Events;