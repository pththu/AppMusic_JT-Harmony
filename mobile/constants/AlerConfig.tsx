import { AlertButton, AlertType } from '@/types/alert';

export const DEFAULT_ALERT_BUTTONS: AlertButton[] = [
  {
    text: 'OK',
    style: 'default',
    onPress: () => {},
  },
];

export const ALERT_BUTTON_TEXTS = {
  OK: 'OK',
  CANCEL: 'Hủy',
  CONFIRM: 'Xác nhận',
  DELETE: 'Xóa',
  CLOSE: 'Đóng',
  UNDERSTAND: 'Hiểu rồi',
  SAVE: 'Lưu',
  MAYBE: 'Có thể',
} as const;

export const ALERT_TITLES = {
  SUCCESS: 'Thành công!',
  ERROR: 'Có lỗi xảy ra!',
  WARNING: 'Cảnh báo!',
  INFO: 'Thông tin',
  CONFIRM_DELETE: 'Xác nhận xóa',
  LOGOUT: 'Đăng xuất',
} as const;

export const ALERT_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Không thể đăng nhập. Vui lòng thử lại.',
  LOGOUT_CONFIRM: 'Bạn có chắc chắn muốn đăng xuất không?',
  DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa item này không? Hành động này không thể hoàn tác.',
  OPERATION_SUCCESS: 'Thao tác đã được thực hiện thành công.',
  OPERATION_FAILED: 'Không thể thực hiện thao tác. Vui lòng thử lại.',
  DATA_WARNING: 'Thao tác này có thể ảnh hưởng đến dữ liệu của bạn.',
} as const;

export const ALERT_ANIMATIONS = {
  DURATION: {
    SHOW: 200,
    HIDE: 150,
  },
  SPRING_CONFIG: {
    tension: 150,
    friction: 8,
  },
} as const;