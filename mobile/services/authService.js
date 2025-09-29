import axiosClient from '../api/axiosClient';

const authService = {
  // Hàm đăng nhập đã có
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng ký người dùng mới
   * @param {object} userData - Dữ liệu đăng ký bao gồm username, email, password, etc.
   * @returns {Promise<object>} - Dữ liệu trả về từ API
   */
  register: async userData => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      // Xử lý lỗi đăng ký từ server
      throw error;
    }
  },
};

export default authService;
