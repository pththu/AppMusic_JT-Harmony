import { HOST } from "@/config/ApiConfig";
import axios from "axios";

export const API_URL = `${HOST}/api/v1`;

//auth
export const Login = async (payload) => {
  try {
    const { email, password } = payload;
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}; 