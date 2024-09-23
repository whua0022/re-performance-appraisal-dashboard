'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, List, ListItem, ListItemText, Divider, Box, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Question = {
  id: string; 
  question: string;
  category: string;
};

export default function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newQuestion, setNewQuestion] = useState<{ question: string; category: string }>({ question: '', category: '' });
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('Response was not ok');
      }
      const data: Question[] = await response.json();
      setQuestions(data);
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Fetch error:', err); 
    } finally {
      setLoading(false);
    }
  }

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleClickOpenEdit = (question: Question) => {
    setEditQuestion(question);
    setOpenEdit(true);
  };

  const handleClose = () => {
    setOpenAdd(false);
    setOpenEdit(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewQuestion({ ...newQuestion, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editQuestion) {
      setEditQuestion({ ...editQuestion, [e.target.name]: e.target.value });
    }
  };

  const handleSubmitAdd = async () => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      setSubmissionStatus({ success: true, message: 'Question added successfully!' });
      await fetchQuestions();
      handleClose();
    } catch (error) {
      console.error('Error adding question:', error);
      setSubmissionStatus({ success: false, message: 'Failed to add question' });
    }
  };

  const handleSubmitEdit = async () => {
    if (!editQuestion) return;
    try {
      const response = await fetch(`/api/questions/${editQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editQuestion),
      });
      if (!response.ok) {
        throw new Error('Failed to update question');
      }
      setSubmissionStatus({ success: true, message: 'Question updated successfully!' });
      await fetchQuestions();
      handleClose();
    } catch (error) {
      console.error('Error updating question:', error);
      setSubmissionStatus({ success: false, message: 'Failed to update question' });
    }
  };

  const handleDelete = async (id: string) => { 
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      setSubmissionStatus({ success: true, message: 'Question deleted successfully!' });
      await fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      setSubmissionStatus({ success: false, message: 'Failed to delete question' });
    }
  };

  const groupedQuestions = questions.reduce((acc: Record<string, Question[]>, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {});

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Questions
      </Typography>

      <Button variant="contained" color="primary" onClick={handleClickOpenAdd} sx={{ mb: 4 }}>
        Add Question
      </Button>

      {Object.keys(groupedQuestions).length === 0 ? (
        <Typography>No questions available.</Typography>
      ) : (
        Object.entries(groupedQuestions).map(([category, questionsInCategory]) => (
          <Box key={category} mb={4}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              {category}
            </Typography>
            <Card variant="outlined" sx={{
              borderRadius: '20px',
              boxShadow: 'none',
              mb: 2,
              padding: '16px',
            }}>
              <CardContent sx={{ padding: '0' }}>
                <List>
                  {questionsInCategory.map((question) => (
                    <div key={question.id}>
                      <ListItem sx={{ padding: '12px 24px' }}>
                        <ListItemText
                          primary={question.question}
                          primaryTypographyProps={{ fontSize: '1rem' }}
                        />
                        <IconButton onClick={() => handleClickOpenEdit(question)} sx={{ ml: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(question.id)} sx={{ ml: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        ))
      )}

      <Dialog open={openAdd} onClose={handleClose}>
        <DialogTitle>Add New Question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Question"
            type="text"
            fullWidth
            variant="standard"
            name="question"
            value={newQuestion.question}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Category"
            type="text"
            fullWidth
            variant="standard"
            name="category"
            value={newQuestion.category}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmitAdd}>Add Question</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={handleClose}>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          {editQuestion && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Question"
                type="text"
                fullWidth
                variant="standard"
                name="question"
                value={editQuestion.question}
                onChange={handleEditInputChange}
              />
              <TextField
                margin="dense"
                label="Category"
                type="text"
                fullWidth
                variant="standard"
                name="category"
                value={editQuestion.category}
                onChange={handleEditInputChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmitEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

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
