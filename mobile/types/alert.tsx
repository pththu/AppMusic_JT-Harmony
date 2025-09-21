export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
}

export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type ButtonStyle = 'default' | 'cancel' | 'destructive';