import React, { useState, useEffect } from 'react';
import EducationImage from "../../assets/images/education/campus-5.webp";

function AboutUs() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch about us data from API
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/aboutus-item/');
        const data = await response.json();
        
        console.log('About Us API Response:', data); // Debug log
        
        if (data.success && data.data.length > 0) {
          setAboutData(data.data[0]);
        } else {
          throw new Error('No about us data available');
        }
      } catch (err) {
        console.error('Error fetching about us data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load about us image, using fallback');
    setImageError(true);
  };

  // Extract timeline items from module array
  const getTimelineItems = () => {
    if (!aboutData || !aboutData.module) return [];
    
    return aboutData.module.filter(item => {
      // Filter out mission and vision items, and items with empty descriptions
      return item.title && 
             item.description && 
             !item.title.toLowerCase().includes('mission') && 
             !item.title.toLowerCase().includes('vision') &&
             !isNaN(item.title) || // Keep numeric years
             (item.title.length <= 4 && /^\d+$/.test(item.title)); // Keep 4-digit years
    });
  };

  // Extract mission and vision from module array
  const getMissionVision = () => {
    if (!aboutData || !aboutData.module) return { mission: null, vision: null };
    
    const mission = aboutData.module.find(item => 
      item.title.toLowerCase().includes('mission')
    );
    
    const vision = aboutData.module.find(item => 
      item.title.toLowerCase().includes('vision')
    );
    
    return { mission, vision };
  };

  // Construct image URL
  const getImageUrl = () => {
    if (!aboutData || !aboutData.image) return EducationImage;
    
    if (aboutData.image.startsWith('http')) {
      return aboutData.image;
    } else {
      const imagePath = aboutData.image.startsWith('/') ? 
        aboutData.image.substring(1) : aboutData.image;
      return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${imagePath}`;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning m-3" role="alert">
        Error loading about us information: {error}. Using default content.
      </div>
    );
  }

  const timelineItems = getTimelineItems();
  const { mission, vision } = getMissionVision();
  const imageUrl = getImageUrl();

  return (
    <div>
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h3>Our Story</h3>
                <h2>{aboutData ? aboutData.title : "Educating Minds, Inspiring Hearts"}</h2>
                <p>
                  {aboutData ? 
                    aboutData.description : 
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae odio ac nisi tristique venenatis. Nullam feugiat ipsum vitae justo finibus, in sagittis dolor malesuada. Aenean vel fringilla est, a vulputate massa."
                  }
                </p>

                <div className="timeline">
                  {timelineItems.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-image" data-aos="zoom-in" data-aos-delay="300">
                <img 
                  src={imageError ? EducationImage : imageUrl} 
                  className="img-fluid" 
                  alt="About Us Image"
                  onError={handleImageError}
                />

                <div className="mission-vision" data-aos="fade-up" data-aos-delay="400">
                  <div className="mission">
                    <h3>{mission ? mission.title : "Our Mission"}</h3>
                    <p>{mission ? mission.description : "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula."}</p>
                  </div>

                  <div className="vision">
                    <h3>{vision ? vision.title : "Our Vision"}</h3>
                    <p>{vision ? vision.description : "Nulla porttitor accumsan tincidunt. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Cras ultricies ligula sed magna dictum porta."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-lg-12">
              <div className="core-values" data-aos="fade-up" data-aos-delay="500">
                <h3 className="text-center mb-4">Core Values</h3>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                  <div className="col">
                    <div className="value-card">
                      <div className="value-icon">
                        <i className="bi bi-book"></i>
                      </div>
                      <h4>Academic Excellence</h4>
                      <p>Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.</p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="value-card">
                      <div className="value-icon">
                        <i className="bi bi-people"></i>
                      </div>
                      <h4>Community Engagement</h4>
                      <p>Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.</p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="value-card">
                      <div className="value-icon">
                        <i className="bi bi-lightbulb"></i>
                      </div>
                      <h4>Innovation</h4>
                      <p>Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem.</p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="value-card">
                      <div className="value-icon">
                        <i className="bi bi-globe"></i>
                      </div>
                      <h4>Global Perspective</h4>
                      <p>Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;