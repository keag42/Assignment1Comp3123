import api from "./client";

export const signupUser = (user) => api.post("/api/v1/user/signup", user);
export const loginUser = (credentials) => api.post("/api/v1/user/login", credentials);
