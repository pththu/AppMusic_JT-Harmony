import axios from "axios";
import axiosClient from "@/config/axiosClient";

export const Login = async (payload) => {
  try {
    const { email, password } = payload;
    console.log(payload);
    const response = await axiosClient.post(`/auth/login`, {
      email,
      password,
    }, { timeout: 3000 });
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const GetMe = async () => {
  try {
    const response = await axiosClient.get(`/auth/me`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const LoginWithGoogle = async (payload) => {
  try {
    const userInfor = payload;
    const response = await axiosClient.post(`/auth/google-login`,
      userInfor,
      { skipAuth: true }
    );
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const Logout = async () => {
  try {
    const response = await axiosClient.get(`/auth/logout`);
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}