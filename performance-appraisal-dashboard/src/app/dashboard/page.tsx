'use client';
import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Button, Autocomplete, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function Dashboard() {
    const [reId, setReId] = useState("");
    const [surveyId, setSurveyId] = useState("");
    const [questionId, setQuestionId] = useState("");
    const [answerType, setAnswerType] = useState("All");

    const [reOptions, setReOptions] = useState<{ id: string, name: string }[]>([]);
    const [surveyOptions, setSurveyOptions] = useState<{ id: string, name: string }[]>([{ id: "All", name: "All" }]);
    const [questionOptions, setQuestionOptions] = useState<string[]>(["All"]);
    const [graphData, setGraphData] = useState<any>(null)
    useEffect(() => {
        fetchRe();
    }, []);

    useEffect(() => {
        if (answerType === "ALL") {
            setQuestionOptions(() => ["ALL"]);
        } else {
            fetchSurveys();
        }
    }, [surveyId, reId, answerType]);

    console.log(graphData)
    // Fetch RE and store both id and name
    const fetchRe = async () => {
        try {
            const res = await fetch(`/api/teams/re`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            const options = result.map((re: any) => ({
                id: re.id,
                name: re.name
            }));
            setReOptions(options);
        } catch (error) {
            console.error("Error fetching teams: ", error);
        }
    };

    const fetchSurveyName = async (surveyId: string) => {
        try {
            const res = await fetch(`/api/survey?surveyId=${surveyId}`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });
    
            if (!res.ok) {
                throw new Error(`Failed to fetch survey name for surveyId: ${surveyId}, status: ${res.status}`);
            }
    
            const data = await res.json();
            return data.name; // Assuming the API returns the survey name in 'name' field
        } catch (error) {
            console.error("Error fetching survey name: ", error);
            return null; // Return null or a placeholder in case of error
        }
    };
    
    const fetchSurveys = async () => {
        try {
            const res = await fetch(`/api/answers?revieweeId=${reId}`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const result = await res.json();
    
            const surveyIds: string[] = ["All"];
            const surveyOptions: { id: string, name: string }[] = [{ id: "All", name: "All" }];
            
            // Add all surveys to survey options
            for (const item of result) {
                if (!surveyIds.includes(item.surveyId)) {
                    surveyIds.push(item.surveyId);
                    const surveyName = await fetchSurveyName(item.surveyId);
                    surveyOptions.push({
                        id: item.surveyId,
                        name: surveyName || item.surveyId
                    });
                }
            }
    
            setSurveyOptions(surveyOptions);
    
            if (surveyId !== "All") {
                // Filter by selected survey ID and role type (answerType)
                const filteredSurvey = result.find((survey: any) => survey.surveyId === surveyId && survey.type === answerType);
    
                if (filteredSurvey) {
                    // Extract questions for this specific survey and type
                    const questions = filteredSurvey.answers.map((q: any) => q.question);
    
                    // Set question options (All + questions related to the selected survey)
                    setQuestionOptions(["All", ...questions]);
                    
                    // Store answers for graphs (you can further process this later)
                    const answersForGraph = filteredSurvey.answers.map((q: any) => ({
                        question: q.question,
                        answer: q.answer // Assuming 'answer' exists in the structure
                    }));
    
                    // Store answers for future graph generation
                    setGraphData(answersForGraph);  // setGraphData should be a state to store answers for graphs
                }
            }
        } catch (error) {
            console.error("Error fetching surveys: ", error);
        }
    };
    
    return (
        <main style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h4" gutterBottom style={{ marginBottom: '24px', textAlign: 'center' }}>
                Home
            </Typography>
            <Grid container spacing={3}>
                {/* RE Autocomplete */}
                <Grid item xs={12} md={4}>
                    <Autocomplete
                        fullWidth
                        options={reOptions}
                        getOptionLabel={(option) => option.name} // Display only the name in the dropdown
                        value={reOptions.find(re => re.id === reId) || null} // Find the selected RE by its id
                        onChange={(event, newValue) => setReId(newValue ? newValue.id : '')} // Store the RE id when selected
                        renderInput={(params) => <TextField {...params} label="Requirement Engineer" variant="outlined" />}
                    />
                </Grid>

                {/* Survey Autocomplete */}
                <Grid item xs={12} md={4}>
                    <Autocomplete
                        fullWidth
                        options={surveyOptions}
                        getOptionLabel={(option) => option.name} // Display the survey name in the dropdown
                        value={surveyOptions.find(survey => survey.id === surveyId) || null} // Find the selected survey by its id
                        onChange={(event, newValue) => setSurveyId(newValue ? newValue.id : '')} // Store the survey id when selected
                        renderInput={(params) => <TextField {...params} label="Survey" variant="outlined" />}
                    />
                </Grid>

                {/* Answer Type Dropdown - Disabled until RE and Survey are selected */}
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" disabled={!reId || !surveyId}>
                        <InputLabel>Answer Type</InputLabel>
                        <Select
                            value={answerType}
                            onChange={(event) => setAnswerType(event.target.value)}
                            label="Answer Type"
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="DEV">Dev</MenuItem>
                            <MenuItem value="RE">RE</MenuItem>
                            <MenuItem value="MANAGER>">Manager</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Question Autocomplete - Disabled until RE and Survey are selected */}
                <Grid item xs={12} md={4}>
                    <Autocomplete
                        fullWidth
                        options={questionOptions}
                        getOptionLabel={(option) => option}
                        value={questionId}
                        onChange={(event, newValue) => setQuestionId(newValue || '')}
                        renderInput={(params) => (
                            <TextField {...params} label="Question" variant="outlined" disabled={!reId || !surveyId} />
                        )}
                    />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12} style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Button variant="contained" color="primary" onClick={() => console.log(reId, surveyId, questionId)} disabled={!reId || !surveyId}>
                        Submit
                    </Button>
                </Grid>

                {/* Dashboard Layout */}
                {/* Top Row - Full Width */}
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" gutterBottom>
                            Overview Chart
                        </Typography>
                        <div style={{ height: '200px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                    </Paper>
                </Grid>
            </Grid>
        </main>
    );
}