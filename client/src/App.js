import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const App = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      flexDirection="column"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h4">Employee Management System</Typography>
      <Typography variant="body1">Loading...</Typography>
    </Box>
  );
};

export default App;
