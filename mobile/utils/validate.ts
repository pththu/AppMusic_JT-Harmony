const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ.";
  }
  return null;
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  return null;
};

const validateForm = (email, password) => {
  if (!email || !password) {
    return "Vui lòng điền đầy đủ thông tin.";
  }
  const emailError = validateEmail(email);
  if (emailError) {
    return emailError;
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }
  return null;
};

export {
  validateEmail,
  validatePassword,
  validateForm
};