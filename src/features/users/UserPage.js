import React from "react";
import { useSelector } from "react-redux";
import { selectPostsByUser } from "../posts/postsSlice";
import { Link, useParams } from "react-router-dom";
import { selectUserById } from "./usersSlice";

const UserPage = () => {
  const { userId } = useParams();
  const user = useSelector((s) => selectUserById(s, Number(userId)));

  const postsForUser = useSelector((s) => selectPostsByUser(s, Number(userId)));

  const postTitles = postsForUser.map((p) => (
    <li key={p.id}>
      <Link to={`/post/${p.id}`}>{p.title}</Link>
    </li>
  ));
  return (
    <section>
      <h2>{user?.name}</h2>
      <ol>{postTitles}</ol>
    </section>
  );
};

export default UserPage;
