import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "../src/custom/style.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// import { AuthProvider } from "./context/AuthContext";


import Home from "./componets/pages/Home";
import Footer from "./componets/footer/Footer";
import NavBar from "./componets/navbar/NavBar";
// import NavBar from "./componets/topnav/NavBar";
// import Footer from "./componets/footer/Footer";
// import Dashboard from "./componets/dash_board/Dashboard";

function App() {
  const location = useLocation();

  const hiddenPaths = new Set([""]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  
  return (
    
      <div className="app-container">
        {!shouldHideNavbar && <NavBar />}
        
        <main className="main-content">
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Home />} />
            
          
          </Routes>
        </main>
        
        <Footer />
      </div>
 
  );
}

export default App;