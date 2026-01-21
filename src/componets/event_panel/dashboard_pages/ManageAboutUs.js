import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { FaPlus, FaTrash } from "react-icons/fa";

const ManageAboutUs = () => {
  const { auth, logout, refreshAccessToken } = useAuth();
  const admin_id = auth?.unique_id;

  console.log("Admin ID:", admin_id);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Form state for About Us
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    image: null,
    modules: [{ content: "", description: "" }], // Initialize with one empty module object
  });

  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // State for description validation error
  const [descriptionError, setDescriptionError] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  // Fetch About Us data on component mount
  useEffect(() => {
    fetchAboutUsData();
  }, []);

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch About Us data from API
  const fetchAboutUsData = async () => {
    setIsLoading(true);
    try {
      // Simple GET request without credentials
      const response = await fetch(
        "https://mahadevaaya.com/trilokayurveda/trilokabackend/api/aboutus-item/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch About Us data");
      }

      const result = await response.json();
      console.log("GET API Response:", result); // Log the response

      if (result.success && result.data.length > 0) {
        const aboutData = result.data[0]; // Get the first item

        // Check if modules is an array of objects or strings
        let modulesData = [];
        if (aboutData.module && Array.isArray(aboutData.module)) {
          if (
            aboutData.module.length > 0 &&
            typeof aboutData.module[0] === "object"
          ) {
            modulesData = [...aboutData.module];
          } else if (
            aboutData.module.length > 0 &&
            typeof aboutData.module[0] === "string"
          ) {
            // Convert strings to objects
            modulesData = aboutData.module.map((item) => ({
              content: item,
              description: "",
            }));
          } else {
            modulesData = [{ content: "", description: "" }];
          }
        } else {
          modulesData = [{ content: "", description: "" }];
        }

        setFormData({
          id: aboutData.id,
          title: aboutData.title,
          description: aboutData.description,
          image: null, // We don't have the actual file, just the URL
          modules: modulesData,
        });

        // Set existing image URL for preview - use the full URL
        setExistingImage(aboutData.image);
      } else {
        throw new Error("No About Us data found");
      }
    } catch (error) {
      console.error("Error fetching About Us data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      // Handle file input for image
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create a preview URL for selected image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      // Handle text inputs
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate description length
      if (name === "description") {
        const wordCount = value.trim().split(/\s+/).length;
        if (value.trim() === "") {
          setDescriptionError("Description is required.");
        } else if (wordCount <= 5) {
          setDescriptionError(
            `Description must be more than 05 words. You have entered ${wordCount} words.`
          );
        } else {
          setDescriptionError(""); // Clear error if valid
        }
      }
    }
  };

  // Handle module changes
  const handleModuleChange = (index, field, value) => {
    setFormData((prev) => {
      const newModules = [...prev.modules];
      // Ensure the module at index exists and is an object
      if (!newModules[index] || typeof newModules[index] !== "object") {
        newModules[index] = { content: "", description: "" };
      }
      // Update the specific field
      newModules[index] = {
        ...newModules[index],
        [field]: value,
      };

      return {
        ...prev,
        modules: newModules,
      };
    });
  };

  // Add a new module
  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { content: "", description: "" }],
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  // Reset form to original data
  const resetForm = () => {
    fetchAboutUsData();
    setImagePreview(null);
    setIsEditing(false);
    setDescriptionError("");
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault(); // Prevent form submission
    setIsEditing(true);
    setShowAlert(false); // Hide any existing alerts when entering edit mode
  };

  // Handle form submission (PUT request)
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
      // Prepare the data for submission
      const payload = {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        module: formData.modules,
      };

      console.log("Submitting data:", payload); // Log the data being submitted

      // If we have a new image, we need to handle it differently
      if (formData.image) {
        // For file uploads, we need FormData
        const dataToSend = new FormData();
        dataToSend.append("id", formData.id);
        dataToSend.append("title", formData.title);
        dataToSend.append("description", formData.description);
        dataToSend.append("image", formData.image, formData.image.name);
        dataToSend.append("module", JSON.stringify(formData.modules));

        console.log("FormData content:");
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        // Use fetch directly for FormData so the browser sets Content-Type automatically.
        // Also handle 401 by refreshing the access token and retrying once.
        const url =
          "https://mahadevaaya.com/trilokayurveda/trilokabackend/api/aboutus-item/";
        let response = await fetch(url, {
          method: "PUT",
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
            method: "PUT",
            body: dataToSend,
            headers: {
              Authorization: `Bearer ${newAccess}`,
            },
          });
        }

        console.log("PUT Response status:", response.status);

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
          throw new Error(
            (errorData && errorData.message) ||
              "Failed to update about us content"
          );
        }

        // SUCCESS PATH
        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("About Us content updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);

          // Update existing image if a new one was uploaded
          if (formData.image) {
            const updatedImage =
              result && result.data
                ? Array.isArray(result.data)
                  ? result.data[0] && result.data[0].image
                  : result.data.image
                : null;
            if (updatedImage) {
              setExistingImage(updatedImage);
            }
            setImagePreview(null);
            // Clear selected file so subsequent saves without a new file use JSON path
            setFormData((prev) => ({ ...prev, image: null }));
          }

          // Hide success alert after 3 seconds
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update about us content"
          );
        }
      } else {
        // For updates without a new image, use JSON
        const response = await authFetch(
          "https://mahadevaaya.com/trilokayurveda/trilokabackend/api/aboutus-item/",
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        console.log("PUT Response status:", response.status);

        // Handle bad API responses
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
          throw new Error(
            errorData.message || "Failed to update about us content"
          );
        }

        // SUCCESS PATH
        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("About Us content updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);

          // Hide success alert after 3 seconds
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update about us content"
          );
        }
      }
    } catch (error) {
      // FAILURE PATH
      console.error("Error updating about us content:", error);
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
            <h1 className="page-title">Manage About Us Content</h1>

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
                <p className="mt-2">Loading About Us content...</p>
              </div>
            ) : (
              <>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={!isEditing}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Description (must be more than 10 words)
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      isInvalid={!!descriptionError}
                      disabled={!isEditing}
                    />
                    <Form.Control.Feedback type="invalid">
                      {descriptionError}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Image</Form.Label>
                    {isEditing ? (
                      <>
                        <Form.Control
                          type="file"
                          name="image"
                          onChange={handleChange}
                          accept="image/*"
                        />
                        {imagePreview ? (
                          <div className="mt-3">
                            <p>New Image Preview:</p>
                            <img
                              src={imagePreview}
                              alt="Image Preview"
                              className="img-wrapper"
                             
                            />
                          </div>
                        ) : (
                          existingImage && (
                            <div className="mt-3">
                              <p>Current Image:</p>
                              <img
                                src={`https://mahadevaaya.com/trilokayurveda/trilokabackend${existingImage}`}
                                alt="Current About Us"
                                className="img-wrapper"
                               
                              />
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      existingImage && (
                        <div className="mt-3">
                          <img
                            src={`https://mahadevaaya.com/trilokayurveda/trilokabackend${existingImage}`}
                            alt="Current About Us"
                            className="img-wrapper"
              
                          />
                        </div>
                      )
                    )}
                  </Form.Group>

                  {/* Modules Section */}
                  <Form.Group className="mb-3">
                    <Form.Label>Modules</Form.Label>

                    <div className="modules-container">
                      {formData.modules.map((module, index) => (
                        <div
                          key={index}
                          className="module-item mb-3 p-3 border rounded"
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5>Module {index + 1}</h5>

                            {isEditing && formData.modules.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeModule(index)}
                              >
                                <FaTrash /> Remove
                              </Button>
                            )}
                          </div>

                          {/* Module Content */}
                          <Form.Group className="mb-2">
                            <Form.Label>Module Content</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder={`Enter module ${index + 1} title`}
                              value={module.content || ""}
                              onChange={(e) =>
                                handleModuleChange(
                                  index,
                                  "content",
                                  e.target.value
                                )
                              }
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          {/* Module Description */}
                          <Form.Group className="mb-2">
                            <Form.Label>Module Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder={`Enter module ${
                                index + 1
                              } description`}
                              value={module.description || ""}
                              onChange={(e) =>
                                handleModuleChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </div>
                      ))}

                      {isEditing && (
                        <Button
                          variant="outline-primary"
                          onClick={addModule}
                          className="mt-2"
                        >
                          <FaPlus /> Add Another Module
                        </Button>
                      )}
                    </div>
                  </Form.Group>

                  {/* Buttons are now outside the form */}
                </Form>

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
                    <Button
                      variant="primary"
                      onClick={enableEditing}
                      type="button"
                    >
                      Edit About Us
                    </Button>
                  )}
                </div>
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default ManageAboutUs;
