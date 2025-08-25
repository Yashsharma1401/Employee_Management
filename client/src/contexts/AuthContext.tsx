import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, ApiResponse } from '../types';
import { apiService, tokenUtils } from '../services/api.ts';
import toast from 'react-hot-toast';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiService.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/login',
        { email, password }
      );

      if (response.data.status === 'success' && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store token
        tokenUtils.set(token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });

        toast.success(`Welcome back, ${user.firstName}!`);
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  // Logout function
  const logout = (): void => {
    try {
      // Call logout API
      apiService.post('/auth/logout').catch(() => {
        // Ignore logout API errors
      });
    } catch (error) {
      // Ignore errors during logout
    } finally {
      // Clear token and state
      tokenUtils.remove();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiService.patch<ApiResponse<{ user: User }>>(
        '/auth/me',
        userData
      );

      if (response.data.status === 'success' && response.data.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user,
        });
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Update failed');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Update failed. Please try again.';
      toast.error(message);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check authentication on app load
  const checkAuth = async (): Promise<void> => {
    const token = tokenUtils.get();
    
    if (!token || !tokenUtils.isValid()) {
      dispatch({ type: 'AUTH_FAILURE' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiService.get<ApiResponse<{ user: User }>>('/auth/me');

      if (response.data.status === 'success' && response.data.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.data.user,
            token,
          },
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
        tokenUtils.remove();
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      tokenUtils.remove();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
