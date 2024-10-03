'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Snackbar,
  Alert,
  TextField,
} from '@mui/material';

type Question = {
  id: string;
  question: string;
  category: string;
  isOpenEnded: boolean; 
  followUpQuestion?: boolean;
};

type Answer = {
  [key: string]: number | string; 
};

export default function SurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showFollowUp, setShowFollowUp] = useState<{ [key: string]: boolean }>({}); 
  const [followUpAnswers, setFollowUpAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/questions');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data: Question[] = await response.json();
  
        const filteredQuestions = data.filter(question => !question.followUpQuestion);
  
        setQuestions(filteredQuestions); 
        const initialAnswers = filteredQuestions.reduce((acc: Answer, question: Question) => {
          acc[question.id] = question.isOpenEnded ? '' : 0; 
          return acc;
        }, {});
        setAnswers(initialAnswers);
      } catch (err) {
        setError('Failed to fetch questions');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
  
    fetchQuestions();
  }, []);
  

  const groupedQuestions = questions.reduce((acc: Record<string, Question[]>, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {});

  const categories = Object.keys(groupedQuestions);
  const currentCategory = categories[currentCategoryIndex];
  const questionsInCategory = groupedQuestions[currentCategory] || [];

  const handleAnswerChange = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (questionId === '66e037579b35f841a38f258d' || questionId === '66e0392a9b35f841a38f258e') {
      setShowFollowUp((prev) => ({
        ...prev,
        [questionId]: value === 1 || value === 2,
      }));
    }
    if (questionId !== '66e037579b35f841a38f258d' && questionId !== '66e0392a9b35f841a38f258e') {
      setFollowUpAnswers((prev) => ({ ...prev, [questionId]: '' }));
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerId: 'sampleReviewerId',
          revieweeId: 'sampleRevieweeId',
          surveyId: 'sampleSurveyId',
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
          followUpAnswers, // Include follow-up answers in the submission
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }
      setSubmissionStatus({ success: true, message: 'Answers submitted successfully!' });
    } catch (error) {
      console.error('Error submitting answers:', error);
      setSubmissionStatus({ success: false, message: 'Failed to submit answers' });
    }
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Survey
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {currentCategory}
        </Typography>
      </Box>

      <Box>
        {questionsInCategory.length === 0 ? (
          <Typography>No questions available in this category.</Typography>
        ) : (
          <Box mb={4}>
            {questionsInCategory.map((question) => (
              <Box key={question.id} mb={2}>
                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                  {question.question}
                </Typography>
                {question.isOpenEnded ? (
                  <TextField
                    label="Your Answer"
                    variant="outlined"
                    multiline
                    rows={4}
                    fullWidth
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                ) : (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                      row
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <FormControlLabel
                        value={1}
                        control={<Radio />}
                        label="Needs Improvement"
                        sx={{ margin: '0 8px' }}
                      />
                      <FormControlLabel
                        value={2}
                        control={<Radio />}
                        label="Below Expectations"
                        sx={{ margin: '0 8px' }}
                      />
                      <FormControlLabel
                        value={3}
                        control={<Radio />}
                        label="Meets Expectations"
                        sx={{ margin: '0 8px' }}
                      />
                      <FormControlLabel
                        value={4}
                        control={<Radio />}
                        label="Exceeds Expectations"
                        sx={{ margin: '0 8px' }}
                      />
                      <FormControlLabel
                        value={5}
                        control={<Radio />}
                        label="Excellent"
                        sx={{ margin: '0 8px' }}
                      />
                    </RadioGroup>
                  </FormControl>
                )}

                {['66e037579b35f841a38f258d', '66e0392a9b35f841a38f258e'].includes(question.id) &&
                  showFollowUp[question.id] && (
                    <Box mt={2}>
                      <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                        {question.question}
                      </Typography>
                      <TextField
                        label="Your Answer"
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        value={followUpAnswers[question.id] || ''}
                        onChange={(e) =>
                          setFollowUpAnswers((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                      />
                    </Box>
                  )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box display="flex" justifyContent="space-between" mb={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePreviousCategory}
          disabled={currentCategoryIndex === 0}
        >
          Previous
        </Button>
        {currentCategoryIndex === categories.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextCategory}
          >
            Next
          </Button>
        )}
      </Box>

      {submissionStatus && (
        <Snackbar
          open={Boolean(submissionStatus)}
          autoHideDuration={6000}
          onClose={() => setSubmissionStatus(null)}
        >
          <Alert
            onClose={() => setSubmissionStatus(null)}
            severity={submissionStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {submissionStatus.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
