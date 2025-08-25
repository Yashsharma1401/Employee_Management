import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  AccessTime,
  EventNote,
  Payment,
  Assessment,
  Settings,
  Logout,
  Person,
  Business,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactElement;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Dashboard />,
  },
  {
    title: 'Employees',
    path: '/employees',
    icon: <People />,
    roles: ['super_admin', 'admin', 'hr', 'manager'],
  },
  {
    title: 'Attendance',
    path: '/attendance',
    icon: <AccessTime />,
  },
  {
    title: 'Leave Management',
    path: '/leave',
    icon: <EventNote />,
  },
  {
    title: 'Payroll',
    path: '/payroll',
    icon: <Payment />,
  },
  {
    title: 'Performance',
    path: '/performance',
    icon: <Assessment />,
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const drawer = (
    <Box className="h-full bg-gradient-to-b from-blue-600 to-blue-700">
      <Toolbar className="bg-blue-800">
        <Box display="flex" alignItems="center" gap={2}>
          <Business className="text-white" />
          <Typography variant="h6" className="text-white font-bold">
            EMS
          </Typography>
        </Box>
      </Toolbar>
      
      <Box p={2}>
        <Box
          className="bg-white/10 rounded-lg p-3 mb-4 text-white"
          textAlign="center"
        >
          <Avatar
            className="mx-auto mb-2 bg-white text-blue-600"
            sx={{ width: 50, height: 50 }}
          >
            {user?.firstName?.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" className="font-medium">
            {user?.fullName}
          </Typography>
          <Typography variant="caption" className="opacity-75">
            {user?.designation}
          </Typography>
        </Box>
      </Box>

      <Divider className="border-white/20" />
      
      <List className="px-2">
        {filteredNavigationItems.map((item) => (
          <ListItem key={item.path} disablePadding className="mb-1">
            <ListItemButton
              onClick={() => navigate(item.path)}
              className={`sidebar-item text-white ${
                location.pathname === item.path ? 'active' : ''
              }`}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                ...(location.pathname === item.path && {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }),
              }}
            >
              <ListItemIcon className="text-white min-w-0 mr-3">
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.title || 'Dashboard'}
          </Typography>

          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar
                src={user?.profileImage}
                className="bg-blue-500"
                sx={{ width: 32, height: 32 }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
