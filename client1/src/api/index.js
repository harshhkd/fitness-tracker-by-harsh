import axios from "axios";

const API = axios.create({
  baseURL:"http://localhost:8001/api",
});

export const UserSignUp = async (data) => API.post("/user/signup", data);
export const UserSignIn = async (data) => API.post("/user/signin", data);

export const getDashboardDetails = async (token) =>
  API.get("/user/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

  export const getWorkouts = async (token, date) =>
    API.get(`/user/workout`, {
      params: date ? { date } : {},
      headers: { Authorization: `Bearer ${token}` },
    });
  
  export const addWorkout = async (token, data) =>
    API.post(`/user/workout`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
