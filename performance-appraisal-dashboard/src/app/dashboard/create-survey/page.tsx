'use client'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import {Questions, QuestionCategory, Surveys} from '@prisma/client'

export default function CreateSurvey() {
    const roles = ["Developers", "Requirement Engineer", "Managers"]
    const [devQuestions, setDevQuestions] = useState<Questions[]>([])
    const [reQuestions, setReQuestions] = useState<Questions[]>([])
    const [managerQuestions, setManagerQuestions] = useState<Questions[]>([])
    const [checkedQuestions, setCheckedQuestions] = useState<{ [id: string]: boolean }>({})
    const [questionList, setQuestionList] = useState<Questions[]>([])
    useEffect(() => {
       fetchQuestions()
    }, [])

    const [currRoleQuestionSelection, setCurrRoleQuestionSelection] = useState(0);

    const handleQuestionSelect = (question: Questions, isChecked: boolean) => {

        if (roles[currRoleQuestionSelection] == "Developers")  {
            setDevQuestions(prev => {
                return isChecked ? [...prev, question] : prev.filter(q => q.id !== question.id)
            })
        } else if (roles[currRoleQuestionSelection] == "Requirement Engineer") {
            setReQuestions(prev => {
                return isChecked ? [...prev, question] : prev.filter(q => q.id !== question.id)
            })
        } else {
            setManagerQuestions(prev => {
                return isChecked ? [...prev, question] : prev.filter(q => q.id !== question.id)
            })
        }

        setCheckedQuestions(prev => ({
            ...prev,
            [question.id]: isChecked
        }));
    }

    const handleSubmit = () => {
        if (currRoleQuestionSelection < roles.length - 1) {
            setCurrRoleQuestionSelection(prev => prev + 1)
            setCheckedQuestions({})
        } else {
            let survey = {
                creatorId: "1",
                devQuestionList: devQuestions,
                reQuestionList: reQuestions,
                managerQuestionList: managerQuestions
            }
            //Submit here
            createSurvey(survey)
            console.log("Done")
        }
    }

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions", {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            })
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const result = await res.json()
            setQuestionList(() => result)
        } catch(error) {
            console.error("Error getting questions: ", error)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div>
                <h1>Select a question for {roles[currRoleQuestionSelection]}</h1>
                {/* TODO ADD SURVEY NAME INPUT */}
                <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    <nav aria-label="main">
                        <List>
                        {
                            questionList.map((question, index) => (
                                <FormGroup key={index}>
                                    <FormControlLabel control={<Checkbox checked={checkedQuestions[question.id] || false} onChange={(e) => handleQuestionSelect(question, e.target.checked)}/>} label={question.question} />
                                </FormGroup>
                            ))
                        }   
                        </List>
                    </nav>
                </Box>
                {
                    currRoleQuestionSelection === roles.length ? <Button onClick={() => handleSubmit()} variant="contained">Submit</Button> : <Button onClick={() => handleSubmit()} variant="contained">Next</Button>
                }
            </div>
        </main>
    )
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

        const result = await res.json()
        console.log('Survey created:', result);
        return result;
    } catch(error) {
        console.error('Error creating survey:', error);
    }
}

