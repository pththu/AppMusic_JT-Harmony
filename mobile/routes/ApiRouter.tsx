import axios from "axios";
import { HOST } from "@/config/apiClient";
//auth
export const Login = async (payload) => {
  try {
    const { email, password } = payload;
    console.log(payload);
    const response = await axios.post(`${HOST}/auth/login`, {
      email,
      password
    }, { timeout: 3000 });
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}; 