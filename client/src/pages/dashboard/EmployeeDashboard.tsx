import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  AccessTime,
  EventNote,
  Payment,
  TrendingUp,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

// Mock data for demo purposes
const mockData = {
  todayAttendance: {
    clockIn: '09:15 AM',
    hoursWorked: '7.5',
    status: 'Present',
  },
  monthlyStats: {
    totalDays: 22,
    presentDays: 20,
    absentDays: 2,
    totalHours: 165,
  },
  leaveBalance: {
    annual: 18,
    sick: 8,
    personal: 3,
  },
  recentPayslip: {
    month: 'August 2024',
    amount: 75000,
    status: 'Paid',
  },
  upcomingEvents: [
    { title: 'Team Meeting', date: 'Tomorrow 10:00 AM', type: 'meeting' },
    { title: 'Project Deadline', date: 'Sep 15, 2024', type: 'deadline' },
    { title: 'Performance Review', date: 'Sep 20, 2024', type: 'review' },
  ],
};

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactElement;
    color: string;
    action?: React.ReactElement;
  }> = ({ title, value, subtitle, icon, color, action }) => (
    <Card className="dashboard-card h-full">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" className="font-bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar className={`bg-${color.split('.')[0]}-100`} sx={{ bgcolor: `${color}.light` }}>
            {React.cloneElement(icon, { className: `text-${color.split('.')[0]}-600` })}
          </Avatar>
        </Box>
        {action && action}
      </CardContent>
    </Card>
  );

  return (
    <Box className="animate-fade-in">
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h4" className="font-bold text-gray-800" gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your work today.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Status"
            value={mockData.todayAttendance.status}
            subtitle={`Clocked in at ${mockData.todayAttendance.clockIn}`}
            icon={<CheckCircle />}
            color="success"
            action={
              <Button size="small" variant="outlined" color="success">
                Clock Out
              </Button>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hours Today"
            value={mockData.todayAttendance.hoursWorked}
            subtitle="Target: 8.0 hours"
            icon={<AccessTime />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leave Balance"
            value={mockData.leaveBalance.annual}
            subtitle="Annual leaves available"
            icon={<EventNote />}
            color="warning"
            action={
              <Button size="small" variant="outlined" color="warning">
                Apply Leave
              </Button>
            }
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Last Salary"
            value={`₹${mockData.recentPayslip.amount.toLocaleString()}`}
            subtitle={mockData.recentPayslip.month}
            icon={<Payment />}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Attendance */}
        <Grid item xs={12} md={8}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                This Month's Attendance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" className="font-bold text-green-600">
                      {mockData.monthlyStats.presentDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Present Days
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" className="font-bold text-red-600">
                      {mockData.monthlyStats.absentDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Absent Days
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" className="font-bold text-blue-600">
                      {mockData.monthlyStats.totalHours}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" className="font-bold text-purple-600">
                      91%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Attendance Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(mockData.monthlyStats.presentDays / mockData.monthlyStats.totalDays) * 100}
                  className="h-2 rounded"
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={4}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Upcoming Events
              </Typography>
              
              <Box>
                {mockData.upcomingEvents.map((event, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    p={2}
                    mb={2}
                    className="bg-gray-50 rounded-lg"
                  >
                    <IconButton
                      size="small"
                      className={`mr-3 ${
                        event.type === 'meeting' ? 'text-blue-600' :
                        event.type === 'deadline' ? 'text-red-600' :
                        'text-green-600'
                      }`}
                    >
                      {event.type === 'meeting' ? <Schedule /> :
                       event.type === 'deadline' ? <Warning /> :
                       <TrendingUp />}
                    </IconButton>
                    <Box flex={1}>
                      <Typography variant="subtitle2" className="font-medium">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {event.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Leave Balance Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box textAlign="center" p={2} className="bg-blue-50 rounded-lg">
                    <Typography variant="h4" className="font-bold text-blue-600">
                      {mockData.leaveBalance.annual}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Annual
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box textAlign="center" p={2} className="bg-green-50 rounded-lg">
                    <Typography variant="h4" className="font-bold text-green-600">
                      {mockData.leaveBalance.sick}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sick
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box textAlign="center" p={2} className="bg-orange-50 rounded-lg">
                    <Typography variant="h4" className="font-bold text-orange-600">
                      {mockData.leaveBalance.personal}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Personal
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    className="py-3"
                    startIcon={<EventNote />}
                  >
                    Apply Leave
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    className="py-3"
                    startIcon={<Payment />}
                  >
                    View Payslip
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    className="py-3"
                    startIcon={<AccessTime />}
                  >
                    View Attendance
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    className="py-3"
                    startIcon={<TrendingUp />}
                  >
                    Performance
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
