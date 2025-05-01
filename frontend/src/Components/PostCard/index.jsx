import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePostById,
  updatePostById,
  likePostById,
  getPosts,
  getPostsByUserId,
} from "../../app/actions/post.actions";
import { getAllUsers } from "../../app/actions/user.actions";
import { saveNotification } from "../../app/actions/notification.action";
import { getPostToShareById } from "../../app/slices/post.slice";
import { saveComment } from "../../app/actions/comment.actions";
import storage from "../../util/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import UserImage from "../../assets/user.jpeg";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineComment,
  AiFillDelete,
  AiFillEdit,
} from "react-icons/ai";
import { TbShare3 } from "react-icons/tb";
import { GiCancel } from "react-icons/gi";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { MdSend } from "react-icons/md";
import { BsThreeDots, BsEmojiSmile } from "react-icons/bs";
import Comment from "../Comment";
import SharePostForm from "../SharePostForm";
import { Link } from "react-router-dom";
import { getPostShareByUserId } from "../../app/actions/postshare.actions";
import FollowButton from "../NewUsersSuggest/FollowButton";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

Modal.setAppElement("div");
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "16px",
    padding: "0",
    border: "none",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    maxWidth: "90%",
    width: "500px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
  },
};

const getUserByIdFunc = (users, userId) => {
  const result = users.filter(function (el) {
    return el.id === userId;
  });

  return result ? result[0] : null; // or undefined
};

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

function PostCard({ post, fetchType }) {
  const dispatch = useDispatch();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentAnimation, setCommentAnimation] = useState(false);
  const user = useSelector((state) => state.user);
  const [captionEdit, setCaption] = React.useState(post.caption);
  const [imgLinkEdit, setImgLinkEdit] = React.useState(post.imgLink);
  const [comment, setComment] = React.useState("");
  const [isLiked, setIsLiked] = React.useState(false);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  useEffect(() => {
    if (post.likedby && post.likedby.length) {
      const userIdIndex = post.likedby.indexOf(user.userId);

      if (userIdIndex > -1) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }
    }
  }, [user, post.likedby]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    setCommentAnimation(true);
    setTimeout(() => setCommentAnimation(false), 1000);
    
    const newComment = {
      postId: post.id,
      userId: user.userId,
      text: comment,
    };
    await dispatch(saveComment(newComment));

    const newNotification = {
      message: "Commented by " + user.user.username + " on your post",
      userId: post.userId,
    };

    await dispatch(saveNotification(newNotification));
    if (fetchType === "GET_ALL_POSTS") {
      await dispatch(getPosts());
    }
    if (fetchType === "GET_ALL_USER_POSTS") {
      await dispatch(getPostShareByUserId(user.userId));
    }
    if (fetchType === "GET_ALL_POSTS_USER") {
      await dispatch(getPostShareByUserId(post.userId));
    }
    setComment("");
  };

  const handleSubmit = async () => {
    const newPost = {
      id: post.id,
      userId: user.userId,
      caption: captionEdit,
      imgLink: imgLinkEdit,
    };
    await dispatch(updatePostById(newPost));
    if (fetchType === "GET_ALL_POSTS") {
      await dispatch(getPosts());
    }
    if (fetchType === "GET_ALL_USER_POSTS") {
      await dispatch(getPostShareByUserId(user.userId));
    }
    if (fetchType === "GET_ALL_USER_POSTS") {
      await dispatch(getPostsByUserId(user.userId));
    }
    setEditable(false);
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
            setImgLinkEdit((prevLinks) => [...prevLinks, url]);
          });
        }
      );
    }
  };

  const handleLikePost = async () => {
    const tempLikeArray = post.likedby ? post.likedby.slice() : [];
    const userId = user.userId.toString();
    const userIdIndex = tempLikeArray.indexOf(userId);

    if (userIdIndex > -1) {
      tempLikeArray.splice(userIdIndex, 1);
      setIsLiked(false);
    } else {
      tempLikeArray.push(userId);
      setIsLiked(true);
    }

    const likedPost = {
      id: post.id,
      likedby: tempLikeArray,
    };

    await dispatch(likePostById(likedPost));
    if (fetchType === "GET_ALL_POSTS") {
      await dispatch(getPosts());
    }
    if (fetchType === "GET_ALL_USER_POSTS") {
      await dispatch(getPostsByUserId(post.userId));
      await dispatch(getPostShareByUserId(user.userId));
    }
    if (fetchType === "GET_ALL_POSTS_USER") {
      await dispatch(getPostsByUserId(post.userId));
      await dispatch(getPostShareByUserId(post.userId));
    }
    const newNotification = {
      message: "Like by " + user.user.username + " on your post",
      userId: post.userId,
    };

    await dispatch(saveNotification(newNotification));
  };

  // Settings for the image slider
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: true,
    centerMode: false,
    className: "modern-slider",
    dotsClass: "slick-dots custom-dots",
  };

  // Only show first 2 comments initially
  const commentsToShow = showAllComments ? 
    (post.comments || []) : 
    (post.comments || []).slice(0, 2);

  return (
    <div className="modern-post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="user-info">
          <Link
            className="profile-link"
            to={`/user/${post.userId}`}
          >
            <div className="profile-image-container">
              <img
                src={post.profileImage ? post.profileImage : UserImage}
                className="profile-image"
                alt={`${post.username}'s profile`}
              />
            </div>
            <div className="username-container">
              <span className="username">{post.username}</span>
              <span className="post-time">{formatTimestamp(post.createdAt)}</span>
            </div>
          </Link>
        </div>
        
        <div className="action-btns">
          <FollowButton
            userDetails={getUserByIdFunc(user.users, post.userId)}
            className="modern-follow-btn"
          />
          
          {user.userId === post.userId && (
            <div className="post-options">
              <div className="menu-icon-container" onClick={() => setShowMenu(!showMenu)}>
                <BsThreeDots className="menu-icon" />
              </div>
              
              {showMenu && (
                <div className="dropdown-menu show">
                  {editable ? (
                    <>
                      <button 
                        className="dropdown-item" 
                        onClick={() => setEditable(false)}
                      >
                        <GiCancel className="item-icon" /> Cancel
                      </button>
                      <button 
                        className="dropdown-item" 
                        onClick={handleSubmit}
                      >
                        <IoCheckmarkDoneSharp className="item-icon" /> Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="dropdown-item" 
                        onClick={() => setEditable(true)}
                      >
                        <AiFillEdit className="item-icon" /> Edit
                      </button>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={() => dispatch(deletePostById(post.id))}
                      >
                        <AiFillDelete className="item-icon" /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Caption */}
      <div className="post-caption">
        {!editable ? (
          <p>{post.caption}</p>
        ) : (
          <textarea
            className="caption-edit-input"
            value={captionEdit}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="What's on your mind?"
          />
        )}
      </div>

      {/* Post Images */}
      {imgLinkEdit && imgLinkEdit.length > 0 && (
        <div className="post-images">
          <Slider {...sliderSettings}>
            {imgLinkEdit.map((imgLink, index) => (
              <div key={`${imgLink}-${index}`} className="slide-item">
                <img
                  src={imgLink}
                  className="post-image"
                  alt={`Post image ${index + 1}`}
                />
              </div>
            ))}
          </Slider>
          
          {editable && (
            <div className="image-upload-container">
              <label className="image-upload-label">
                <input
                  type="file"
                  className="image-upload-input"
                  onChange={uploadImage}
                  multiple
                />
                <span>Add Photos</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Post Engagement Stats */}
      <div className="engagement-stats">
        {post.likedby && post.likedby.length > 0 && (
          <div className="like-stats">
            <AiFillLike className="like-icon" />
            <span>{post.likedby.length}</span>
          </div>
        )}
        
        {post.comments && post.comments.length > 0 && (
          <div className="comment-stats">
            <span>{post.comments.length} comments</span>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLikePost}
        >
          {isLiked ? (
            <AiFillLike className="action-icon like-filled" />
          ) : (
            <AiOutlineLike className="action-icon" />
          )}
          <span>Like</span>
        </button>
        
        <button className="action-btn">
          <AiOutlineComment className="action-icon" />
          <span>Comment</span>
        </button>
        
        <button 
          className="action-btn"
          onClick={() => {
            dispatch(getPostToShareById(post.id));
            openModal();
          }}
        >
          <TbShare3 className="action-icon" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className={`comments-section ${commentAnimation ? 'comment-added' : ''}`}>
        {/* Comment Input */}
        <div className="comment-input-container">
          <div className="commenter-img">
            <img 
              src={user.user?.profileImage || UserImage} 
              alt="Your profile" 
            />
          </div>
          <div className="comment-input-wrapper">
            <input
              type="text"
              className="comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSubmitComment();
              }}
            />
            <div className="comment-input-actions">
              <BsEmojiSmile className="emoji-icon" />
              <button 
                className={`send-btn ${comment.trim() ? 'active' : ''}`}
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
              >
                <MdSend className="send-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {commentsToShow.length > 0 && (
          <div className="comments-list">
            {commentsToShow.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                postId={post.id}
                postUserId={post.userId}
                fetchType={fetchType}
              />
            ))}
            
            {/* Show more comments button */}
            {post.comments && post.comments.length > 2 && !showAllComments && (
              <button 
                className="show-more-comments"
                onClick={() => setShowAllComments(true)}
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Share Post Modal"
      >
        <div className="share-modal-header">
          <h5 className="modal-title">Share Post</h5>
          <button className="close-btn" onClick={closeModal}>×</button>
        </div>
        <div className="share-modal-body">
          <SharePostForm closeModal={closeModal} />
        </div>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .modern-post-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
          border: none;
        }
        
        .modern-post-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* Post Header */
        .post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .user-info {
          display: flex;
          align-items: center;
        }
        
        .profile-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        
        .profile-image-container {
          position: relative;
          margin-right: 12px;
        }
        
        .profile-image {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        .username-container {
          display: flex;
          flex-direction: column;
        }
        
        .username {
          font-weight: 600;
          font-size: 0.95rem;
          color: #262626;
          margin-bottom: 2px;
        }
        
        .post-time {
          font-size: 0.75rem;
          color: #8e8e8e;
        }
        
        .action-btns {
          display: flex;
          align-items: center;
        }
        
        /* Follow button styling is handled by the FollowButton component */
        
        .post-options {
          position: relative;
          margin-left: 12px;
        }
        
        .menu-icon-container {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .menu-icon-container:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .menu-icon {
          font-size: 18px;
          color: #262626;
        }
        
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          z-index: 10;
          padding: 8px 0;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          font-size: 0.9rem;
          color: #262626;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .dropdown-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .item-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        /* Post Caption */
        .post-caption {
          padding: 16px 16px 0;
        }
        
        .post-caption p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #262626;
          white-space: pre-line;
        }
        
        .caption-edit-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #dbdbdb;
          border-radius: 8px;
          font-size: 0.95rem;
          line-height: 1.5;
          resize: none;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        .caption-edit-input:focus {
          border-color: #3f51b5;
        }
        
        /* Post Images */
        .post-images {
          margin-top: 12px;
          position: relative;
        }
        
        .slide-item {
          max-height: 500px;
          display: flex !important;
          justify-content: center;
          align-items: center;
          background-color: #000;
        }
        
        .post-image {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
        }
        
        /* Custom styling for slider dots */
        :global(.modern-slider .slick-dots) {
          bottom: 10px;
        }
        
        :global(.modern-slider .slick-dots li button:before) {
          color: white;
          opacity: 0.7;
          font-size: 8px;
        }
        
        :global(.modern-slider .slick-dots li.slick-active button:before) {
          color: white;
          opacity: 1;
        }
        
        .image-upload-container {
          margin-top: 16px;
          padding: 0 16px;
        }
        
        .image-upload-label {
          display: inline-block;
          padding: 8px 16px;
          background-color: #f0f2f5;
          color: #3f51b5;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .image-upload-label:hover {
          background-color: #e4e6eb;
        }
        
        .image-upload-input {
          display: none;
        }
        
        /* Post Engagement Stats */
        .engagement-stats {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-top: 12px;
        }
        
        .like-stats {
          display: flex;
          align-items: center;
        }
        
        .like-icon {
          font-size: 14px;
          color: #1877f2;
          margin-right: 6px;
        }
        
        .like-stats span,
        .comment-stats span {
          font-size: 0.85rem;
          color: #65676b;
        }
        
        /* Post Actions */
        .post-actions {
          display: flex;
          justify-content: space-between;
          padding: 4px 16px;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #65676b;
          flex-grow: 1;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-radius: 8px;
        }
        
        .action-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .action-icon {
          font-size: 18px;
          margin-right: 6px;
        }
        
        .action-btn.liked {
          color: #1877f2;
        }
        
        .like-filled {
          color: #1877f2;
        }
        
        /* Comments Section */
        .comments-section {
          padding: 12px 16px;
          transition: background-color 0.3s ease;
        }
        
        .comments-section.comment-added {
          animation: highlightComment 1s ease;
        }
        
        @keyframes highlightComment {
          0% { background-color: rgba(24, 119, 242, 0.1); }
          100% { background-color: transparent; }
        }
        
        .comment-input-container {
          display: flex;
          margin-bottom: 12px;
        }
        
        .commenter-img {
          margin-right: 8px;
        }
        
        .commenter-img img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .comment-input-wrapper {
          position: relative;
          flex-grow: 1;
          display: flex;
        }
        
        .comment-input {
          flex-grow: 1;
          border: none;
          background-color: #f0f2f5;
          border-radius: 20px;
          padding: 8px 40px 8px 16px;
          font-size: 0.9rem;
          outline: none;
          transition: background-color 0.2s ease;
        }
        
        .comment-input:focus {
          background-color: #e4e6eb;
        }
        
        .comment-input-actions {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
        }
        
        .emoji-icon {
          font-size: 16px;
          color: #65676b;
          margin-right: 8px;
          cursor: pointer;
        }
        
        .send-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }
        
        .send-btn.active {
          opacity: 1;
        }
        
        .send-icon {
          font-size: 16px;
          color: #1877f2;
        }
        
        /* Comments List */
        .comments-list {
          margin-top: 8px;
        }
        
        .show-more-comments {
          background: none;
          border: none;
          font-size: 0.85rem;
          color: #65676b;
          font-weight: 500;
          padding: 8px 0;
          cursor: pointer;
        }
        
        .show-more-comments:hover {
          text-decoration: underline;
        }
        
        /* Share Modal */
        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .modal-title {
          font-weight: 600;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          color: #65676b;
        }
        
        .share-modal-body {
          padding: 16px;
        }
        
        /* For modern-follow-btn - override in main component */
        :global(.modern-follow-btn) {
          padding: 6px 16px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          border-radius: 20px !important;
          background: linear-gradient(45deg, #4776e6, #5e85ec) !important;
          color: white !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

export default PostCard;