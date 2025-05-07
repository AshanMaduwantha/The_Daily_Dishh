import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../app/actions/user.actions";
import UserImage from "../../assets/user.jpeg";
import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

function NewUsersSuggest() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllUsers())
      .finally(() => setIsLoading(false));
  }, [dispatch]);
  
  useEffect(() => {
    setUsersList(user.users);
  }, [user.users]);

  const refreshSuggestions = () => {
    setIsLoading(true);
    dispatch(getAllUsers())
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="user-suggestions-container mb-4 mt-5">
      <div className="card border-0 suggestion-card">
        {/* Modern Card Header */}
        <div className="card-header border-0 bg-white pb-0">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="card-title m-0 suggest-title">
              <span className="title-icon me-2">👋</span>
              Discover People
            </h5>
            <Link to="/explore/people" className="btn btn-sm text-primary px-0">
              See all
            </Link>
          </div>
          <div className="header-line"></div>
        </div>
        
        {/* Card Body */}
        <div className="card-body pt-0">
          {!isLoading && usersList && usersList.length > 0 ? (
            <div className="suggestions-list">
              {[...usersList]
                .reverse()
                .slice(-5)
                .map((userItem) => (
                  <div key={userItem.id} className="user-item">
                    <div className="d-flex align-items-center">
                      <Link
                        className="d-flex align-items-center text-decoration-none text-dark flex-grow-1"
                        to={`/user/${userItem.id}`}
                      >
                        <div className="profile-pic-wrapper">
                          <img
                            src={userItem.profileImage || UserImage}
                            className="profile-pic"
                            alt={`${userItem.username}`}
                          />
                          {userItem.isOnline && <span className="online-status"></span>}
                        </div>
                        <div className="ms-3 user-info">
                          <p className="username mb-0">{userItem.username}</p>
                          {userItem.fullName && (
                            <p className="fullname text-muted mb-0">{userItem.fullName}</p>
                          )}
                        </div>
                      </Link>
                      <div className="ms-auto">
                        <FollowButton userDetails={userItem} fetchType="SUGGESTION" className="modern-follow-btn" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4 loading-container">
              {isLoading ? (
                <>
                  <div className="spinner-grow spinner-grow-sm text-primary mx-1" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow spinner-grow-sm text-primary mx-1" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow spinner-grow-sm text-primary mx-1" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2 mb-0">Finding people for you...</p>
                </>
              ) : (
                <>
                  <div className="empty-suggestions mb-2">🔍</div>
                  <p className="text-muted">No suggestions available</p>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Card Footer */}
        <div className="card-footer bg-white border-0 text-center">
          <button 
            className="btn btn-sm btn-light-refresh"
            onClick={refreshSuggestions}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Custom CSS */}
      <style jsx>{`
        .user-suggestions-container {
          max-width: 100%;
        }
        
        .suggestion-card {
          border-radius: 16px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .suggestion-card:hover {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        
        .suggest-title {
          font-weight: 600;
          color: #333;
          letter-spacing: -0.3px;
          font-size: 1.1rem;
        }
        
        .title-icon {
          font-size: 1.25rem;
        }
        
        .header-line {
          height: 3px;
          background: linear-gradient(to right, #fd7e14, #fd7e14);
          border-radius: 3px;
          margin-top: 4px;
        }
        
        .suggestions-list {
          margin-top: 10px;
        }
        
        .user-item {
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        
        .user-item:last-child {
          border-bottom: none;
        }
        
        .user-item:hover {
          background-color: rgba(0, 0, 0, 0.01);
          transform: translateX(3px);
        }
        
        .profile-pic-wrapper {
          position: relative;
          margin-right: 2px;
        }
        
        .profile-pic {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        .online-status {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          background-color: #4caf50;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        
        .username {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 2px;
          color: #333;
        }
        
        .fullname {
          font-size: 0.8rem;
          color: #666;
        }
        
        .btn-light-refresh {
        border-radius: 50px;
        padding: 6px 16px;
        font-size: 0.85rem;
        font-weight: 500;
        color: #fd7e14;
        background-color: rgba(253, 126, 20, 0.1);
        border: none;
        transition: all 0.2s ease;
        }

        .btn-light-refresh:hover {
        background-color: rgba(253, 126, 20, 0.2);
        color: #fd7e14;
        transform: translateY(-1px);
        }

        
        .btn-light-refresh:active {
          transform: translateY(0);
        }
        
        .loading-container {
          padding: 20px 0;
        }
        
        .empty-suggestions {
          font-size: 2rem;
          opacity: 0.5;
        }
        
        /* Override for the follow button to match the modern design */
        :global(.modern-follow-btn) {
          border-radius: 50px !important;
          padding: 4px 14px !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        
        :global(.modern-follow-btn.following) {
          background-color: rgba(0, 0, 0, 0.05) !important;
          color: #333 !important;
        }
        
        :global(.modern-follow-btn:not(.following)) {
          background-color: rgba(92, 107, 192, 0.1) !important;
          color: #3f51b5 !important;
        }
        
        :global(.modern-follow-btn:hover) {
          transform: translateY(-1px) !important;
        }
      `}</style>
    </div>
  );
}

export default NewUsersSuggest;