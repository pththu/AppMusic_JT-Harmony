import axios from "axios";
import axiosClient from "@/config/axiosClient";

// auth api
export const Login = async (payload) => {
  try {
    const { email, password } = payload;
    const response = await axiosClient.post(`/auth/login`, {
      email,
      password,
    }, { timeout: 3000, skipAuth: true });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const GetMe = async () => {
  try {
    const response = await axiosClient.get(`/auth/me`);
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
export const LoginWithFacebook = async (payload) => {
  try {
    const profile = payload;
    const response = await axiosClient.post(`/auth/facebook-login`,
      profile,
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
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const VerifyEmail = async (payload) => {
  try {
    const { email, otp, facebookId } = payload;
    const response = await axiosClient.post(`/auth/verify-otp`,
      {
        email,
        otp,
        facebookId
      },
      { skipAuth: true }
    );
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
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
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const SendOtpEmail = async (payload) => {
  try {
    const { email, facebookId } = payload;
    const response = await axiosClient.post(`/auth/send-otp`,
      {
        email,
        facebookId
      },
      { skipAuth: true }
    );
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const isEmailExist = async (payload) => {
  try {
    const response = await axiosClient.post(`/auth/is-email-exist`, payload);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

// user api
export const UpdateProfile = async (payload) => {
  try {
    const response = await axiosClient.put(`/users/update-profile`, payload);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const ChangePassword = async (payload) => {
  try {
    const { currentPassword, newPassword } = payload;
    const response = await axiosClient.put(`/users/change-password`, {
      currentPassword,
      newPassword
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const LinkSocialAccount = async (payload) => {
  try {
    const { userInfor, provider } = payload;
    const response = await axiosClient.post(`/users/link-social-account`, {
      userInfor,
      provider
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const SelfLockAccount = async (payload) => {
  try {
    const response = await axiosClient.put(`/users/self-lock`, { password: payload });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}

// post api

// comment api