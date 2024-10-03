'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';

type Question = {
  question: string;
  category: string;
  isOpenEnded: boolean;
  followUpQuestion?: boolean;
};

type Answer = {
  [key: string]: number | string; // Now the key will be the question text itself
};

export default function SurveyAnswerPage({ params }: { params: { surveyId: string } }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showFollowUp, setShowFollowUp] = useState<{ [key: string]: boolean }>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<{ [key: string]: string }>({});
  const searchParams = useSearchParams();
  const survey = useRef(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/answers?surveyId=${params.surveyId}`);
        const data = await res.json();
        // Filter out the surveys for the given reviewerId
        survey.current = data.filter((survey: any) => survey.reviewerId === searchParams.get('reviewerId'))[0];
        const filteredQuestions = survey.current.answers.filter((question: any) => !question.followUpQuestion);
        setQuestions(filteredQuestions);

        const initialAnswers = filteredQuestions.reduce((acc: Answer, question: Question) => {
          acc[question.question] = question.isOpenEnded ? '' : 0; // Use question text as the key
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
  }, [params.surveyId, searchParams]);

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

  const handleAnswerChange = (question: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async () => {
    const answerList = Object.entries(answers).map(([question, answer]) => {
      // Find the corresponding question to get `isOpenEnded`
      const matchedQuestion = questions.find((q) => q.question === question);
      const isOpenEnded = matchedQuestion ? matchedQuestion.isOpenEnded : false;
      const category = matchedQuestion?.category
      return {
        question,  // The question text
        answer,    // The user's answer
        isOpenEnded,
        category
      };
    });

    const newVal = {
      reviewerId: searchParams.get('reviewerId'),
      revieweeId: survey.current.revieweeId,
      surveyId: params.surveyId,
      answers: answerList, // Use the updated answer list
      followUpAnswers,
    };

    survey.current = {
      ...survey.current,
      ...newVal
    };

    try {
      const response = await fetch('/api/answers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerListId: survey.current.id,
          answers: survey.current.answers
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }
      setSubmissionStatus({ success: true, message: 'Answers submitted successfully!' });
      router.push("/survey");
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
              <Box key={question.question} mb={4} p={2} sx={{ border: '1px solid #ddd', borderRadius: '8px' }}>
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
                    value={answers[question.question] || ''}
                    onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                  />
                ) : (
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={answers[question.question] || 0}
                      onChange={(e) => handleAnswerChange(question.question, parseInt(e.target.value))}
                      row
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

                {/* Handle follow-up questions */}
                {showFollowUp[question.question] && (
                  <Box mt={2}>
                    <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                      Follow-up Question:
                    </Typography>
                    <TextField
                      label="Your Answer"
                      variant="outlined"
                      multiline
                      rows={4}
                      fullWidth
                      value={followUpAnswers[question.question] || ''}
                      onChange={(e) =>
                        setFollowUpAnswers((prev) => ({
                          ...prev,
                          [question.question]: e.target.value,
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
