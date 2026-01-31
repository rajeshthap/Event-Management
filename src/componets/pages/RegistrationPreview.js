import React, { useState } from 'react';
import { Image, Badge, Alert, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import '../../assets/css/registration.css';
import Logo from "../../assets/images/br-event-logo.png"

const RegistrationPreview = ({ 
  formData, 
  certificateUrls, 
  alreadyRegisteredMessage, 
  phoneAlreadyRegisteredMessage,
  isVerified = false
}) => {
  // State for full-screen certificate preview
  const [fullscreenPreview, setFullscreenPreview] = useState({
    isOpen: false,
    certificateId: null,
    certificateUrl: null,
    certificateLabel: null
  });

  // Certificate options for reference
  const certificateOptions = [
    { id: 'national_level_certificate', label: 'National Level Certificate' },
    { id: 'internation_level_certificate_award', label: 'International Level Certificate/Award' },
    { id: 'state_level_certificate', label: 'State Level Certificate' },
    { id: 'district_level_certificate', label: 'District Level Certificate' },
    { id: 'college_level_certificate', label: 'College Level Certificate' },
    { id: 'other_certificate', label: 'Other Certificate' }
  ];

  // Function to open certificate in full-screen preview
  const openCertificateFullscreen = (certificateId) => {
    if (certificateUrls[certificateId]) {
      const option = certificateOptions.find(opt => opt.id === certificateId);
      setFullscreenPreview({
        isOpen: true,
        certificateId,
        certificateUrl: certificateUrls[certificateId],
        certificateLabel: option ? option.label : 'Certificate'
      });
    }
  };

  // Function to close full-screen preview
  const closeFullscreenPreview = () => {
    setFullscreenPreview({
      isOpen: false,
      certificateId: null,
      certificateUrl: null,
      certificateLabel: null
    });
  };

  return (
    <>
      <div className="government-form-preview">
        {/* Official Header with Emblem */}
        <div className="official-header text-center py-4 border-bottom border-dark">
          <div className="d-flex justify-content-center mb-3">
            <div className="emblem me-3">
              <img src={Logo} alt="logo" className='img-fluid img-pdf-logo'></img>
            </div>
            <div className="text-start">
              <p className="mb-0">REGISTRATION FORM</p>
            </div>
          </div>
        </div>

        {/* Display already registered messages */}
        {alreadyRegisteredMessage && (
          <div className="alert alert-warning mb-3">
            {alreadyRegisteredMessage}
          </div>
        )}
        {phoneAlreadyRegisteredMessage && (
          <div className="alert alert-warning mb-3">
            {phoneAlreadyRegisteredMessage}
          </div>
        )}
        
        {isVerified && (
          <Alert variant="info" className="mb-3">
            <i className="bi bi-info-circle me-2"></i>
            You can save your registration from the previous preview page.
          </Alert>
        )}

        <div className="form-content p-4">
          {/* User Type Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 1: USER TYPE</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Type:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    <Badge bg="info">{formData.user_type === 'individual' ? 'Individual' : 'Organization'}</Badge>
                  </div>
                </div>
              </div>
              {formData.user_type === 'team' && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Team Name:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">{formData.team_name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 2: PROFILE INFORMATION</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Profile Image:</label>
                </div>
                <div className="col-md-9">
                  {formData.profile_image_preview ? (
                    <Image
                      src={formData.profile_image_preview}
                      alt="Profile Preview"
                      style={{ width: '100px', height: '120px', objectFit: 'cover', border: '1px solid #ccc' }}
                    />
                  ) : (
                    <div className="photo-placeholder d-inline-flex align-items-center justify-content-center bg-light" 
                         style={{ width: '100px', height: '120px', border: '1px solid #ccc' }}>
                      <i className="bi bi-person" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  )}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Full Name:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.full_name}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Gender:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.gender}</div>
                </div>
              </div>
              {formData.user_type === 'individual' && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Date of Birth:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">{formData.date_of_birth}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 3: CONTACT INFORMATION</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Email:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.email}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Phone:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.phone}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Address:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.address}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Location:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{`${formData.city}, ${formData.state}, ${formData.country}`}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Talent Scope Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 4: TALENT SCOPE</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Talents:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    {formData.talent_scope.map((talent, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-2 mb-2 p-2" style={{ fontWeight: 500 }}>
                        {talent}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 5: LINKS</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Social Media Links:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    {formData.social_media_links.map((link, index) => (
                      link && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Additional Links:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    {formData.additional_links.map((link, index) => (
                      link && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Portfolio Links:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    {formData.portfolio_links.map((link, index) => (
                      link && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 6: INTRODUCTION</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">About {formData.user_type === 'individual' ? 'You' : 'Your Organization'}:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.introduction}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Section */}
          <div className="form-section mb-4 certificates-section">
            <div className="section-header text-white p-2">
              <h5 className="mb-0">SECTION 7: CERTIFICATES</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              {formData.selected_certificates.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="30%">Certificate Type</th>
                        <th>Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.selected_certificates.map((certificateId, index) => {
                        const option = certificateOptions.find(opt => opt.id === certificateId);
                        
                        return (
                          <tr key={certificateId}>
                            <td>{option.label}</td>
                            <td>
                              <div 
                                className="certificate-preview-container d-inline-block"
                                onClick={() => openCertificateFullscreen(certificateId)}
                                title="Click to view in full screen"
                              >
                                {certificateUrls[certificateId] ? (
                                  certificateUrls[certificateId].startsWith('data:image/') ? (
                                    <div className="position-relative">
                                      <Image
                                        src={certificateUrls[certificateId]}
                                        alt={certificateId}
                                        className="certificate-preview-image border"
                                        style={{ 
                                          maxHeight: '120px', 
                                          maxWidth: '200px',
                                          objectFit: 'cover'
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="pdf-preview border p-3 d-inline-flex flex-column align-items-center">
                                      <i className="bi bi-file-earmark-pdf" style={{ fontSize: '2.5rem', color: '#dc3545' }}></i>
                                      <p className="mt-2 mb-0 small">PDF Certificate</p>
                                    </div>
                                  )
                                ) : (
                                  <div className="border p-3 d-inline-flex flex-column align-items-center">
                                    <i className="bi bi-file-earmark" style={{ fontSize: '2.5rem' }}></i>
                                    <p className="mt-2 mb-0 small">Certificate uploaded</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">No certificates selected</p>
              )}
            </div>
          </div>

          {/* Declaration Section */}
          <div className="form-section mb-4">
            <div className="section-header p-2">
              <h5 className="mb-0">DECLARATION</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <p>I hereby declare that the information furnished above is true to the best of my knowledge and belief.</p>
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="signature-box border p-2 text-center">
                    <p className="mb-0">Applicant's Signature</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="date-box border p-2 text-center">
                    <p className="mb-0">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Certificate Preview */}
      {fullscreenPreview.isOpen && (
        <div className="fullscreen-certificate-preview position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex flex-column z-index-9999">
          <div className="d-flex justify-content-between align-items-center p-3 bg-white">
            <h4 className="mb-0">{fullscreenPreview.certificateLabel}</h4>
            <div>
              <Button variant="outline-secondary" className="me-2" onClick={() => window.print()}>
                <i className="bi bi-printer me-1" /> Print
              </Button>
              <Button variant="outline-danger" onClick={closeFullscreenPreview}>
                <FaTimes /> Close
              </Button>
            </div>
          </div>
          <div className="flex-grow-1 d-flex justify-content-center align-items-center p-3 overflow-auto">
            {fullscreenPreview.certificateUrl.startsWith('data:image/') ? (
              <img 
                src={fullscreenPreview.certificateUrl} 
                alt={fullscreenPreview.certificateLabel}
                className="max-w-full max-h-full"
                style={{ objectFit: 'contain' }}
              />
            ) : fullscreenPreview.certificateUrl.startsWith('data:application/pdf') ? (
              <iframe 
                src={fullscreenPreview.certificateUrl} 
                className="w-100 h-100"
                title={fullscreenPreview.certificateLabel}
              />
            ) : (
              <div className="text-white ">
                <i className="bi bi-file-earmark" style={{ fontSize: '4rem' }}></i>
                <p className="mt-3">Certificate preview not available</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .government-form-preview {
          font-family: 'Times New Roman', serif;
          background-color: #f8f9fa;
          margin: 0 auto;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          .form-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .certificates-section {
            page-break-before: always;
            break-before: page;
          }
          
          .government-form-preview {
            box-shadow: none;
          }
        }
        
        .official-header {
          background-color: #f5f5f5;
        }
        
        .emblem {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .document-id {
          font-size: 0.9rem;
          color: #495057;
        }
        
        .img-pdf-logo {
          width: 30px;
          background-color: black;
          border-radius: 35px;
        }
        
        .form-section h5 {
          color: black;
          font-weight: 700;
        }
        
        .form-section {
          margin-bottom: 2rem;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .certificates-section {
          page-break-before: always;
          break-before: page;
        }
        
        .section-header {
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
        }
        
        .section-content {
          background-color: white;
          border-bottom-left-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
        
        .form-control-static {
          padding-top: 0.375rem;
          padding-bottom: 0.375rem;
          min-height: calc(1.5em + 0.75rem + 2px);
          border-bottom: 1px dotted #ced4da;
        }
        
        .certificate-preview-container {
          cursor: pointer;
        }
        
        .signature-box, .date-box {
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .official-footer {
          background-color: #f5f5f5;
          font-size: 0.85rem;
          color: #6c757d;
        }
        
        .fullscreen-certificate-preview {
          z-index: 9999;
        }
        
        .max-w-full {
          max-width: 100%;
        }
        
        .max-h-full {
          max-height: 100%;
        }
        
        .z-index-9999 {
          z-index: 9999;
        }
      `}</style>
    </>
  );
};

export default RegistrationPreview;