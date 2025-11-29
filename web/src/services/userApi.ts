import axiosClient from "@/lib/axiosClient"

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

export {
  GetAllRole,
  CreateRole,
  DeleteRole,
  UpdateRole,
  GetAllUser,
}