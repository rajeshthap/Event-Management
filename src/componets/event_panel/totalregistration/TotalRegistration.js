import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner, Badge, Table, Image, Pagination, InputGroup } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../../context/AuthFetch";
import { useAuth } from "../../context/AuthContext";
import {
  FaUserMd, FaPhone, FaEnvelope, FaHome, FaVenusMars, FaRulerVertical, FaWeight, FaCalendarAlt,
  FaHospital, FaStethoscope, FaNotesMedical, FaUserClock, FaInfoCircle, FaExclamationTriangle,
  FaHeartbeat, FaAppleAlt, FaBed, FaBrain, FaEye, FaTooth,
  FaRunning, FaClipboardList, FaUserMd as FaUser, FaIdCard, FaBaby, FaCut, FaUserNurse,
  FaFileMedical, FaAllergies, FaPills, FaThermometer, FaHandHoldingMedical, FaStar, FaCommentDots,
  FaCheckCircle, FaTimesCircle, FaQuoteLeft, FaQuoteRight, FaChartLine, FaHeart, FaUsers, FaMapMarkerAlt,
  FaImage, FaLink, FaCertificate, FaBuilding, FaUserTie, FaGlobe, FaCity, FaInfo, FaEye as FaViewIcon,
  FaGraduationCap, FaTheaterMasks, FaMusic, FaPalette, FaCamera, FaMicrophone, FaBook, FaGamepad,
  FaFilm, FaCode, FaLaptopCode, FaDesktop, FaPencilRuler, FaBullhorn, FaHandshake,
  FaFilePdf, FaFileExcel, FaSearch
} from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

const TotalRegistration = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const admin_id = auth?.unique_id;

  console.log("Admin ID:", admin_id);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for registration entries
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Submission state
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Base URL for API
  const API_BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

  // Function to get icon based on user type
  const getUserTypeIcon = (userType) => {
    const type = userType ? userType.toLowerCase() : '';
    
    if (type.includes('student') || type.includes('education')) {
      return <FaGraduationCap />;
    } else if (type.includes('artist') || type.includes('art')) {
      return <FaPalette />;
    } else if (type.includes('musician') || type.includes('music')) {
      return <FaMusic />;
    } else if (type.includes('actor') || type.includes('actress') || type.includes('theater')) {
      return <FaTheaterMasks />;
    } else if (type.includes('photographer') || type.includes('photo')) {
      return <FaCamera />;
    } else if (type.includes('singer') || type.includes('vocal')) {
      return <FaMicrophone />;
    } else if (type.includes('writer') || type.includes('author')) {
      return <FaBook />;
    } else if (type.includes('gamer') || type.includes('gaming')) {
      return <FaGamepad />;
    } else if (type.includes('filmmaker') || type.includes('director')) {
      return <FaFilm />;
    } else if (type.includes('developer') || type.includes('programmer')) {
      return <FaCode />;
    } else if (type.includes('designer') || type.includes('ui') || type.includes('ux')) {
      return <FaPencilRuler />;
    } else if (type.includes('speaker') || type.includes('presenter')) {
      return <FaBullhorn />;
    } else if (type.includes('entrepreneur') || type.includes('business')) {
      return <FaHandshake />;
    } else if (type.includes('doctor') || type.includes('medical')) {
      return <FaUserMd />;
    } else {
      return <FaUser />;
    }
  };

  // Function to get badge color based on user type
  const getUserTypeBadgeColor = (userType) => {
    const type = userType ? userType.toLowerCase() : '';
    
    if (type.includes('student') || type.includes('education')) {
      return 'primary';
    } else if (type.includes('artist') || type.includes('art')) {
      return 'danger';
    } else if (type.includes('musician') || type.includes('music')) {
      return 'info';
    } else if (type.includes('actor') || type.includes('actress') || type.includes('theater')) {
      return 'warning';
    } else if (type.includes('photographer') || type.includes('photo')) {
      return 'dark';
    } else if (type.includes('singer') || type.includes('vocal')) {
      return 'success';
    } else if (type.includes('writer') || type.includes('author')) {
      return 'secondary';
    } else if (type.includes('gamer') || type.includes('gaming')) {
      return 'danger';
    } else if (type.includes('filmmaker') || type.includes('director')) {
      return 'dark';
    } else if (type.includes('developer') || type.includes('programmer')) {
      return 'info';
    } else if (type.includes('designer') || type.includes('ui') || type.includes('ux')) {
      return 'warning';
    } else if (type.includes('speaker') || type.includes('presenter')) {
      return 'primary';
    } else if (type.includes('entrepreneur') || type.includes('business')) {
      return 'success';
    } else if (type.includes('doctor') || type.includes('medical')) {
      return 'danger';
    } else {
      return 'secondary';
    }
  };

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
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    try {
      const url = `${API_BASE_URL}/api/reg-user/`;
      
      // Use the authFetch hook which should handle token refresh automatically
      const response = await authFetch(url, {
        method: "GET",
      });

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
      setFilteredEntries(processedEntries);
    } catch (error) {
      console.error("Error fetching registration entries:", error);
      
      // Check if it's an authentication error
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        setMessage("Your session has expired. Please log in again.");
        setVariant("warning");
        setShowAlert(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 3000);
      } else {
        setMessage(error.message || "An error occurred while fetching registration entries");
        setVariant("danger");
        setShowAlert(true);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Fetch registration entries when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchEntries();
    }
  }, [authLoading, isAuthenticated]);

  // Filter entries based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
          (entry.full_name && entry.full_name.toLowerCase().includes(query)) ||
          (entry.user_type && entry.user_type.toLowerCase().includes(query)) ||
          (entry.phone && entry.phone.toLowerCase().includes(query)) ||
          (entry.email && entry.email.toLowerCase().includes(query)) ||
          (entry.city && entry.city.toLowerCase().includes(query)) ||
          (entry.state && entry.state.toLowerCase().includes(query)) ||
          (entry.team_name && entry.team_name.toLowerCase().includes(query))
        );
      });
      setFilteredEntries(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, entries]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Function to download data as PDF
  const downloadPDF = () => {
    const doc = new jsPDF('l'); // Use landscape orientation for better fit
    doc.setFontSize(18);
    doc.text("Registration Data", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data with all fields
    const tableData = filteredEntries.map(entry => [
      entry.full_name || '',
      entry.user_type || '',
      entry.phone || '',
      entry.email || '',
      entry.gender || '',
      entry.address || '',
      entry.city || '',
      entry.state || '',
      entry.country || '',
      entry.team_name || '',
      Array.isArray(entry.talent_scope) ? entry.talent_scope.join(', ') : entry.talent_scope || '',
      entry.introduction || '',
      entry.formatted_created_date || entry.created_at || ''
    ]);
    
    // Add table using autoTable from jspdf-autotable
    autoTable(doc, {
      head: [['Name', 'User Type', 'Phone', 'Email', 'Gender', 'Address', 'City', 'State', 'Country', 'Team', 'Talent Scope', 'Introduction', 'Registration Date']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 123, 255] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 15 },
        5: { cellWidth: 30 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
        10: { cellWidth: 30 },
        11: { cellWidth: 40 },
        12: { cellWidth: 25 }
      }
    });
    
    // Save the PDF
    doc.save("registration_data.pdf");
  };

  // Function to download data as Excel
  const downloadExcel = () => {
    // Prepare data for Excel with all fields
    const excelData = filteredEntries.map(entry => ({
      'Full Name': entry.full_name || '',
      'User Type': entry.user_type || '',
      'Phone': entry.phone || '',
      'Email': entry.email || '',
      'Gender': entry.gender || '',
      'Address': entry.address || '',
      'City': entry.city || '',
      'State': entry.state || '',
      'Country': entry.country || '',
      'Team Name': entry.team_name || '',
      'Talent Scope': entry.talent_scope ? entry.talent_scope.join(', ') : '',
      'Introduction': entry.introduction || '',
      'Registration Date': entry.formatted_created_date || entry.created_at || ''
    }));
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    
    // Generate Excel file and download
    XLSX.writeFile(workbook, "registration_data.xlsx");
  };

  // Function to render mobile card view with all fields
  const renderMobileCard = (entry, index) => (
    <Card key={entry.id || entry.user_id} className="mb-3">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
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
            <Badge bg={getUserTypeBadgeColor(entry.user_type)} className="py-1 px-2">
              <span className="me-1">{getUserTypeIcon(entry.user_type)}</span>
              {entry.user_type}
            </Badge>
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-2">
            <small className="text-muted d-block">#</small>
            <span>{indexOfFirstItem + index + 1}</span>
          </div>
          <div className="col-6 mb-2">
            <small className="text-muted d-block">Phone</small>
            <span>{entry.phone}</span>
          </div>
          <div className="col-12 mb-2">
            <small className="text-muted d-block">Email</small>
            <span className="text-truncate d-block">{entry.email}</span>
          </div>
          <div className="col-6 mb-2">
            <small className="text-muted d-block">Gender</small>
            <span>{entry.gender}</span>
          </div>
          <div className="col-6 mb-2">
            <small className="text-muted d-block">Team</small>
            <span>{entry.team_name || 'N/A'}</span>
          </div>
          <div className="col-12 mb-2">
            <small className="text-muted d-block">Address</small>
            <span>{entry.address || 'N/A'}</span>
          </div>
          <div className="col-4 mb-2">
            <small className="text-muted d-block">City</small>
            <span>{entry.city}</span>
          </div>
          <div className="col-4 mb-2">
            <small className="text-muted d-block">State</small>
            <span>{entry.state}</span>
          </div>
          <div className="col-4 mb-2">
            <small className="text-muted d-block">Country</small>
            <span>{entry.country}</span>
          </div>
          <div className="col-12 mb-2">
            <small className="text-muted d-block">Talent Scope</small>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {entry.talent_scope && entry.talent_scope.length > 0 ? 
                entry.talent_scope.map((talent, index) => (
                  <Badge key={index} bg="secondary" className="py-1 px-2">
                    {talent}
                  </Badge>
                )) : 
                <span>Not specified</span>
              }
            </div>
          </div>
          <div className="col-12 mb-2">
            <small className="text-muted d-block">Introduction</small>
            <p className="mb-0 mt-1">{entry.introduction || 'No introduction provided.'}</p>
          </div>
          <div className="col-12">
            <small className="text-muted d-block">Registration Date</small>
            <span>{entry.formatted_created_date || entry.created_at}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

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
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>You need to be logged in to view this page.</p>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

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

                {/* Registration Entries Table */}
                {showTable && (
                  <>
                    {isFetching && (
                      <div className="d-flex justify-content-center mb-3">
                        <Spinner animation="border" size="sm" role="status">
                          <span className="visually-hidden">Refreshing...</span>
                        </Spinner>
                      </div>
                    )}
                    
                    {/* Search and Download Controls */}
                    <Row className="mb-3">
                      <Col md={6}>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search by name, type, email, city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={6} className="text-md-end mt-2 mt-md-0">
                        <Button 
                          variant="danger" 
                          className="me-2"
                          onClick={downloadPDF}
                          disabled={filteredEntries.length === 0}
                        >
                          <FaFilePdf className="me-1" /> Download PDF
                        </Button>
                        <Button 
                          variant="success" 
                          onClick={downloadExcel}
                          disabled={filteredEntries.length === 0}
                        >
                          <FaFileExcel className="me-1" /> Download Excel
                        </Button>
                      </Col>
                    </Row>
                    
                    {filteredEntries.length === 0 ? (
                      <div className="text-center my-5">
                        <p>{searchQuery ? "No matching registration entries found." : "No registration entries found."}</p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View with all fields */}
                        {!isMobile && (
                          <div className="table-responsive" style={{ overflowX: 'auto' }}>
                            <Table striped bordered hover className="align-middle">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Profile</th>
                                  <th>Full Name</th>
                                  <th>User Type</th>
                                  <th>Phone</th>
                                  <th>Email</th>
                                  <th>Gender</th>
                                  <th>Address</th>
                                  <th>City</th>
                                  <th>State</th>
                                  <th>Country</th>
                                  <th>Team</th>
                                  <th>Talent Scope</th>
                                  <th>Introduction</th>
                                  <th>Registration Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentItems.map((entry, index) => (
                                  <tr key={entry.id || entry.user_id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>
                                      <div className="consultation-avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center">
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
                                    </td>
                                    <td>{entry.full_name}</td>
                                    <td>
                                      <Badge bg={getUserTypeBadgeColor(entry.user_type)} className="py-1 px-2">
                                        <span className="me-1">{getUserTypeIcon(entry.user_type)}</span>
                                        {entry.user_type}
                                      </Badge>
                                    </td>
                                    <td>{entry.phone}</td>
                                    <td>{entry.email}</td>
                                    <td>{entry.gender}</td>
                                    <td>{entry.address || 'N/A'}</td>
                                    <td>{entry.city}</td>
                                    <td>{entry.state}</td>
                                    <td>{entry.country}</td>
                                    <td>{entry.team_name || 'N/A'}</td>
                                    <td>
                                      <div className="d-flex flex-wrap gap-1">
                                        {entry.talent_scope && entry.talent_scope.length > 0 ? 
                                          entry.talent_scope.map((talent, index) => (
                                            <Badge key={index} bg="secondary" className="py-1 px-2">
                                              {talent}
                                            </Badge>
                                          )) : 
                                          <span>Not specified</span>
                                        }
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {entry.introduction || 'No introduction provided.'}
                                      </div>
                                    </td>
                                    <td>{entry.formatted_created_date || entry.created_at}</td>
                                  </tr>
                                ))}
                                {currentItems.length > 0 && (
                                  <tr className="table-primary fw-bold">
                                    <td colSpan={3}>Total</td>
                                    <td colSpan={12}>{filteredEntries.length} Registrations</td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        )}

                        {/* Mobile Card View */}
                        {isMobile && (
                          <div>
                            {currentItems.map((entry, index) => renderMobileCard(entry, index))}
                          </div>
                        )}
                        
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
