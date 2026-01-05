import { useState } from 'react';
import { TextField, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LogIn, LayoutDashboard, AlertCircle, X } from 'lucide-react';
import { Mail } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { signIn } = useAuth();
  const { resetPassword } = useAuth();
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(to right, #0ea5e9 1px, transparent 1px),
          linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem'
      }}></div>

      {/* Scattered gradient rectangles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -left-40 w-[600px] h-[200px] bg-cyan-500/20 -rotate-12 filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-blue-500/20 rotate-45 filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[180px] bg-purple-500/20 rotate-12 filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-8">
          <LayoutDashboard className="w-10 h-10 md:w-16 md:h-16 text-cyan-400" />
          <h1 className="text-4xl md:text-7xl font-black bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            1A-genda
          </h1>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Your Academic <span className="text-cyan-400">Task Management</span><br />Made Simple
        </h2>

        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Stay organized, track progress, and never miss a deadline. Built for students who want to excel.
        </p>

        <div className="flex gap-3 justify-center mb-8">
          <Button
            variant="contained"
            size="medium"
            onClick={() => setShowLoginDialog(true)}
            startIcon={<LogIn className="w-4 h-4" />}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
              }
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            size="medium"
            onClick={onSwitchToRegister}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '0.625rem',
              borderColor: '#06b6d4',
              color: '#06b6d4',
              '&:hover': {
                borderColor: '#0891b2',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
              }
            }}
          >
            Create Account
          </Button>
        </div>

        {/* Breadcrumb features */}
        <div className="flex flex-wrap gap-3 justify-center text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            Kanban
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            Progress
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Announcements
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
            Collaboration
          </span>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Sign In</h3>
              <IconButton onClick={() => setShowLoginDialog(false)} size="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <X />
              </IconButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-danger-600 bg-opacity-20 border border-danger-600 border-opacity-30 text-danger-400 px-4 py-3 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <TextField
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
                required
                fullWidth
                variant="outlined"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(6, 182, 212, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.15)',
                      '& fieldset': {
                        borderColor: '#06b6d4',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#06b6d4',
                    fontWeight: 600,
                  },
                }}
              />

              <TextField
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                fullWidth
                variant="outlined"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(6, 182, 212, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.15)',
                      '& fieldset': {
                        borderColor: '#06b6d4',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#06b6d4',
                    fontWeight: 600,
                  },
                }}
              />
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-sm text-cyan-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                fullWidth
                startIcon={<LogIn />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Forgot Password Dialog */}
            <Dialog
              open={showForgotDialog}
              onClose={() => setShowForgotDialog(false)}
              maxWidth="xs"
              fullWidth
              PaperProps={{ sx: { borderRadius: '1rem' } }}
            >
              <DialogContent>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Reset Password</h4>
                    <IconButton onClick={() => setShowForgotDialog(false)} size="small">
                      <X />
                    </IconButton>
                  </div>

                  <p className="text-sm text-slate-500 mb-3">Enter your account email and we'll send a link to reset your password.</p>

                  <TextField
                    id="forgot-email"
                    type="email"
                    label="Email Address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@school.edu"
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{ startAdornment: <Mail className="mr-2" /> }}
                    sx={{ mb: 3 }}
                  />

                  {forgotMessage && (
                    <div className={`mb-3 text-sm ${forgotError ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {forgotMessage}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outlined"
                      onClick={() => setShowForgotDialog(false)}
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={async () => {
                        setForgotError(false);
                        setForgotMessage('');
                        setForgotLoading(true);
                        const emailToUse = forgotEmail || email;
                        const res = await resetPassword(emailToUse);
                        setForgotLoading(false);
                        if (res.success) {
                          setForgotMessage('Password reset email sent. Check your inbox.');
                          setForgotError(false);
                        } else {
                          setForgotMessage(res.error || 'Failed to send reset email.');
                          setForgotError(true);
                        }
                      }}
                    >
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setShowLoginDialog(false);
                    onSwitchToRegister();
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
