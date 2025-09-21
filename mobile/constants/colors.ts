const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const ALERT_COLORS = {
  LIGHT: {
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
    BACKGROUND: '#FFFFFF',
    TEXT_PRIMARY: '#1F2937',
    TEXT_SECONDARY: '#6B7280',
    BORDER: '#E5E7EB',
    BACKDROP: 'rgba(0, 0, 0, 0.5)',
  },
  DARK: {
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
    BACKGROUND: '#1F2937',
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#D1D5DB',
    BORDER: '#4B5563',
    BACKDROP: 'rgba(0, 0, 0, 0.7)',
  },
};