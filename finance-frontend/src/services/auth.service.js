import api from "../api/axios";

export const loginUser = (data) => {
  return api.post("/auth/login", data);
};
export const registerUser = (data) => api.post("/auth/register", data);

export default { loginUser, registerUser };