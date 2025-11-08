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
};
export const MergeAccount = async (payload) => {
  try {
    const response = await axiosClient.put(`/users/merge-account`, payload);
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};
export const ChangeAvatar = async (payload) => {
  try {
    const imageUri = payload;
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type
    } as any);

    const response = await axiosClient.post(`/users/change-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const UploadMultipleFile = async (payload) => {
  try {
    const assets = payload; // array of expo assets
    if (!assets || assets.length === 0) {
      console.log("Không có file nào được chọn để upload.");
      return { success: false, message: "Không có file nào được chọn", status: "info" };
    }

    const formData = new FormData();
    assets.forEach((asset) => {
      const filename = asset.uri.split('/').pop();
      const type = asset.type === 'image' ? 'image/jpeg' : asset.type === 'video' ? 'video/mp4' : 'application/octet-stream';
      const fileToUpload = {
        uri: asset.uri,
        name: filename,
        type: type,
      };

      // Tên field 'files' phải khớp với tên mà backend
      formData.append('files', fileToUpload as any);
    });

    const response = await axiosClient.post(`/upload/multiple-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('response.data', response.data);

    // Check if the server response indicates failure
    if (response.data.success === false) {
      return { success: false, message: response.data.message, status: "error" };
    }

    return { success: true, data: response.data, message: "Upload successful" };
  } catch (error) {
    return { success: false, message: error.message, status: "error" };
  }
};


//track api