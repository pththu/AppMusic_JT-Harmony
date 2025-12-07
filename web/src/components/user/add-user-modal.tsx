import { Check, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Modal } from "../ui";
import Image from "next/image";
import { GENRES } from "@/constants/data";

const CreateUserModal = ({ isOpen, onClose, onSubmit, roles }) => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "male",
    roleId: 2,
    favoritesGenres: [] as string[],
    accountType: [] as string[],
    facebookId: "",
    googleId: "",
    bio: "",
    avatarFile: null as File | null,
    avatarPreview: "",
  });

  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthDate: "",
        gender: "male",
        roleId: 2,
        favoritesGenres: [],
        accountType: ["local"],
        facebookId: "",
        googleId: "",
        bio: "",
        avatarFile: null,
        avatarPreview: ""
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    switch (field) {
      case 'password':
        setErrors((prev) => ({ ...prev, password: null }));

        if (value.length < 8 || value.length > 12) {
          setErrors((prev) => ({ ...prev, password: "Mật khẩu phải từ 8-12 ký tự" }));
        }

        // password khong duoc bat dau bang khoang trang hay so
        if (value.length > 0 && (value[0] === ' ' || !isNaN(Number(value[0])))) {
          setErrors((prev) => ({ ...prev, password: "Mật khẩu không được bắt đầu bằng khoảng trắng hoặc số" }));
        }

        // password khong duoc chua khoang trang
        if (value.includes(' ')) {
          setErrors((prev) => ({ ...prev, password: "Mật khẩu không được chứa khoảng trắng" }));
        }

        if (value.length === 0) {
          setErrors((prev) => ({ ...prev, password: null }));
        }

        break;
      case 'confirmPassword':
        setErrors((prev) => ({ ...prev, confirmPassword: null }));
        if (value !== formData.password) {
          setErrors((prev) => ({ ...prev, confirmPassword: "Mật khẩu nhập lại không khớp" }));
        }
        break;
      case 'username':
        if (errors.username) setErrors((prev) => ({ ...prev, username: null }));

        // username khong duoc chua khoang trang
        if (value.includes(' ')) {
          setErrors((prev) => ({ ...prev, username: "Username không được chứa khoảng trắng" }));
        }

        // username khong duoc rong
        if (value.length === 0) {
          setErrors((prev) => ({ ...prev, username: "Vui lòng nhập Username" }));
        }

        // username khong duoc qua dai
        if (value.length > 30) {
          setErrors((prev) => ({ ...prev, username: "Username không được quá 30 ký tự" }));
        }

        // username khong duoc chua ky tu dac biet
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/g;
        if (specialCharRegex.test(value)) {
          setErrors((prev) => ({ ...prev, username: "Username không được chứa ký tự đặc biệt" }));
        }

        // username khong duoc bat dau bang so
        if (value.length > 0 && !isNaN(Number(value[0]))) {
          setErrors((prev) => ({ ...prev, username: "Username không được bắt đầu bằng số" }));
        }

        // username khong duoc bat dau hay ket thuc bang dau gach ngang hoac gach duoi
        if (value.startsWith('-') || value.startsWith('_') || value.endsWith('-') || value.endsWith('_')) {
          setErrors((prev) => ({ ...prev, username: "Username không được bắt đầu hoặc kết thúc bằng dấu gạch ngang hoặc gạch dưới" }));
        }

        // username khong the co dau tieng viet
        const vietnameseCharRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
        if (vietnameseCharRegex.test(value)) {
          setErrors((prev) => ({ ...prev, username: "Username không được chứa dấu tiếng Việt" }));
        }
        break;
      default:
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
        break;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    }
  };

  const toggleGenre = (genre) => {
    setFormData(prev => {
      const genres = prev.favoritesGenres.includes(genre)
        ? prev.favoritesGenres.filter(g => g !== genre)
        : [...prev.favoritesGenres, genre];
      return { ...prev, favoritesGenres: genres };
    });
  };

  const toggleAccountType = (type) => {
    setFormData(prev => {
      const types = prev.accountType.includes(type)
        ? prev.accountType.filter(t => t !== type)
        : [...prev.accountType, type];
      return { ...prev, accountType: types };
    });
    if (errors.accountType) setErrors((prev: any) => ({ ...prev, accountType: null }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.username) newErrors.username = "Vui lòng nhập Username";
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập Họ tên";

    // Validate Account Types
    if (formData.accountType.length === 0) {
      newErrors.accountType = "Chọn ít nhất 1 loại tài khoản";
    } else {
      if (formData.accountType.includes("local") && !formData.email) {
        newErrors.email = "Email bắt buộc cho tài khoản Local/Google";
      }
      if (formData.accountType.includes("google") && !formData.email) {
        newErrors.email = "Email bắt buộc cho tài khoản Google";
      }
      if (formData.accountType.includes("google") && !formData.googleId) {
        newErrors.googleId = "Google ID bắt buộc";
      }
      if (formData.accountType.includes("facebook") && !formData.facebookId) {
        newErrors.facebookId = "Facebook ID bắt buộc";
      }
    }

    // date of birth khong sau hom nay
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = "Ngày sinh không hợp lệ";
      }
    }

    // email hop le
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Người Dùng Mới"
    >
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center">
          <button className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-blue-500 transition-colors bg-gray-50"
            onClick={() => fileInputRef.current?.click()} >
            {formData.avatarPreview ? (
              <Image
                src={formData.avatarPreview}
                width={500}
                height={500}
                alt="Picture of the author"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">Nhấn để tải ảnh đại diện</p>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
            <Input
              value={formData.username}
              onChange={(e: any) => handleChange("username", e.target.value)}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              placeholder="batbuoc@neu.chon.local"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </div>

          {/* password */}
          <div>
            <label>Mật khẩu</label>
            <Input
              type="password"
              value={formData.password}
              className={errors.password ? "border-red-500" : ""}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {errors.password ? <p className="text-xs text-red-500 mt-1">{errors.password}</p> : <p className="text-xs text-gray-500 mt-1 italic">Mật khẩu mặc định là "sapassword"</p>}
          </div>
          <div>
            <label>Nhập lại mật khẩu</label>
            <Input
              type="password"
              value={formData.confirmPassword}
              className={errors.confirmPassword ? "border-red-500" : ""}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword ? <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p> : null}
          </div>
        </div>

        {/* Gender & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <div className="flex gap-4">
              {["male", "female"].map((g) => (
                <label key={g} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{g === 'male' ? 'Nam' : 'Nữ'}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.roleId}
              onChange={(e) => handleChange("roleId", Number(e.target.value))}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Favorites */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sở thích âm nhạc</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${formData.favoritesGenres.includes(genre.name)
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {genre.name} {formData.favoritesGenres.includes(genre.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Account Types - Complex Logic */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài khoản (Bắt buộc chọn 1) <span className="text-red-500">*</span></label>
          {errors.accountType && <p className="text-xs text-red-500">{errors.accountType}</p>}

          <div className="space-y-3">
            {/* Local */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="type-local"
                checked={formData.accountType.includes("local")}
                onChange={() => toggleAccountType("local")}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="type-local" className="text-sm font-medium cursor-pointer">Local (Yêu cầu Email)</label>
              </div>
            </div>

            {/* Facebook */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="type-facebook"
                  checked={formData.accountType.includes("facebook")}
                  onChange={() => toggleAccountType("facebook")}
                  className="mt-1"
                />
                <label htmlFor="type-facebook" className="text-sm font-medium cursor-pointer">Facebook</label>
              </div>
              {formData.accountType.includes("facebook") && (
                <div className="ml-6">
                  <Input
                    placeholder="Nhập Facebook ID"
                    value={formData.facebookId}
                    onChange={(e: any) => handleChange("facebookId", e.target.value)}
                    className={`h-8 ${errors.facebookId ? "border-red-500" : ""}`}
                  />
                  {errors.facebookId && <p className="text-xs text-red-500 mt-1">{errors.facebookId}</p>}
                </div>
              )}
            </div>

            {/* Google */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="type-google"
                  checked={formData.accountType.includes("google")}
                  onChange={() => toggleAccountType("google")}
                  className="mt-1"
                />
                <label htmlFor="type-google" className="text-sm font-medium cursor-pointer">Google</label>
              </div>
              {formData.accountType.includes("google") && (
                <div className="ml-6 space-y-2">
                  <p className="text-xs text-gray-500 italic">Yêu cầu Email và Google ID</p>
                  <Input
                    placeholder="Nhập Google ID"
                    value={formData.googleId}
                    onChange={(e: any) => handleChange("googleId", e.target.value)}
                    className={`h-8 ${errors.googleId ? "border-red-500" : ""}`}
                  />
                  {errors.googleId && <p className="text-xs text-red-500 mt-1">{errors.googleId}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu (Bio)</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
        <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSubmit}>
          <Check className="w-4 h-4 mr-2" /> Lưu người dùng
        </Button>
      </div>
    </Modal>
  );
};

export default CreateUserModal;