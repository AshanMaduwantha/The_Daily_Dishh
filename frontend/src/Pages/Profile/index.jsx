import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, updateUserById, deleteUserById } from "../../app/actions/user.actions";
import storage from "../../util/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify"; // Assuming you have react-toastify installed

function Profile({ closeModal }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const brandColor = "#fd7e14"; // For consistency with navbar

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    contactNumber: "",
    country: "",
    profileImage: ""
  });
  
  // Loading state for file upload
  const [isUploading, setIsUploading] = useState(false);
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      dispatch(getUser(user.userId));
    }
  }, [dispatch, user?.userId]);

  useEffect(() => {
    if (user?.user) {
      setFormData({
        username: user.user.username || "",
        email: user.user.email || "",
        contactNumber: user.user.contactNumber || "",
        country: user.user.country || "",
        profileImage: user.user.profileImage || ""
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userUpdate = {
        id: user.user.id,
        ...formData
      };

      await dispatch(updateUserById(userUpdate));
      toast.success("Profile updated successfully!");
      closeModal();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await dispatch(deleteUserById(user.userId));
        toast.info("Your account has been deleted.");
        closeModal();
      } catch (error) {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should not exceed 2MB");
      return;
    }

    setIsUploading(true);
    
    // Create a unique filename using timestamp
    const timestamp = new Date().getTime();
    const fileName = `${user.userId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `/users/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // If needed, add progress tracking here
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        setIsUploading(false);
        toast.error("Failed to upload image. Please try again.");
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setFormData(prev => ({
            ...prev,
            profileImage: url
          }));
          setIsUploading(false);
          toast.success("Image uploaded successfully!");
        });
      }
    );
  };

  const removeProfileImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: ""
    }));
  };

  return (
    <div className="container py-3" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="text-center mb-4">
            <div className="position-relative d-inline-block">
              <img
                src={formData.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="rounded-circle img-thumbnail"
                style={{ 
                  width: "150px", 
                  height: "150px", 
                  objectFit: "cover",
                  border: `3px solid ${brandColor}`
                }}
              />
              <label 
                htmlFor="profile-upload" 
                className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 shadow-sm" 
                style={{ cursor: "pointer" }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  fill={brandColor} 
                  className="bi bi-camera" 
                  viewBox="0 0 16 16"
                >
                  <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                  <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0=" />
                </svg>
              </label>
              <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                className="d-none" 
                onChange={uploadImage}
                disabled={isUploading}
              />
            </div>
            {formData.profileImage && (
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={removeProfileImage}
                >
                  Remove Photo
                </button>
              </div>
            )}
            {isUploading && (
              <div className="mt-2 text-primary">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Uploading...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    placeholder="Username"
                    readOnly
                  />
                  <label htmlFor="username">Username</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                  <label htmlFor="email">Email Address</label>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    pattern="[0-9]{10}"
                    required
                  />
                  <label htmlFor="contactNumber">Contact Number</label>
                  <div className="form-text">10-digit number without spaces or dashes</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                  <label htmlFor="country">Country</label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-danger me-2"
                  onClick={handleDelete}
                >
                  Delete Account
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;