import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const initialState = [];

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get(USERS_URL);
  return response.data;
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (s, a) => {
      return a.payload;
    });
  },
});

export const selectAllUsers = (s) => s.users;

export const selectUserById = (s, userId) =>
  s.users.find((u) => u.id === userId);

export default usersSlice.reducer;
