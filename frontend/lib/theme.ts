import { CSSProperties } from 'react';

export const colors = {
  primary: '#0066CC',
  primaryLight: '#E6F0FF',
  primaryDark: '#0052A3',
  secondary: '#66B366',
  secondaryLight: '#E6F5E6',
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  success: '#388E3C',
  successLight: '#E8F5E9',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray500: '#9E9E9E',
  gray700: '#424242',
  gray900: '#212121',
  text: '#212121',
  border: '#E0E0E0',
  background: '#FAFAFA',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
};

export const styles = {
  container: {
    padding: `${spacing.md}`,
    maxWidth: '1400px',
    margin: '0 auto',
  } as CSSProperties,

  containerLg: {
    padding: `${spacing.lg}`,
    maxWidth: '1400px',
    margin: '0 auto',
  } as CSSProperties,

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: `${spacing.lg}`,
  } as CSSProperties,

  cardCompact: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: `${spacing.md}`,
  } as CSSProperties,

  button: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${spacing.sm}`,
  } as CSSProperties,

  buttonPrimary: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: colors.primary,
    color: '#ffffff',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  buttonSecondary: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    border: `1px solid ${colors.primary}`,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: colors.primary,
    transition: 'all 0.2s ease',
  } as CSSProperties,

  buttonDanger: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: colors.danger,
    color: '#ffffff',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    fontFamily: 'inherit',
  } as CSSProperties,

  select: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    fontFamily: 'inherit',
  } as CSSProperties,

  badge: {
    padding: `2px 8px`,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  } as CSSProperties,

  badgePrimary: {
    padding: `2px 8px`,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  } as CSSProperties,

  badgeSuccess: {
    padding: `2px 8px`,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: colors.successLight,
    color: colors.success,
  } as CSSProperties,

  badgeDanger: {
    padding: `2px 8px`,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: colors.dangerLight,
    color: colors.danger,
  } as CSSProperties,

  flexRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
  } as CSSProperties,

  flexCol: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: `${spacing.lg}`,
  } as CSSProperties,

  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: `${spacing.lg}`,
  } as CSSProperties,

  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: `${spacing.lg}`,
  } as CSSProperties,

  header: {
    fontSize: '32px',
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: `${spacing.md}`,
  } as CSSProperties,

  subheader: {
    fontSize: '24px',
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: `${spacing.md}`,
  } as CSSProperties,

  text: {
    fontSize: '14px',
    color: colors.text,
    lineHeight: '1.5',
  } as CSSProperties,

  textSmall: {
    fontSize: '12px',
    color: colors.gray500,
    lineHeight: '1.4',
  } as CSSProperties,

  textMuted: {
    fontSize: '14px',
    color: colors.gray500,
  } as CSSProperties,

  alert: {
    padding: `${spacing.md}`,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${spacing.md}`,
  } as CSSProperties,

  alertSuccess: {
    padding: `${spacing.md}`,
    borderRadius: '6px',
    backgroundColor: colors.successLight,
    color: colors.success,
    border: `1px solid ${colors.success}`,
  } as CSSProperties,

  alertDanger: {
    padding: `${spacing.md}`,
    borderRadius: '6px',
    backgroundColor: colors.dangerLight,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
  } as CSSProperties,

  alertWarning: {
    padding: `${spacing.md}`,
    borderRadius: '6px',
    backgroundColor: colors.warningLight,
    color: colors.warning,
    border: `1px solid ${colors.warning}`,
  } as CSSProperties,
};

export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
};
