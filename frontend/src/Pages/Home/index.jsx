import React, { useEffect } from "react";
import Posts from "../../Components/Posts";
import { useDispatch, useSelector } from "react-redux";
import { getPosts } from "../../app/actions/post.actions";
import NewUsersSuggest from "../../Components/NewUsersSuggest";

function Home() {
  const dispatch = useDispatch();
  const post = useSelector((state) => state.post);
  
  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);
  
  return (
    <div className="container mt-5 mb-5 mt-5">
      <div className="row">
        <div className="col-md-4">
          <NewUsersSuggest />
        </div>
        <div className="col-md-6 mt-5">
          <Posts posts={post.posts} fetchType="GET_ALL_POSTS" />
        </div>
        <div className="col-md-2">
          {/* You can add additional components here in the future */}
        </div>
      </div>
    </div>
  );
}

export default Home;