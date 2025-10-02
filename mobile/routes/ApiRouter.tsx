import axios from "axios";
import axiosClient from "@/config/axiosClient";

// auth api
export const Login = async (payload) => {
  try {
    const { email, password } = payload;
    console.log(payload);
    const response = await axiosClient.post(`/auth/login`, {
      email,
      password,
    }, { timeout: 3000, skipAuth: true });
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
};
export const Register = async (payload) => {
  try {
    const { username, email, password, dob, gender } = payload;
    const response = await axiosClient.post(`/auth/register`,
      {
        username,
        email,
        password,
        dob,
        gender
      },
      { skipAuth: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const VerifyEmail = async (payload) => {
  try {
    const { email, otp } = payload;
    const response = await axiosClient.post(`/auth/verify-otp`,
      {
        email,
        otp
      },
      { skipAuth: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
// export const ResendOtp = async (payload) => {
//   try {
//     const { email } = payload;
//     const response = await axiosClient.post(`/auth/resend-otp`,
//       {
//         email
//       },
//       { skipAuth: true }
//     );
//     console.log(response.data);
//     return response.data;
//   } catch (error) {
//     return { message: error.message, status: "error" };
//   }
// };
export const ResetPassword = async (payload) => {
  try {
    const { email, newPassword } = payload;
    const response = await axiosClient.post(`/auth/reset-password`,
      {
        email,
        newPassword
      },
      { skipAuth: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const SendOtpEmail = async (payload) => {
  try {
    const { email } = payload;
    const response = await axiosClient.post(`/auth/send-otp`,
      {
        email
      },
      { skipAuth: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

// user api
export const UpdateProfile = async (payload) => {
  try {
    const response = await axiosClient.put(`/users/update-profile`, payload);
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

// post api

// comment api