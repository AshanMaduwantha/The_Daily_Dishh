import React, { useEffect } from "react";
import Posts from "../../Components/Posts";
import { useDispatch, useSelector } from "react-redux";
import { getPostsByUserId } from "../../app/actions/post.actions";
import PostAdd from "../../Components/PostAdd";
import UserProfile from "./user-profile";
import SharedPosts from "../SharedPosts";

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
    <div className="container py-5 mt-5">
      <div className="row g-4">
        {/* User Profile Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body">
              <UserProfile />
            </div>
          </div>
        </div>
        
        {/* Posts Content Area */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-body">
              <PostAdd />
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-0">
              {/* Tabs */}
              <ul className="nav nav-pills nav-fill border-bottom p-3" id="profileTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active fw-medium"
                    id="posts-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#posts-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="posts-tab-pane"
                    aria-selected="true"
                    style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14", color: "#fff" }}
                  >
                    MY POSTS
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link fw-medium"
                    id="shared-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#shared-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="shared-tab-pane"
                    aria-selected="false"
                    style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14", color: "#fff" }}
                  >
                    SHARED POSTS
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content p-3" id="profileTabsContent">
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
  );
}

export default User;