import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePostShareById,
  updatePostShareById,
  getPostShareByUserId,
} from "../../app/actions/postshare.actions";
import UserImage from "../../assets/user.jpeg";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { GiCancel } from "react-icons/gi";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
function SharedPostCard({ post, fetchType }) {
  const dispatch = useDispatch();
  const [editable, setEditable] = useState(false);
  const user = useSelector((state) => state.user);
  const [captionEdit, setCaption] = React.useState(post.caption);

  const handleSubmit = async () => {
    const newPost = {
      id: post.id,
      caption: captionEdit,
    };
    await dispatch(updatePostShareById(newPost));
    if (fetchType === "GET_ALL_POSTS_SHARED") {
      await dispatch(getPostShareByUserId(user.userId));
    }
    setCaption(captionEdit);
    setEditable(false);
  };
