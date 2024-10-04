'use client'

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import { Questions } from '@prisma/client';
import { useRouter } from 'next/navigation';

export default function CreateSurvey() {
    const roles = ["Developers", "Requirement Engineer", "Managers"];
    const [devQuestions, setDevQuestions] = useState<Questions[]>([]);
    const [reQuestions, setReQuestions] = useState<Questions[]>([]);
    const [managerQuestions, setManagerQuestions] = useState<Questions[]>([]);
    const [checkedQuestions, setCheckedQuestions] = useState<{ [id: string]: boolean }>({});
    const [questionList, setQuestionList] = useState<Questions[]>([]);
    const [currRoleQuestionSelection, setCurrRoleQuestionSelection] = useState(0);
    const [surveyName, setSurveyName] = useState('');
    const router = useRouter()
    useEffect(() => {
       fetchQuestions();
    }, []);
    const handleQuestionSelect = (question: Questions, isChecked: boolean) => {
        if (roles[currRoleQuestionSelection] === "Developers")  {
            setDevQuestions(prev => {
                return isChecked ? [...prev, question] : prev.filter(q => q.id !== question.id);
            });
        } else if (roles[currRoleQuestionSelection] === "Requirement Engineer") {
            setReQuestions(prev => {
                return isChecked ? [...prev, question] : prev.filter(q => q.id !== question.id);
            });
        } else {
            setManagerQuestions(prev => {
                return isChecked ? [...prev, question] : prev.filter(q => q.id !== question.id);
            });
        }

        setCheckedQuestions(prev => ({
            ...prev,
            [question.id]: isChecked
        }));
    };

    const handleSubmit = () => {
        if (currRoleQuestionSelection < roles.length - 1) {
            setCurrRoleQuestionSelection(prev => prev + 1);
            setCheckedQuestions({});
        } else {
            let survey = {
                creatorId: "66ea71380a379e73dffb6783",
                surveyName: surveyName,
                devQuestionList: devQuestions,
                reQuestionList: reQuestions,
                managerQuestionList: managerQuestions
            };
            createSurvey(survey);
            console.log("Done");
            
            router.push("/dashboard/send-survey/reviewee")
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions", {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setQuestionList(result);
        } catch(error) {
            console.error("Error getting questions: ", error);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div>
                <h1>Create Survey</h1>
                {currRoleQuestionSelection === 0 && (
                    <Box sx={{ mb: 2 }}>
                        <input
                            type="text"
                            placeholder="Enter Survey Name"
                            value={surveyName}
                            onChange={(e) => setSurveyName(e.target.value)}
                            style={{ padding: '8px', fontSize: '16px', width: '100%' }}
                        />
                    </Box>
                )}
                <h2>Select questions for {roles[currRoleQuestionSelection]}</h2>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell>Question</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questionList.map((question) => (
                                <TableRow key={question.id}>
                                    <TableCell>{question.category}</TableCell>
                                    <TableCell>{question.question}</TableCell>
                                    <TableCell>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={checkedQuestions[question.id] || false}
                                                    onChange={(e) => handleQuestionSelect(question, e.target.checked)}
                                                />
                                            }
                                            label="Select"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2 }}>
                    <Button onClick={handleSubmit} variant="contained">
                        {currRoleQuestionSelection < roles.length - 1 ? "Next" : "Submit"}
                    </Button>
                </Box>
            </div>
        </main>
    );
}

const createSurvey = async (survey: any) => {
    try {
        const res = await fetch('/api/survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(survey)
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        console.log('Survey created:', result);
        return result;
    } catch(error) {
        console.error('Error creating survey:', error);
    }
};
