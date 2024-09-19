'use client';
import { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, List, ListItem, ListItemText, Divider, 
  Box, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, Snackbar, Alert, IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

type Question = { id: string; question: string; category: string };

export default function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState({ add: false, edit: false });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    try {
      const res = await fetch('/api/questions');
      if (!res.ok) throw new Error();
      setQuestions(await res.json());
    } catch { setError('Failed to fetch questions'); } 
    finally { setLoading(false); }
  }

  const handleDialogOpen = (type: 'add' | 'edit', question: Question | null = null) => {
    setOpenDialog({ add: type === 'add', edit: type === 'edit' });
    setCurrentQuestion(question);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentQuestion) setCurrentQuestion({ ...currentQuestion, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (method: 'POST' | 'PUT', url: string, body: any) => {
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      setSubmissionStatus({ success: true, message: `Question ${method === 'POST' ? 'added' : 'updated'} successfully!` });
      fetchQuestions(); handleDialogClose();
    } catch { setSubmissionStatus({ success: false, message: `Failed to ${method === 'POST' ? 'add' : 'update'} question` }); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSubmissionStatus({ success: true, message: 'Question deleted successfully!' });
      fetchQuestions();
    } catch { setSubmissionStatus({ success: false, message: 'Failed to delete question' }); }
  };

  const handleDialogClose = () => setOpenDialog({ add: false, edit: false });

  const groupedQuestions = questions.reduce((acc: Record<string, Question[]>, q) => {
    acc[q.category] = acc[q.category] || []; acc[q.category].push(q); return acc;
  }, {});

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Questions</Typography>
      <Button variant="contained" onClick={() => handleDialogOpen('add')} sx={{ mb: 4 }}>Add Question</Button>

      {Object.keys(groupedQuestions).length === 0 ? (
        <Typography>No questions available.</Typography>
      ) : (
        Object.entries(groupedQuestions).map(([category, questions]) => (
          <Box key={category} mb={4}>
            <Typography variant="h5" fontWeight="bold">{category}</Typography>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2, p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {questions.map(q => (
                    <div key={q.id}>
                      <ListItem sx={{ px: 3, py: 2 }}>
                        <ListItemText primary={q.question} primaryTypographyProps={{ fontSize: '1rem' }} />
                        <IconButton onClick={() => handleDialogOpen('edit', q)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(q.id)}><DeleteIcon /></IconButton>
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

      <Dialog open={openDialog.add || openDialog.edit} onClose={handleDialogClose}>
        <DialogTitle>{openDialog.add ? 'Add New Question' : 'Edit Question'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Question"
            name="question"
            fullWidth
            variant="standard"
            value={currentQuestion?.question || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Category"
            name="category"
            fullWidth
            variant="standard"
            value={currentQuestion?.category || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={() => handleSubmit(openDialog.add ? 'POST' : 'PUT', `/api/questions${openDialog.edit ? `/${currentQuestion?.id}` : ''}`, currentQuestion)}>Submit</Button>
        </DialogActions>
      </Dialog>

      {submissionStatus && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSubmissionStatus(null)}>
          <Alert onClose={() => setSubmissionStatus(null)} severity={submissionStatus.success ? 'success' : 'error'}>
            {submissionStatus.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
