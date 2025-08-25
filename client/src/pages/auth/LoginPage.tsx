import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      
      const success = await login(values.email, values.password);
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password. Please try again.');
      }
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Container maxWidth="sm">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                className="mx-auto mb-4 bg-blue-500 text-white rounded-full flex items-center justify-center"
                width={80}
                height={80}
              >
                <Business fontSize="large" />
              </Box>
              <Typography variant="h4" component="h1" className="font-bold text-gray-800">
                Employee Management System
              </Typography>
              <Typography variant="body1" className="text-gray-600 mt-2">
                Sign in to access your account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={formik.handleSubmit}>
              <Box mb={3}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                className="mt-4 py-3"
                sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <Box mt={4} p={3} className="bg-gray-50 rounded-lg">
              <Typography variant="body2" className="text-gray-600 text-center mb-2">
                Demo Credentials
              </Typography>
              <Typography variant="caption" className="text-gray-500 block text-center">
                Admin: admin@ems.com / admin123
              </Typography>
              <Typography variant="caption" className="text-gray-500 block text-center">
                Employee: employee@ems.com / emp123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
