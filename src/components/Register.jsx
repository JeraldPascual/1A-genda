import { useState } from 'react';
import { TextField, Button, MenuItem, Dialog, DialogContent, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LayoutDashboard, AlertCircle, X } from 'lucide-react';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    batch: '1A1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Restrict admin role to specific email
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
    if (formData.role === 'admin' && formData.email !== ADMIN_EMAIL) {
      setError('Admin registration is restricted. Please register as a student.');
      return;
    }

    setLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      formData.displayName,
      formData.role,
      formData.role === 'student' ? formData.batch : null
    );

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(to right, #a855f7 1px, transparent 1px),
          linear-gradient(to bottom, #a855f7 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem'
      }}></div>

      {/* Scattered gradient rectangles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -left-40 w-[600px] h-[200px] bg-purple-500/20 -rotate-12 filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-pink-500/20 rotate-45 filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[180px] bg-cyan-500/20 rotate-12 filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-8">
          <LayoutDashboard className="w-10 h-10 md:w-16 md:h-16 text-purple-400" />
          <h1 className="text-4xl md:text-7xl font-black bg-linear-to-r from-purple-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
            1A-genda
          </h1>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Join Your Team and <span className="text-purple-400">Start Winning</span><br />at Task Management
        </h2>

        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join your BSIT 1A classmates in managing lab tasks for IT 105, IT 107, and IT 106. Stay organized with your batch (1A1 or 1A2) and never miss a deadline.
        </p>

        <div className="flex flex-col items-center gap-3 mb-8">
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowRegisterDialog(true)}
            startIcon={<UserPlus className="w-5 h-5" />}
            sx={{
              px: 6,
              py: 1.75,
              fontSize: '1.125rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                boxShadow: '0 12px 40px rgba(168, 85, 247, 0.45)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Create Your Account
          </Button>

          <div className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-purple-400/40 underline-offset-4 hover:decoration-purple-300 transition-all"
            >
              Sign in here
            </button>
          </div>
        </div>

        {/* Breadcrumb features */}
        <div className="flex flex-wrap gap-3 justify-center text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Kanban
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            Progress
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            Announcements
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
            Collaboration
          </span>
        </div>
      </div>

      {/* Register Dialog */}
      <Dialog
        open={showRegisterDialog}
        onClose={() => setShowRegisterDialog(false)}
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
              <h3 className="text-2xl font-bold text-white">Create Account</h3>
              <IconButton onClick={() => setShowRegisterDialog(false)} size="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <X />
              </IconButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <TextField
                name="displayName"
                type="text"
                label="Full Name"
                value={formData.displayName}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.15)',
                      '& fieldset': {
                        borderColor: '#a855f7',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#a855f7',
                    fontWeight: 600,
                  },
                }}
              />

              <TextField
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.15)',
                      '& fieldset': {
                        borderColor: '#a855f7',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#a855f7',
                    fontWeight: 600,
                  },
                }}
              />

              <TextField
                name="role"
                select
                label="Role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.15)',
                      '& fieldset': {
                        borderColor: '#a855f7',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#a855f7',
                    fontWeight: 600,
                  },
                }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin (P.I.O.)</MenuItem>
              </TextField>

              {formData.role === 'student' && (
                <TextField
                  name="batch"
                  select
                  label="Lab Batch"
                  value={formData.batch}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '& fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        borderWidth: '2px',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': {
                          borderColor: 'rgba(168, 85, 247, 0.5)',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.15)',
                        '& fieldset': {
                          borderColor: '#a855f7',
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 500,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#a855f7',
                      fontWeight: 600,
                    },
                  }}
                >
                  <MenuItem value="1A1">1A1</MenuItem>
                  <MenuItem value="1A2">1A2</MenuItem>
                </TextField>
              )}

              <TextField
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.15)',
                      '& fieldset': {
                        borderColor: '#a855f7',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#a855f7',
                    fontWeight: 600,
                  },
                }}
              />

              <TextField
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.15)',
                      '& fieldset': {
                        borderColor: '#a855f7',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#a855f7',
                    fontWeight: 600,
                  },
                }}
              />

              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                fullWidth
                startIcon={<UserPlus />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(168, 85, 247, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowRegisterDialog(false);
                    onSwitchToLogin();
                  }}
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
