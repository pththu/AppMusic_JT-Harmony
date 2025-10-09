import { useAlert } from '../context/AlertContext';
import { AlertButton } from '../types/alert';

export const useCustomAlert = () => {
  const { showAlert, hideAlert } = useAlert();

  const alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    type?: 'info' | 'success' | 'warning' | 'error'
  ) => {
    showAlert({
      title,
      message,
      buttons,
      type,
    });
  };

  const confirm = (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: onConfirm,
        },
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: onCancel,
        }
      ],
    });
  };

  const success = (title: string, message?: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [
        {
          text: 'OK',
          onPress,
        },
      ],
    });
  };

  const error = (title: string, message?: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [
        {
          text: 'Đóng',
          onPress,
        },
      ],
    });
  };

  const warning = (title: string, message?: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [
        {
          text: 'Hiểu rồi',
          onPress,
        },
      ],
    });
  };

  return {
    alert,
    confirm,
    success,
    error,
    warning,
    hideAlert,
  };
};