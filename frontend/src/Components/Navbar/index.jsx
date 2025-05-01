import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { getUser } from "../../app/actions/user.actions";
import { logout } from "../../app/slices/user.slice";
import Profile from "../../Pages/Profile";
import NotificationDropdown from "../NotificationDropdown";
import UserImage from "../../assets/user.jpeg";

Modal.setAppElement("div");

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  
  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  useEffect(() => {
    if (
      sessionStorage.getItem("Authorization") &&
      sessionStorage.getItem("userId")
    ) {
      if (!user.loginStatus) {
        dispatch(getUser(sessionStorage.getItem("userId")));
      }
    }

    if (currentPath !== "/signup" && !sessionStorage.getItem("Authorization")) {
      navigate("/login");
    }
  }, [dispatch, user.loginStatus, navigate]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3">
        <div className="container">
          {/* Logo and Brand */}
          <Link to="/" className="navbar-brand">
            <span className="fw-bold fs-3" style={{ letterSpacing: "0.5px" }}>
              Daily<span style={{ color: "#fd7e14" }}>Dish</span>
            </span>
          </Link>

          {/* Hamburger Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Content */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Search Bar */}
            <div className="d-flex mx-auto my-2 my-lg-0 position-relative" style={{ maxWidth: "550px", width: "100%" }}>
              <div className="input-group w-100">
                <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#fd7e14"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search recipes, dishes, ingredients..."
                  aria-label="Search"
                  style={{ borderTopRightRadius: "20px", borderBottomRightRadius: "20px" }}
                />
                <button className="btn btn-warning position-absolute end-0 d-none d-md-block" 
                  style={{ 
                    borderTopRightRadius: "20px", 
                    borderBottomRightRadius: "20px",
                    backgroundColor: "#fd7e14",
                    color: "white",
                    zIndex: "5",
                    padding: "0.375rem 1rem"
                  }}>
                  Search
                </button>
              </div>
            </div>

            {/* Nav Items */}
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              {!user.loginStatus && (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link text-dark me-2">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/signup"
                      className="btn btn-warning text-white rounded-pill px-4"
                      style={{ backgroundColor: "#fd7e14" }}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}

              {user.loginStatus && (
                <>
                  <li className="nav-item">
                    <Link to="/" className="nav-link text-dark">
                      Feed
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/user" className="nav-link text-dark">
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <div className="nav-link">
                      <NotificationDropdown />
                    </div>
                  </li>
                  <li className="nav-item">
                    <div
                      onClick={openModal}
                      className="d-flex align-items-center cursor-pointer nav-link"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="position-relative">
                        <img
                          src={user?.user?.profileImage || UserImage}
                          className="rounded-circle"
                          alt="Profile"
                          width="32"
                          height="32"
                          style={{ objectFit: "cover", border: "2px solid #fd7e14" }}
                        />
                      </div>
                      <span className="ms-2 fw-medium">{user?.user?.username}</span>
                    </div>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={() => dispatch(logout())}
                      className="btn btn-outline-danger btn-sm rounded-pill ms-2"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-dialog modal-lg mx-auto mt-5"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1050
          },
          content: {
            position: "relative",
            border: "none",
            background: "transparent",
            overflow: "visible",
            borderRadius: 0,
            outline: 0,
            padding: 0
          }
        }}
      >
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Your Profile</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <Profile closeModal={closeModal} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Navbar;