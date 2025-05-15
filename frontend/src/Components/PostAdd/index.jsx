import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPostsByUserId, savePost } from "../../app/actions/post.actions";
import storage from "../../util/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function PostAdd() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const fileInputRef = useRef(null);

  const [caption, setCaption] = React.useState("");
  const [imgLink, setImgLink] = React.useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const post = {
      userId: user.userId,
      caption,
      imgLink,
    };
    await dispatch(savePost(post));
    await dispatch(getPostsByUserId(user.userId));
    setCaption("");
    setImgLink([]);
    fileInputRef.current.value = "";
  };

  const uploadImage = (e) => {
    const files = e.target.files;

    if (files.length === 0) {
      alert("Please upload at least one image!");
      return;
    }

    // upload up to 4 images
    const maxImages = 4;
    const numImages = Math.min(maxImages, files.length);

    for (let i = 0; i < numImages; i++) {
      const file = files[i];
      const storageRef = ref(storage, `/posts/${file.name}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (err) => console.log(err),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setImgLink((prevLinks) => [...prevLinks, url]);
          });
        }
      );
    }
  };

  return (
    <div className="container mb-3 card create-card shadow-sm border-0 rounded-3 bg-white">
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <h5 className="fw-bold mb-3">What's on your mind?</h5>
          <div className="mt-2 mb-3">
            <label className="form-label"></label>
            <input
              type="text"
              className="form-control bg-light border-0"
              placeholder="What do you want to talk about?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="mb-3 text-muted small">
            <i>*maximum 4 images</i>
          </div>
          <div className="mb-3">
            {imgLink.length > 0 &&
              imgLink.map((link, index) => (
                <img
                  key={index}
                  src={link}
                  className="img-fluid me-3 rounded-3 mb-2"
                  alt={`Uploaded ${index + 1}`}
                />
              ))}

            <input
              type="file"
              className="form-control border-0 bg-light"
              onChange={uploadImage}
              ref={fileInputRef}
              multiple
            />
          </div>

          <button type="submit" className="btn btn-primary px-4 rounded-pill" style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14", color: "#fff" }}>
            PUBLISH
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostAdd;
