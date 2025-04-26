import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, updateUserById, deleteUserById } from "../../app/actions/user.actions";
import storage from "../../util/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function Profile({ closeModal }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [country, setCountry] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (user?.userId) {
      dispatch(getUser(user.userId));
    }
  }, [dispatch, user?.userId]);

  useEffect(() => {
    if (user?.user) {
      setUsername(user.user.username || "");
      setEmail(user.user.email || "");
      setContactNumber(user.user.contactNumber || "");
      setCountry(user.user.country || "");
      setProfileImage(user.user.profileImage || "");
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const userUpdate = {
      id: user.user.id,
      username,
      email,
      contactNumber,
      country,
      profileImage,
    };

    dispatch(updateUserById(userUpdate));
    closeModal();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      dispatch(deleteUserById(user.userId));
      closeModal();
    }
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return alert("Please upload an image first!");

    const storageRef = ref(storage, `/users/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => setProfileImage(url));
      }
    );
  };

  return (
    <div>
      <h2 className="text-center">Update Profile</h2>
      <hr />
      <form onSubmit={handleSubmit} className="px-3">
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input type="text" className="form-control" value={username} readOnly />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Number</label>
          <input
            type="text"
            className="form-control"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            pattern="[0-9]{10}"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Country</label>
          <input
            type="text"
            className="form-control"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input type="file" className="form-control" onChange={uploadImage} />
          {profileImage && (
            <div className="mt-2 text-center">
              <img src={profileImage} alt="Profile" className="img-thumbnail" width="100" />
              <button
                type="button"
                className="btn btn-sm btn-danger mt-2"
                onClick={() =>
                  setProfileImage("https://i.discogs.com/57iTb7iRduipsfyksYodpaSpz_eEjtg52zPBhCwBPhI/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTY5Nzg2/ODEtMTU0OTgxMTIz/OC02NjMxLmpwZWc.jpeg")
                }
              >
                Remove Profile Image
              </button>
            </div>
          )}
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-success">Update</button>
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete Account</button>
        </div>
      </form>
    </div>
  );
}

export default Profile;