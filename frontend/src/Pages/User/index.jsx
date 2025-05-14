import React, { useEffect } from "react";
import Posts from "../../Components/Posts";
import { useDispatch, useSelector } from "react-redux";
import { getPostsByUserId } from "../../app/actions/post.actions";
import PostAdd from "../../Components/PostAdd";
import UserProfile from "./user-profile";
import SharedPosts from "../SharedPosts";
import "bootstrap-icons/font/bootstrap-icons.css";

const customStyles = `
  .hover-shadow:hover {
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
    transition: all 0.3s ease;
  }
  
  .rounded-4 {
    border-radius: 0.75rem !important;
  }
  
  .nav-link.active {
    color: #fd7e14 !important;
  }
  
  .nav-link:hover:not(.active) {
    color: #fd7e14 !important;
    opacity: 0.8;
  }
  
  .transition-all {
    transition: all 0.3s ease;
  }
  
  .card {
    border: none !important;
  }
  
  .gap-4 {
    gap: 1.5rem;
  }
`;

function User() {
  const dispatch = useDispatch();
  const post = useSelector((state) => state.post);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if(user.userId){
      dispatch(getPostsByUserId(user.userId));
    }
  }, [dispatch, user.userId]);

  return (
    <>
      <style>{customStyles}</style>
      <div className="bg-light min-vh-100 py-5 mt-5">
        <div className="container py-3">
          <div className="row g-4">
            {/* User Profile Card */}
            <div className="col-lg-4">
              <div className="card shadow-sm rounded-4 overflow-hidden h-40 transition-all hover-shadow">
                <div className="card-body p-4">
                  <UserProfile />
                </div>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="col-lg-8 d-flex flex-column gap-4">
              {/* Post Creation Card */}
              <div className="card shadow-sm rounded-4 overflow-hidden transition-all hover-shadow">
                <div className="card-body p-4">
                  <PostAdd />
                </div>
              </div>

              {/* Posts Display Section */}
              <div className="card shadow-sm rounded-4 overflow-hidden">
                {/* Modern Tab Navigation */}
                <ul className="nav nav-tabs card-header-tabs border-0 p-0 m-0" role="tablist">
                  <li className="nav-item flex-grow-1 text-center" role="presentation">
                    <button
                      className="nav-link active py-3 w-100 position-relative fw-medium border-0"
                      id="posts-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#posts-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="posts-tab-pane"
                      aria-selected="true"
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-journal-text"></i>
                        <span>MY POSTS</span>
                      </div>
                      <span className="position-absolute bottom-0 start-0 w-100 active-indicator" style={{ height: "3px", backgroundColor: "#fd7e14" }}></span>
                    </button>
                  </li>
                  <li className="nav-item flex-grow-1 text-center" role="presentation">
                    <button
                      className="nav-link py-3 w-100 position-relative fw-medium border-0"
                      id="shared-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#shared-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="shared-tab-pane"
                      aria-selected="false"
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-share"></i>
                        <span>SHARED POSTS</span>
                      </div>
                      <span className="position-absolute bottom-0 start-0 w-100 active-indicator opacity-0" style={{ height: "3px", backgroundColor: "#fd7e14" }}></span>
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content p-4">
                  <div 
                    className="tab-pane fade show active" 
                    id="posts-tab-pane" 
                    role="tabpanel" 
                    aria-labelledby="posts-tab"
                  >
                    <Posts posts={post.posts} fetchType="GET_ALL_USER_POSTS" />
                  </div>
                  <div 
                    className="tab-pane fade" 
                    id="shared-tab-pane" 
                    role="tabpanel" 
                    aria-labelledby="shared-tab"
                  >
                    <SharedPosts />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default User;