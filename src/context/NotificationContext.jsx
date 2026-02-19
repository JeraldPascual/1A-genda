import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';


/**
 * React context for global notification (toast) messages.
 * Provides a showToast function to display alerts across the app.
 * @typedef {Object} NotificationContextValue
 * @property {function(string, string=):void} showToast - Show a toast message with optional severity.
 */
const NotificationContext = createContext(null);


/**
 * Custom hook to access notification context.
 * Throws if used outside a NotificationProvider.
 * @returns {NotificationContextValue}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

/**
 * Provides notification context and renders a global Snackbar/Alert for toasts.
 * Wrap your app with this provider to enable showToast in children.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to receive notification context.
 * @returns {JSX.Element}
 */
export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState('info');

  const showToast = useCallback((message, level = 'info') => {
    setMsg(message);
    setSeverity(level);
    setOpen(true);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
