import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Requirement Engineer Performance Appraisal Tool
        </Typography>
        <Button color="inherit" component={Link} href="/dashboard">
          Home
        </Button>
        <Button color="inherit" component={Link} href="/dashboard/create-survey">
          Create survey
        </Button>
        <Button color="inherit" component={Link} href="/dashboard/send-survey/reviewee">
          Send survey
        </Button>
      </Toolbar>
    </AppBar>
  );
}
