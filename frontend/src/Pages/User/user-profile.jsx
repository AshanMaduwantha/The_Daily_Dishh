import React from "react";
import { useSelector } from "react-redux";
import UserImage from "../../assets/user.jpeg";

function UserProfile() {
  const user = useSelector((state) => state.user.user);
  
  return (
    <div className="text-center">
      <div className="position-relative mb-4">
        <img
          className="rounded-circle shadow-sm border border-2 border-light"
          src={user?.profileImage ? user.profileImage : UserImage}
          alt="Profile"
          style={{ width: "120px", height: "120px", objectFit: "cover" }}
        />
      </div>
      
      <h4 className="fw-bold mb-1">{user?.username}</h4>
      
      <div className="text-muted mb-3">
        <p className="mb-1">
          <i className="bi bi-envelope me-2"></i>
          {user?.email}
        </p>
        {user?.contactNumber && (
          <p className="mb-0">
            <i className="bi bi-telephone me-2"></i>
            {user?.contactNumber}
          </p>
        )}
      </div>
      
      <hr className="my-4" />
      
      <div className="d-grid gap-2">
        <button className="btn btn-outline-primary">Edit Profile</button>
      </div>
    </div>
  );
}

export default UserProfile;