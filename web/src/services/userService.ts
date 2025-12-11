import axiosClient from "@/lib/axiosClient"
import { ca } from "date-fns/locale";

// role api
const GetAllRole = async () => {
  try {
    const response = await axiosClient.get('/roles');
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const CreateRole = async (payload) => {
  try {
    const response = await axiosClient.post('/roles', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const DeleteRole = async (roleId) => {
  try {
    const response = await axiosClient.delete(`/roles/remove/${roleId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const UpdateRole = async (roleId, payload) => {
  try {
    const response = await axiosClient.put(`/roles/update/${roleId}`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// user api
const GetAllUser = async () => {
  try {
    const response = await axiosClient.get('/users');
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const CreateUser = async (payload) => {
  try {
    const response = await axiosClient.post('/users', payload);
    console.log('response: ', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const DeleteUser = async (userId) => {
  try {
    const response = await axiosClient.delete(`/users/remove/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const DeleteUsers = async (payload) => {
  try {
    const response = await axiosClient.post(`/users/delete-multiple`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const BannedUser = async (userId) => {
  try {
    const response = await axiosClient.put(`/users/banned/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const UnlockUser = async (userId) => {
  try {
    const response = await axiosClient.put(`/users/unlock-user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export {
  CreateRole,
  CreateUser,
  GetAllRole,
  GetAllUser,
  UpdateRole,
  DeleteRole,
  DeleteUser,
  DeleteUsers,
  BannedUser,
  UnlockUser,
}