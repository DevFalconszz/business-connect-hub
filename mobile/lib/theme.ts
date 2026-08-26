export const Colors = {
  bg: {
    base: '#0F0F14',
    surface: '#1A1A24',
    elevated: '#22222E',
    overlay: '#2A2A38',
  },
  primary: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  secondary: {
    400: '#26A69A',
    500: '#009688',
    600: '#00897B',
  },
  text: {
    primary: '#F0F0F5',
    secondary: '#A0A0B8',
    tertiary: '#6B6B82',
    inverse: '#0F0F14',
  },
  status: {
    success: '#4CAF50',
    successBg: '#1B3A1D',
    warning: '#FFA726',
    warningBg: '#3A2A10',
    error: '#EF5350',
    errorBg: '#3A1518',
    info: '#42A5F5',
    infoBg: '#0F2035',
  },
  border: {
    subtle: '#2A2A38',
    default: '#35354A',
    strong: '#4A4A62',
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const Font = {
  size: {
    displaySm: 28,
    h1: 26,
    h2: 22,
    h3: 18,
    h4: 16,
    bodyLg: 17,
    bodyMd: 15,
    bodySm: 14,
    caption: 13,
    overline: 11,
    mini: 10,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};
