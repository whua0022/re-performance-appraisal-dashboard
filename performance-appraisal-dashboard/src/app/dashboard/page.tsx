'use client';
import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Button, Autocomplete, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar } from 'react-chartjs-2'; // Import Bar from react-chartjs-2
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const [reId, setReId] = useState("");
    const [surveyId, setSurveyId] = useState("");
    const [questionId, setQuestionId] = useState("");
    const [answerType, setAnswerType] = useState("All");
    const [category, setCategory] = useState("All");  // For category filtering

    const [reOptions, setReOptions] = useState<{ id: string, name: string }[]>([]);
    const [surveyOptions, setSurveyOptions] = useState<{ id: string, name: string }[]>([{ id: "All", name: "All" }]);
    const [questionOptions, setQuestionOptions] = useState<string[]>(["All"]);
    const [graphData, setGraphData] = useState<any>(null);

    useEffect(() => {
        fetchRe();
    }, []);

    useEffect(() => {
        if (answerType === "ALL") {
            setQuestionOptions(() => ["ALL"]);
        } else {
            fetchSurveys();
        }
    }, [surveyId, reId, answerType, category]);  // Add category to the dependencies

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
            return data.name;
        } catch (error) {
            console.error("Error fetching survey name: ", error);
            return null;
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
                // Filter surveys by surveyId and answerType
                const filteredSurveys = result.filter((survey: any) => 
                    survey.surveyId === surveyId && survey.type === answerType
                );
    
                if (filteredSurveys.length > 0) {
                    // Initialize a map to accumulate answers for each question
                    const questionMap: { [key: string]: { total: number, count: number } } = {};
    
                    // Loop through each filtered survey and accumulate answers
                    filteredSurveys.forEach((survey: any) => {
                        survey.answers.forEach((q: any) => {
                            if (!questionMap[q.question]) {
                                questionMap[q.question] = { total: 0, count: 0 };
                            }

                            questionMap[q.question].total += parseInt(q.answer);
                            questionMap[q.question].count += 1;       // Count answers
                        });
                    });
                    
                    // Prepare the graph data by averaging answers
                    const answersForGraph = Object.keys(questionMap).map(question => ({
                        question: question,
                        answer: questionMap[question].total / questionMap[question].count // Average
                    }));
                    setQuestionOptions(["All", ...Object.keys(questionMap)]);
                    setGraphData(answersForGraph);
                }
            }
        } catch (error) {
            console.error("Error fetching surveys: ", error);
        }
    };
    
    // Prepare data for the bar chart using graphData
    const chartData = {
        labels: graphData?.map((d: any) => d.question) || [], // Y-axis labels (questions)
        datasets: [
            {
                label: 'Average Score',
                data: graphData?.map((d: any) => d.answer) || [], // X-axis data (answers)
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        indexAxis: 'y',  // This makes the chart horizontal
        responsive: true,
        scales: {
            x: {  // X-axis contains the average scores
                beginAtZero: true,
            },
        },
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
                        getOptionLabel={(option) => option.name}
                        value={reOptions.find(re => re.id === reId) || null}
                        onChange={(event, newValue) => setReId(newValue ? newValue.id : '')}
                        renderInput={(params) => <TextField {...params} label="Requirement Engineer" variant="outlined" />}
                    />
                </Grid>

                {/* Survey Autocomplete */}
                <Grid item xs={12} md={4}>
                    <Autocomplete
                        fullWidth
                        options={surveyOptions}
                        getOptionLabel={(option) => option.name}
                        value={surveyOptions.find(survey => survey.id === surveyId) || null}
                        onChange={(event, newValue) => setSurveyId(newValue ? newValue.id : '')}
                        renderInput={(params) => <TextField {...params} label="Survey" variant="outlined" />}
                    />
                </Grid>

                {/* Answer Type Dropdown */}
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
                            <MenuItem value="MANAGER">Manager</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Question Category Dropdown */}
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" disabled={!reId || !surveyId}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            label="Category"
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Communication">Communication</MenuItem>
                            <MenuItem value="Responsiveness">Responsiveness</MenuItem>
                            <MenuItem value="Collaboration">Collaboration</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12} style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Button variant="contained" color="primary" onClick={() => console.log(reId, surveyId, questionId)} disabled={!reId || !surveyId}>
                        Submit
                    </Button>
                </Grid>

                {/* Overview Chart */}
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" gutterBottom>
                            Overview Chart
                        </Typography>
                        {/* Display Bar chart here */}
                        {graphData && (
                            <div style={{ height: '400px' }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </main>
    );
}
