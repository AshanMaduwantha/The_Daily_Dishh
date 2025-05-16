import React, { useEffect } from "react";
import Posts from "../../Components/Posts";
import { useDispatch, useSelector } from "react-redux";
import { getPosts } from "../../app/actions/post.actions";
import NewUsersSuggest from "../../Components/NewUsersSuggest";
import { useLocation } from "react-router-dom";

function Home() {
  const dispatch = useDispatch();
  const post = useSelector((state) => state.post);
  const location = useLocation();

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  // Get search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search")?.toLowerCase() || "";

  // Filter posts based on caption, location, or username
  const filteredPosts = post.posts?.filter(
    (p) =>
      p.caption?.toLowerCase().includes(searchQuery) ||
      p.location?.toLowerCase().includes(searchQuery) ||
      p.user?.username?.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        <div className="col-md-4">
          <NewUsersSuggest />
        </div>
        <div className="col-md-6 mt-5">
          <Posts posts={searchQuery ? filteredPosts : post.posts} fetchType="GET_ALL_POSTS" />
          {searchQuery && filteredPosts?.length === 0 && (
            <p className="text-center text-muted mt-3">No posts found.</p>
          )}
        </div>
        <div className="col-md-2">
          {/* Additional components can be placed here */}
        </div>
      </div>
    </div>
  );
}

export default Home;
