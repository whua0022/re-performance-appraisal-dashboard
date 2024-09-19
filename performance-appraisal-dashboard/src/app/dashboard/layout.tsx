import Navbar from './/Navbar';
import { Box } from '@mui/material';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Navbar />
      <Box component="main" sx={{ padding: 2 }}>
        {children}
      </Box>
    </Box>
  );
}
