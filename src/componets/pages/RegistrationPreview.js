// src/components/RegistrationPreview.js
import React, { useState } from 'react';
import { Image, Badge, Button } from 'react-bootstrap';
import { FaPrint, FaTimes } from 'react-icons/fa';
import '../../assets/css/registration.css';

const RegistrationPreview = ({ formData, certificateUrls, alreadyRegisteredMessage, phoneAlreadyRegisteredMessage }) => {
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

  // Function to handle opening the print preview in a new tab
  const handlePrintPreview = () => {
    // Get the current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create the HTML content for printing
    const printContent = `
      <html>
        <head>
          <title>Registration Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              padding: 8px 50px 50px 50px;
              line-height: 1.6;
            }

            .print-header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #dee2e6;
              padding-bottom: 15px;
            }
            
            .print-date {
              font-style: italic;
              flex: 1;
            }
            
            .print-header {
              text-align: center;
              flex: 1;
            }
            
            .print-title {
              font-weight: bold;
              font-size: 22px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            
            .print-subtitle {
              font-size: 16px;
              color: #6c757d;
            }
            
            .print-button-container {
              flex: 1;
              text-align: right;
            }
            
            .print-button {
             background-color: #007bff;
              color: white;
              font-size: 12px;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              transition: background-color 0.3s;
            }
            
            .print-button:hover {
              background-color: #0056b3;
            }
            
            .section-header {
              background-color: #f8f9fa !important;
              font-weight: bold !important;
            
              text-transform: uppercase;
              font-size: 0.9rem;
            }
            
            .table {
              border: 2px solid #dee2e6;
              margin-bottom: 20px;
            }
            
            .table td {
              padding: 12px;
              vertical-align: middle;
              border: 1px solid #dee2e6;
            }
            
            .certificate-preview-image {
              max-width: 130px;
              height: 130px;
              object-fit: cover;
            }
            
            .pdf-preview {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 10px;
              border: 1px solid #dee2e6;
              border-radius: 4px;
            }
            
            .badge.t-style {
              background-color: #e9ecef !important;
              color: #000 !important;
              font-weight: 500 !important;
            }
            
            @media print {
              .print-button-container {
                display: none !important;
              }
              .print-header-container {
                display: block;
                text-align: center;
              }
              .print-date {
                text-align: right;
                margin-bottom: 10px;
              }
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header-container">
            <div class="print-date">Printed on: ${currentDate}</div>
            <div class="print-header">
              <div class="print-title">Registration Preview</div>
              <div class="print-subtitle">${formData.user_type === 'individual' ? 'Individual' : 'Organization'} Registration Details</div>
            </div>
            <div class="print-button-container">
              <button class="print-button" onclick="window.print()">
                <i class="bi bi-printer-fill me-2"></i>Print
              </button>
            </div>
          </div>
          
          <table class="table table-bordered">
            <tbody>
              <!-- User Type Section -->
              <tr class="section-header">
                <td colspan="2">User Type</td>
              </tr>
              <tr>
                <td width="30%" style="font-weight: bold;">Type:</td>
                <td>${formData.user_type}</td>
              </tr>
               ${formData.user_type === 'team' ? `
              <tr>
                <td style="font-weight: bold;">Team Name:</td>
                <td>${formData.team_name}</td>
              </tr>
              ` : ''}

              <!-- Profile Information Section -->
              <tr class="section-header">
                <td colspan="2">Profile Information</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Profile Image:</td>
                <td>
                  ${formData.profile_image_preview ? 
                    `<img src="${formData.profile_image_preview}" alt="Profile" class="rounded-circle certificate-preview-image">` : 
                    '<div class="d-inline-block  bg-light rounded-circle" style="width: 100px; height: 100px; line-height: 100px;"><i class="bi bi-person" style="font-size: 2.5rem;"></i></div>'
                  }
                </td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Full Name:</td>
                <td>${formData.full_name}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Gender:</td>
                <td>${formData.gender}</td>
              </tr>
              ${formData.user_type === 'individual' ? `
              <tr>
                <td style="font-weight: bold;">Date of Birth:</td>
                <td>${formData.date_of_birth}</td>
              </tr>
              ` : ''}

              <!-- Contact Information Section -->
              <tr class="section-header">
                <td colspan="2">Contact Information</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Email:</td>
                <td>${formData.email}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Phone:</td>
                <td>${formData.phone}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Address:</td>
                <td>${formData.address}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Location:</td>
                <td>${formData.city}, ${formData.state}, ${formData.country}</td>
              </tr>

              <!-- Talent Scope Section -->
              <tr class="section-header">
                <td colspan="2">Talent Scope</td>
              </tr>
              <tr>
                <td style="font-weight: bold; vertical-align: top;">Talents:</td>
                <td>
                  ${formData.talent_scope.map(talent => `<span class="badge t-style me-2 mb-2 p-2">${talent}</span>`).join('')}
                </td>
              </tr>

              <!-- Links Section -->
              <tr class="section-header">
                <td colspan="2">Links</td>
              </tr>
              <tr>
                <td style="font-weight: bold; vertical-align: top;">Social Media Links:</td>
                <td>
                  ${formData.social_media_links.filter(link => link).map(link => 
                    `<p class="small mb-1">${link}</p>`
                  ).join('')}
                </td>
              </tr>
              <tr>
                <td style="font-weight: bold; vertical-align: top;">Additional Links:</td>
                <td>
                  ${formData.additional_links.filter(link => link).map(link => 
                    `<p class="small mb-1">${link}</p>`
                  ).join('')}
                </td>
              </tr>
              <tr>
                <td style="font-weight: bold; vertical-align: top;">Portfolio Links:</td>
                <td>
                  ${formData.portfolio_links.filter(link => link).map(link => 
                    `<p class="small mb-1">${link}</p>`
                  ).join('')}
                </td>
              </tr>

              <!-- Introduction Section -->
              <tr class="section-header">
                <td colspan="2">Introduction</td>
              </tr>
              <tr>
                <td style="font-weight: bold; vertical-align: top;">About ${formData.user_type === 'individual' ? 'You' : 'Your Organization'}:</td>
                <td>${formData.introduction}</td>
              </tr>

              <!-- Certificates Section -->
              <tr class="section-header">
                <td colspan="2">Certificates</td>
              </tr>
              <tr>
                <td colspan="2">
                  ${formData.selected_certificates.length > 0 ? `
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th width="30%">Certificate Type</th>
                          <th>Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${formData.selected_certificates.map(certificateId => {
                          const option = certificateOptions.find(opt => opt.id === certificateId);
                          return `
                            <tr>
                              <td>${option.label}</td>
                              <td>
                                ${certificateUrls[certificateId] ? 
                                  (certificateUrls[certificateId].startsWith('data:image/') ? 
                                    `<img src="${certificateUrls[certificateId]}" alt="${certificateId}" class="certificate-preview-image border rounded">` :
                                    `<div class="pdf-preview">
                                      <i class="bi bi-file-earmark-pdf" style="font-size: 2.5rem; color: #dc3545;"></i>
                                      <p class="mt-2 mb-0 small">PDF Certificate</p>
                                    </div>`
                                  ) : 
                                  '<div class=" p-3"><i class="bi bi-file-earmark" style="font-size: 2.5rem;"></i><p class="mt-2 mb-0 small">Certificate uploaded</p></div>'
                                }
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  ` : '<p>No certificates selected</p>'}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class=" mt-4">
            <p class="small text-muted">This is a computer-generated document and does not require a signature.</p>
          </div>
        </body>
      </html>
    `;
    
    // Create a new window for the print preview
    const printWindow = window.open('', '_blank');
    
    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <>
      <div className="registration-preview-container p-3">
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
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Registration Preview</h4>
          <Button variant="primary" onClick={handlePrintPreview} className="no-print">
            <FaPrint className="me-2" />
            Print Preview
          </Button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered form-preview-table">
            <tbody>
              {/* User Type Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">User Type</td>
              </tr>
               <tr>
                 <td width="30%" className="font-weight-bold">Type:</td>
                 <td>
                   <Badge bg="info">{formData.user_type === 'individual' ? 'Individual' : 'Organization'}</Badge>
                 </td>
               </tr>
               {formData.user_type === 'team' && (
                 <tr>
                   <td className="font-weight-bold">Team Name:</td>
                   <td>{formData.team_name}</td>
                 </tr>
               )}

              {/* Profile Information Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">Profile Information</td>
              </tr>
              <tr>
                <td className="font-weight-bold">Profile Image:</td>
                <td>
                  {formData.profile_image_preview ? (
                    <Image
                      src={formData.profile_image_preview}
                      alt="Profile Preview"
                      roundedCircle
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="profile-placeholder d-inline-flex align-items-center justify-content-center bg-light rounded-circle" 
                         style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-person" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-weight-bold">Full Name:</td>
                <td>{formData.full_name}</td>
              </tr>
              <tr>
                <td className="font-weight-bold">Gender:</td>
                <td>{formData.gender}</td>
              </tr>
              {formData.user_type === 'individual' && (
                <tr>
                  <td className="font-weight-bold">Date of Birth:</td>
                  <td>{formData.date_of_birth}</td>
                </tr>
              )}

              {/* Contact Information Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">Contact Information</td>
              </tr>
              <tr>
                <td className="font-weight-bold">Email:</td>
                <td>{formData.email}</td>
              </tr>
              <tr>
                <td className="font-weight-bold">Phone:</td>
                <td>{formData.phone}</td>
              </tr>
              <tr>
                <td className="font-weight-bold">Address:</td>
                <td>{formData.address}</td>
              </tr>
              <tr>
                <td className="font-weight-bold">Location:</td>
                <td>{`${formData.city}, ${formData.state}, ${formData.country}`}</td>
              </tr>

              {/* Talent Scope Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">Talent Scope</td>
              </tr>
              <tr>
                <td className="font-weight-bold align-top">Talents:</td>
                <td>
                  <div className="d-flex flex-wrap">
                    {formData.talent_scope.map((talent, index) => (
                      <Badge key={index} bg="light" text="dark" className="ms-2 mb-2 p-2" style={{ fontWeight: 500 }}>
                        {talent}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Links Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">Links</td>
              </tr>
              <tr>
                <td className="font-weight-bold align-top">Social Media Links:</td>
                <td>
                  {formData.social_media_links.map((link, index) => (
                    link && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="font-weight-bold align-top">Additional Links:</td>
                <td>
                  {formData.additional_links.map((link, index) => (
                    link && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="font-weight-bold align-top">Portfolio Links:</td>
                <td>
                  {formData.portfolio_links.map((link, index) => (
                    link && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                  ))}
                </td>
              </tr>

              {/* Introduction Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">Introduction</td>
              </tr>
              <tr>
                <td className="font-weight-bold align-top">About {formData.user_type === 'individual' ? 'You' : 'Your Organization'}:</td>
                <td>{formData.introduction}</td>
              </tr>

              {/* Certificates Section */}
              <tr className="section-header">
                <td colSpan="2" className=" bg-light font-weight-bold">Certificates</td>
              </tr>
              <tr>
                <td colSpan="2">
                  {formData.selected_certificates.length > 0 ? (
                    <table className="table table-sm">
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
                                  className="certificate-preview-container cursor-pointer d-inline-block"
                                  onClick={() => openCertificateFullscreen(certificateId)}
                                  title="Click to view in full screen"
                                >
                                  {certificateUrls[certificateId] ? (
                                    certificateUrls[certificateId].startsWith('data:image/') ? (
                                      <div className="position-relative">
                                        <Image
                                          src={certificateUrls[certificateId]}
                                          alt={certificateId}
                                          className="certificate-preview-image border rounded"
                                          style={{ 
                                            maxHeight: '120px', 
                                            maxWidth: '200px',
                                            objectFit: 'cover',
                                            transition: 'transform 0.2s',
                                            cursor: 'pointer'
                                          }}
                                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                        <div className="certificate-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-opacity">
                                          <div className="bg-dark bg-opacity-75 text-white p-2 rounded ">
                                            <i className="bi bi-eye-fill d-block mb-1"></i>
                                            <small>View Full Screen</small>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="pdf-preview border rounded p-3 d-inline-flex flex-column align-items-center" 
                                           style={{ 
                                             cursor: 'pointer',
                                             transition: 'transform 0.2s'
                                           }}
                                           onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                           onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <i className="bi bi-file-earmark-pdf" style={{ fontSize: '2.5rem', color: '#dc3545' }}></i>
                                        <p className="mt-2 mb-0 small">PDF Certificate</p>
                                        <small className="">Click to view full screen</small>
                                      </div>
                                    )
                                  ) : (
                                    <div className="border rounded p-3 d-inline-flex flex-column align-items-center">
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
                  ) : (
                    <p className="">No certificates selected</p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <style jsx>{`
          .form-preview-header {
            border-bottom: 2px solid #dee2e6;
            padding-bottom: 15px;
          }
          
          .form-title {
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .form-subtitle {
            font-size: 0.9rem;
            color: #6c757d;
          }
          
          .form-preview-table {
            border: 2px solid #dee2e6;
          }
          
          .form-preview-table td {
            padding: 12px;
            vertical-align: middle;
          }
          
          .section-header td {
            font-weight: bold;
            padding: 8px;
            text-transform: uppercase;
            font-size: 0.9rem;
          }
          
          .certificate-overlay {
            pointer-events: none;
          }
          
          .hover-opacity-100:hover {
            opacity: 1 !important;
          }
          
          .transition-opacity {
            transition: opacity 0.2s ease-in-out;
          }
          
          .cursor-pointer {
            cursor: pointer;
          }
          
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>

      {/* Full-screen Certificate Preview */}
      {fullscreenPreview.isOpen && (
        <div className="fullscreen-certificate-preview position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex flex-column z-index-9999">
          <div className="d-flex justify-content-between align-items-center p-3 bg-white">
            <h4 className="mb-0">{fullscreenPreview.certificateLabel}</h4>
            <div>
              <Button variant="outline-secondary" className="me-2" onClick={() => window.print()}>
                <FaPrint className="me-1" /> Print
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