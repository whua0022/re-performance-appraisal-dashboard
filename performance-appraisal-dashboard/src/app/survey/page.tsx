'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Survey() {
  const [surveys, setSurveys] = useState([]);
  const [surveyNames, setSurveyNames] = useState({}); // Store survey names
  const [selectedSurvey, setSelectedSurvey] = useState(null); // Track selected survey
  const [open, setOpen] = useState(false); // Track modal open/close state
  const router = useRouter(); // Next.js router hook

  useEffect(() => {
    fetchSurveyAvailable();
  }, []);

  // Function to fetch available surveys
  const fetchSurveyAvailable = async () => {
    try {
      const res = await fetch("/api/answers?reviewerId=66ea71380a379e73dffb6783");
      const data = await res.json();

      setSurveys(data); // Store the fetched surveys

      const surveyNamesMap = {};
      
      // Fetch survey names sequentially using for...of loop
      for (const survey of data) {
        const name = await fetchSurveyName(survey.surveyId);
        surveyNamesMap[survey.surveyId] = name;
      }

      setSurveyNames(surveyNamesMap); // Set the survey names
    } catch (err) {
      console.log(err);
    }
  };

  // Function to fetch survey name by surveyId
  const fetchSurveyName = async (surveyId) => {
    try {
      const res = await fetch(`/api/survey?surveyId=${surveyId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(
          `Failed to fetch survey name for surveyId: ${surveyId}, status: ${res.status}`
        );
      }

      const data = await res.json();
      return data.name;
    } catch (error) {
      console.error('Error fetching survey name: ', error);
      return null;
    }
  };

  // Handle card click to open modal
  const handleCardClick = (surveyId) => {
    setSelectedSurvey(surveyId); // Set the selected surveyId
    setOpen(true); // Open the modal
  };

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
  };

  // Handle modal "Yes" click to route to the survey page
  const handleConfirm = () => {
    router.push(`/survey/${selectedSurvey}?reviewerId=66ea71380a379e73dffb6783`);
  };

  return (
    <main className="p-6">
      <Typography variant="h4" className="mb-4 text-center">Available Surveys</Typography>
      <Grid container spacing={4}>
        {surveys.map((survey) => (
          <Grid item key={survey.id} xs={12} sm={6} md={4}>
            <Card className="bg-white shadow" onClick={() => handleCardClick(survey.surveyId)} style={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {surveyNames[survey.surveyId] || 'Loading...'} {/* Show the survey name or 'Loading...' */}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {survey.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created At: {new Date(survey.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Start Survey"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to start the survey?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
