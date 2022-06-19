import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = postsAdapter.getInitialState({
  status: "idle", //'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  count: 0,
});

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await axios.get(POSTS_URL);
  return response.data;
});

export const addNewPost = createAsyncThunk(
  "posts/addNewPost",
  async (initialPost) => {
    const response = await axios.post(POSTS_URL, initialPost);
    return response.data;
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (initialPost) => {
    const { id } = initialPost;
    try {
      const res = await axios.put(`${POSTS_URL}/${id}`, initialPost);
      return res.data;
    } catch (err) {
      //   return err.message;
      console.log(err.message);
      return initialPost; // only for testing Redux!
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (initialPost) => {
    const { id } = initialPost;
    try {
      const res = await axios.delete(`${POSTS_URL}/${id}`);
      if (res?.status === 200) return initialPost;
      return `${res?.status}: ${res?.statusText}`;
    } catch (err) {
      return err.message;
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reactionAdded(s, a) {
      const { postId, reaction } = a.payload;
      const existingPost = s.entities[postId];
      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    },
    increaseCount(s, a) {
      s.count = s.count + 1;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (s, a) => {
        s.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (s, a) => {
        s.status = "succeeded";
        // Adding date and reactions
        let min = 1;
        const loadedPosts = a.payload.map((post) => {
          post.date = sub(new Date(), { minutes: min++ }).toISOString();
          post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          };
          return post;
        });

        // Add any fetched posts to the array
        postsAdapter.upsertMany(s, loadedPosts);
      })
      .addCase(fetchPosts.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
      .addCase(addNewPost.fulfilled, (s, a) => {
        a.payload.userId = Number(a.payload.userId);
        a.payload.date = new Date().toISOString();
        a.payload.reactions = {
          thumbsUp: 0,
          wow: 0,
          heart: 0,
          rocket: 0,
          coffee: 0,
        };
        postsAdapter.addOne(s, a.payload);
      })
      .addCase(updatePost.fulfilled, (s, a) => {
        if (!a.payload?.id) {
          console.log(`Update could not complete`);
          console.log(a.payload);
          return;
        }
        a.payload.date = new Date().toISOString();
        postsAdapter.upsertOne(s, a.payload);
      })
      .addCase(deletePost.fulfilled, (s, a) => {
        if (!a.payload?.id) {
          console.log(`Delete could not complete`);
          console.log(a.payload);
          return;
        }
        const { id } = a.payload;
        postsAdapter.removeOne(s, id);
      });
  },
});

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((s) => s.posts);

export const getPostsStatus = (s) => s.posts.status;
export const getPostsError = (s) => s.posts.error;
export const getCount = (s) => s.posts.count;

export const selectPostsByUser = createSelector(
  [selectAllPosts, (s, userId) => userId],
  (posts, userId) => posts.filter((p) => p.userId === userId)
);

export const { increaseCount, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;
