import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiFillDelete, AiFillEdit, AiFillLike, AiFillHeart } from "react-icons/ai";
import { GiCancel } from "react-icons/gi";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { BsReply } from "react-icons/bs";
import UserImage from "../../assets/user.jpeg";
import {
  getPosts,
  getPostsByUserId,
} from "../../app/actions/post.actions";
import {
  deleteCommentById,
  updateCommentById,
} from "../../app/actions/comment.actions";
import { Link } from "react-router-dom";
import { getPostShareByUserId } from "../../app/actions/postshare.actions";

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

function Comment({ postId, comment, postUserId, fetchType }) {
  const dispatch = useDispatch();
  const [commentEditable, setCommentEditable] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const user = useSelector((state) => state.user);
  const [text, setText] = useState(comment.text);
  const optionsRef = useRef(null);
  const commentRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target) &&
          commentRef.current && !commentRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmitComment = async() => {
    if (!text.trim()) return;
    
    const updatedComment = {
      id: comment.id,
      postId: postId,
      userId: user.userId,
      text: text,
    };
    
    await dispatch(updateCommentById(updatedComment));
    
    // Refresh data based on fetch type
    if (fetchType === "GET_ALL_POSTS") {
      await dispatch(getPosts());
    } else if (fetchType === "GET_ALL_USER_POSTS") {
      await dispatch(getPostsByUserId(postUserId));
      await dispatch(getPostShareByUserId(user.userId));
    } else if (fetchType === "GET_ALL_POSTS_USER") {
      await dispatch(getPostsByUserId(postUserId));
      await dispatch(getPostShareByUserId(postUserId));
    }
    
    setCommentEditable(false);
  };

  const handleDeleteComment = async() => {
    await dispatch(deleteCommentById(comment.id));
    
    // Refresh data based on fetch type
    if (fetchType === "GET_ALL_POSTS") {
      await dispatch(getPosts());
    } else if (fetchType === "GET_ALL_USER_POSTS") {
      await dispatch(getPostsByUserId(postUserId));
      await dispatch(getPostShareByUserId(user.userId));
    } else if (fetchType === "GET_ALL_POSTS_USER") {
      await dispatch(getPostsByUserId(postUserId));
      await dispatch(getPostShareByUserId(postUserId));
    }
    
    setShowOptions(false);
  };
  
  const userCanEdit = user.userId === comment.userId;
  const userCanDelete = user.userId === comment.userId || user.userId === postUserId;
  const hasOptions = userCanEdit || userCanDelete;
  
  // Placeholder functions for additional features
  const handleLike = () => {
    console.log("Like comment:", comment.id);
    // Add your like functionality here
  };
  
  const handleReply = () => {
    console.log("Reply to comment:", comment.id);
    // Add your reply functionality here
  };
  
  return (
    <div 
      className="comment-item" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={commentRef}
    >
      <div className="comment-content">
        <div className="commenter-img">
          <Link to={`/user/${comment.userId}`}>
            <img
              src={comment.profileImage ? comment.profileImage : UserImage}
              alt={`${comment.username}'s profile`}
            />
          </Link>
        </div>
        
        <div 
          className={`comment-bubble ${isHovered ? 'hovered' : ''}`} 
          onClick={() => hasOptions && !commentEditable ? setShowOptions(!showOptions) : null}
        >
          {!commentEditable ? (
            <>
              <div className="comment-header">
                <Link 
                  to={`/user/${comment.userId}`} 
                  className="commenter-name"
                  onClick={(e) => e.stopPropagation()}
                >
                  {comment.username}
                </Link>
                {comment.createdAt && (
                  <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                )}
              </div>
              <div className="comment-text">{comment.text}</div>
            </>
          ) : (
            <div className="comment-edit-container" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="comment-edit-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSubmitComment();
                }}
              />
              <div className="comment-edit-actions">
                <button 
                  className="edit-action cancel"
                  onClick={() => {
                    setCommentEditable(false);
                    setText(comment.text);
                  }}
                >
                  <GiCancel />
                </button>
                <button 
                  className="edit-action confirm"
                  onClick={handleSubmitComment}
                >
                  <IoCheckmarkDoneSharp />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Action Buttons - only visible on hover */}
      {!commentEditable && (
        <div className={`quick-actions ${isHovered ? 'visible' : ''}`}>
          <button 
            className="action-btn like"
            onClick={handleLike}
            title="Like"
          >
            <AiFillHeart />
          </button>
          <button 
            className="action-btn reply"
            onClick={handleReply}
            title="Reply"
          >
            <BsReply />
          </button>
          {userCanEdit && (
            <button 
              className="action-btn edit"
              onClick={() => {
                setCommentEditable(true);
                setShowOptions(false);
              }}
              title="Edit"
            >
              <AiFillEdit />
            </button>
          )}
          {userCanDelete && (
            <button 
              className="action-btn delete"
              onClick={handleDeleteComment}
              title="Delete"
            >
              <AiFillDelete />
            </button>
          )}
        </div>
      )}
      
      {/* Options Dropdown - shows when comment is clicked */}
      {hasOptions && showOptions && !commentEditable && (
        <div className="options-dropdown" ref={optionsRef}>
          {userCanEdit && (
            <button 
              className="option-btn"
              onClick={(e) => {
                e.stopPropagation();
                setCommentEditable(true);
                setShowOptions(false);
              }}
            >
              <AiFillEdit className="option-icon" />
              <span>Edit</span>
            </button>
          )}
          
          {userCanDelete && (
            <button 
              className="option-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteComment();
              }}
            >
              <AiFillDelete className="option-icon" />
              <span>Delete</span>
            </button>
          )}
          
          <button 
            className="option-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
              setShowOptions(false);
            }}
          >
            <AiFillHeart className="option-icon" />
            <span>Like</span>
          </button>
          
          <button 
            className="option-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleReply();
              setShowOptions(false);
            }}
          >
            <BsReply className="option-icon" />
            <span>Reply</span>
          </button>
        </div>
      )}
      
      {/* CSS Styles */}
      <style jsx>{`
        .comment-item {
          position: relative;
          margin-bottom: 12px;
          padding: 2px 8px;
          border-radius: 20px;
          transition: background-color 0.2s ease;
        }
        
        .comment-item:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .comment-content {
          display: flex;
          position: relative;
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
        
        .comment-bubble {
          flex-grow: 1;
          background-color: #f0f2f5;
          border-radius: 18px;
          padding: 8px 12px;
          position: relative;
          max-width: calc(100% - 50px);
          transition: background-color 0.2s ease;
          cursor: ${hasOptions && !commentEditable ? 'pointer' : 'default'};
        }
        
        .comment-bubble.hovered {
          background-color: ${hasOptions && !commentEditable ? '#e4e6e9' : '#f0f2f5'};
        }
        
        .comment-header {
          display: flex;
          align-items: baseline;
          margin-bottom: 2px;
        }
        
        .commenter-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #262626;
          text-decoration: none;
          margin-right: 6px;
        }
        
        .commenter-name:hover {
          text-decoration: underline;
        }
        
        .comment-time {
          font-size: 0.75rem;
          color: #65676b;
        }
        
        .comment-text {
          font-size: 0.85rem;
          line-height: 1.4;
          color: #1c1e21;
          word-break: break-word;
        }
        
        /* Edit mode styling */
        .comment-edit-container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .comment-edit-input {
          width: 100%;
          border: none;
          background: none;
          font-size: 0.85rem;
          padding: 4px 0;
          outline: none;
          border-bottom: 1px solid #3f51b5;
        }
        
        .comment-edit-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }
        
        .edit-action {
          background: none;
          border: none;
          font-size: 16px;
          padding: 2px 4px;
          cursor: pointer;
          border-radius: 4px;
          margin-left: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #65676b;
        }
        
        .edit-action:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .edit-action.confirm {
          color: #1877f2;
        }
        
        /* Quick action buttons */
        .quick-actions {
          display: flex;
          position: absolute;
          right: 12px;
          bottom: -8px;
          background-color: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 5;
          padding: 3px;
          visibility: hidden;
        }
        
        .quick-actions.visible {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }
        
        .action-btn {
          background: none;
          border: none;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          color: #65676b;
          margin: 0 2px;
          transition: background-color 0.2s ease, color 0.2s ease;
          font-size: 16px;
        }
        
        .action-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .action-btn.like:hover {
          color: #ed4956;
        }
        
        .action-btn.reply:hover {
          color: #1877f2;
        }
        
        .action-btn.edit:hover {
          color: #1877f2;
        }
        
        .action-btn.delete:hover {
          color: #ed4956;
        }
        
        /* Comment options dropdown */
        .options-dropdown {
          position: absolute;
          left: 40px;
          top: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
          min-width: 120px;
          overflow: hidden;
          margin-top: 4px;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .option-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          font-size: 0.8rem;
          text-align: left;
          cursor: pointer;
          color: #262626;
          transition: background-color 0.2s ease;
        }
        
        .option-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .option-btn.delete {
          color: #ed4956;
        }
        
        .option-btn.delete:hover {
          background-color: rgba(237, 73, 86, 0.1);
        }
        
        .option-icon {
          margin-right: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default Comment;