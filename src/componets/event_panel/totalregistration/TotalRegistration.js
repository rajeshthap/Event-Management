import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Badge, Table, Image, Pagination, Accordion } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import LeftNav from "../LeftNav";
import "../../../assets/css/consultnow.css"
import DashBoardHeader from "../DashBoardHeader";
import {
  FaUserMd, FaPhone, FaEnvelope, FaHome, FaVenusMars, FaRulerVertical, FaWeight, FaCalendarAlt,
  FaHospital, FaStethoscope, FaNotesMedical, FaUserClock, FaInfoCircle, FaExclamationTriangle,
  FaHeartbeat, FaAppleAlt, FaBed, FaBrain, FaEye, FaTooth,
  FaRunning, FaClipboardList, FaUserMd as FaUser, FaIdCard, FaBaby, FaCut, FaUserNurse,
  FaFileMedical, FaAllergies, FaPills, FaThermometer, FaHandHoldingMedical, FaStar, FaCommentDots,
  FaCheckCircle, FaTimesCircle, FaQuoteLeft, FaQuoteRight, FaChartLine, FaHeart, FaUsers, FaMapMarkerAlt,
  FaImage, FaLink, FaCertificate, FaBuilding, FaUserTie, FaGlobe, FaCity, FaInfo
} from "react-icons/fa";

const TotalRegistration = () => {
  const { auth, logout, refreshAccessToken } = useAuth();
  const admin_id = auth?.unique_id;

  console.log("Admin ID:", admin_id);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for registration entries
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Submission state
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Base URL for API
  const API_BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

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

  // Fetch registration entries from API
  const fetchEntries = async () => {
    setIsLoading(true);
    setIsFetching(true);
    try {
      const url = `${API_BASE_URL}/api/reg-user/`;
      let response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth?.access}`,
        },
      });

      // If unauthorized, try refreshing token and retry once
      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error("Session expired");
        response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${newAccess}`,
          },
        });
      }

      if (!response.ok) {
        throw new Error("Failed to fetch registration entries");
      }

      const result = await response.json();
      console.log("GET API Response:", result);

      // Handle both response formats: direct array or wrapped in success/data object
      let entriesData = [];
      if (Array.isArray(result)) {
        // Direct array response
        entriesData = result;
      } else if (result.success && result.data) {
        // Wrapped response
        entriesData = result.data;
      } else {
        throw new Error("No registration entries found");
      }

      // Process data to format dates
      const processedEntries = entriesData.map(entry => {
        const processedEntry = { ...entry };
        
        // Format created date if it exists
        if (entry.created_at) {
          const createdDate = new Date(entry.created_at);
          processedEntry.formatted_created_date = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        return processedEntry;
      });

      setEntries(processedEntries);
    } catch (error) {
      console.error("Error fetching registration entries:", error);
      setMessage(error.message || "An error occurred while fetching registration entries");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Fetch registration entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = entries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entries.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Function to render talent scope as badges
  const renderTalentScope = (talentScope) => {
    if (!talentScope || talentScope.length === 0) {
      return <span className="text-muted">Not specified</span>;
    }
    
    return (
      <div className="d-flex flex-wrap gap-1">
        {talentScope.map((talent, index) => (
          <Badge key={index} bg="secondary">
            {talent}
          </Badge>
        ))}
      </div>
    );
  };

  // Function to render social media links
  const renderSocialLinks = (links) => {
    if (!links || links.length === 0) {
      return <span className="text-muted">Not specified</span>;
    }
    
    return (
      <div className="d-flex flex-column gap-1">
        {links.map((link, index) => (
          <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-primary">
            <FaLink className="me-1" />
            {link}
          </a>
        ))}
      </div>
    );
  };

  // Function to render certificates
  const renderCertificates = (certificates, title) => {
    if (!certificates) {
      return <span className="text-muted">Not uploaded</span>;
    }
    
    return (
      <div className="d-flex flex-column gap-2">
        {typeof certificates === 'string' ? (
          <a href={`${API_BASE_URL}${certificates}`} target="_blank" rel="noopener noreferrer" className="text-primary">
            <FaCertificate className="me-1" />
            {title}
          </a>
        ) : (
          <span className="text-muted">Not uploaded</span>
        )}
      </div>
    );
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">Total Registrations</h1>
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

            {/* Registration Count Card */}
            {isLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <Card 
                      className="h-100 shadow-sm card-hover cursor-pointer" 
                      onClick={() => setShowTable(!showTable)}
                    >
                      <Card.Body className="d-flex flex-row align-items-center justify-content-between p-3">
                        <div className="d-flex align-items-center">
                          <FaUsers className="text-success me-3" size={36} />
                          <div>
                            <p className="mb-0">Total Registrations</p>
                          </div>
                        </div>
                        <div className="text-end">
                          <h2 className="display-4 fw-bold text-success">{entries.length}</h2>
                         
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Registration Entries Accordion */}
                {showTable && (
                  <>
                    {isFetching && (
                      <div className="d-flex justify-content-center mb-3">
                        <Spinner animation="border" size="sm" role="status">
                          <span className="visually-hidden">Refreshing...</span>
                        </Spinner>
                      </div>
                    )}
                    
                    {entries.length === 0 ? (
                      <div className="text-center my-5">
                        <p>No registration entries found.</p>
                      </div>
                    ) : (
                      <>
                        <Accordion defaultActiveKey="0">
                          {currentItems.map((entry, index) => (
                            <Accordion.Item eventKey={entry.id || index.toString()} key={entry.id || index}>
                              <Accordion.Header>
                                <div className="d-flex align-items-center w-100">
                                  <div className="consultation-avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                                    {entry.profile_image ? (
                                      <Image 
                                        src={`${API_BASE_URL}${entry.profile_image}`} 
                                        alt={entry.full_name}
                                        className="rounded-circle"
                                        width="40"
                                        height="40"
                                      />
                                    ) : (
                                      entry.full_name ? entry.full_name.charAt(0).toUpperCase() : 'U'
                                    )}
                                  </div>
                                  <div className="flex-grow-1">
                                    <h5 className="mb-0">{entry.full_name}</h5>
                                    <small>{entry.user_type} | {entry.phone} | {entry.email}</small>
                                  </div>
                                  <div className="text-end me-3">
                                    <FaCalendarAlt className="me-1" />
                                    <small>{entry.formatted_created_date || entry.created_at}</small>
                                  </div>
                                </div>
                              </Accordion.Header>
                              
                              <Accordion.Body>
                                <Card className="consultation-card shadow-sm">
                                  <Card.Body className="p-4">
                                    <Row>
                                      {/* Left Column: Basic Information */}
                                      <Col md={6} className="mb-4 mb-md-0">
                                        <h6 className="section-title text-success"><FaUser className="me-2" />Basic Information</h6>
                                        <div className="info-group">
                                          <div className="info-item">
                                            <span className="info-label"><FaIdCard className="me-2 text-success" />User ID:</span>
                                            <span className="info-value">{entry.user_id}</span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaUserTie className="me-2 text-success" />User Type:</span>
                                            <span className="info-value">{entry.user_type}</span>
                                          </div>
                                          {entry.team_name && (
                                            <div className="info-item">
                                              <span className="info-label"><FaBuilding className="me-2 text-success" />Team Name:</span>
                                              <span className="info-value">{entry.team_name}</span>
                                            </div>
                                          )}
                                          <div className="info-item">
                                            <span className="info-label"><FaVenusMars className="me-2 text-success" />Gender:</span>
                                            <span className="info-value">{entry.gender}</span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaPhone className="me-2 text-success" />Phone:</span>
                                            <span className="info-value">{entry.phone}</span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaEnvelope className="me-2 text-success" />Email:</span>
                                            <span className="info-value">{entry.email}</span>
                                          </div>
                                        </div>
                                      </Col>

                                      {/* Right Column: Address */}
                                      <Col md={6} className="mb-4 mb-md-0">
                                        <h6 className="section-title text-success"><FaMapMarkerAlt className="me-2" />Address Information</h6>
                                        <div className="info-group">
                                          <div className="info-item">
                                            <span className="info-label"><FaHome className="me-2 text-success" />Address:</span>
                                            <span className="info-value">{entry.address}</span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaCity className="me-2 text-success" />City:</span>
                                            <span className="info-value">{entry.city}</span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaMapMarkerAlt className="me-2 text-success" />State:</span>
                                            <span className="info-value">{entry.state}</span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaGlobe className="me-2 text-success" />Country:</span>
                                            <span className="info-value">{entry.country}</span>
                                          </div>
                                        </div>
                                      </Col>
                                    </Row>
                                    
                                    <Row>
                                      {/* Profile & Talent Section */}
                                      <Col md={6} className="mb-4">
                                        <h6 className="section-title text-success"><FaStar className="me-2" />Profile & Talent</h6>
                                        <div className="info-group">
                                          <div className="info-item">
                                            <span className="info-label"><FaImage className="me-2 text-success" />Profile Image:</span>
                                            <span className="info-value">
                                              {entry.profile_image ? (
                                                <a href={`${API_BASE_URL}${entry.profile_image}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                  View Image
                                                </a>
                                              ) : (
                                                <span className="text-muted">Not uploaded</span>
                                              )}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaStar className="me-2 text-success" />Talent Scope:</span>
                                            <span className="info-value">
                                              {renderTalentScope(entry.talent_scope)}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaLink className="me-2 text-success" />Social Media Links:</span>
                                            <span className="info-value">
                                              {renderSocialLinks(entry.social_media_link)}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label"><FaLink className="me-2 text-success" />Additional Links:</span>
                                            <span className="info-value">
                                              {renderSocialLinks(entry.additional_link)}
                                            </span>
                                          </div>
                                        </div>
                                      </Col>

                                      {/* Portfolio & Certificates Section */}
                                      <Col md={6} className="mb-4">
                                        <h6 className="section-title text-success"><FaCertificate className="me-2" />Portfolio & Certificates</h6>
                                        <div className="info-group">
                                          <div className="info-item">
                                            <span className="info-label"><FaFileMedical className="me-2 text-success" />Portfolio File:</span>
                                            <span className="info-value">
                                              {entry.portfolio_file ? (
                                                <a href={`${API_BASE_URL}${entry.portfolio_file}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                  View Portfolio
                                                </a>
                                              ) : (
                                                <span className="text-muted">Not uploaded</span>
                                              )}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label">National Level Certificate:</span>
                                            <span className="info-value">
                                              {renderCertificates(entry.national_level_certificate, "National Level Certificate")}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label">International Certificate:</span>
                                            <span className="info-value">
                                              {renderCertificates(entry.internation_level_certificate_award, "International Certificate")}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label">State Level Certificate:</span>
                                            <span className="info-value">
                                              {renderCertificates(entry.state_level_certificate, "State Level Certificate")}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label">District Level Certificate:</span>
                                            <span className="info-value">
                                              {renderCertificates(entry.district_level_certificate, "District Level Certificate")}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label">College Level Certificate:</span>
                                            <span className="info-value">
                                              {renderCertificates(entry.college_level_certificate, "College Level Certificate")}
                                            </span>
                                          </div>
                                          <div className="info-item">
                                            <span className="info-label">Other Certificate:</span>
                                            <span className="info-value">
                                              {renderCertificates(entry.other_certificate, "Other Certificate")}
                                            </span>
                                          </div>
                                        </div>
                                      </Col>
                                    </Row>
                                    
                                    <Row>
                                      <Col md={12}>
                                        <h6 className="section-title text-success"><FaInfo className="me-2" />Introduction</h6>
                                        <div className="info-group">
                                          <div className="info-item">
                                            <span className="info-value">{entry.introduction}</span>
                                          </div>
                                        </div>
                                      </Col>
                                    </Row>
                                  </Card.Body>
                                </Card>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                              <Pagination.Prev 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}
                              />
                              {[...Array(totalPages).keys()].map(page => (
                                <Pagination.Item 
                                  key={page + 1} 
                                  active={page + 1 === currentPage}
                                  onClick={() => handlePageChange(page + 1)}
                                >
                                  {page + 1}
                                </Pagination.Item>
                              ))}
                              <Pagination.Next 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                              />
                            </Pagination>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default TotalRegistration;