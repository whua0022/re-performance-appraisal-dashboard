'use client' 
import React, { useEffect, useState } from 'react' 
import { Grid, Paper, Typography, Button, Autocomplete, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material' 
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js' 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend) 

export default function Dashboard() {
    const [reId, setReId] = useState("") 
    const [surveyId, setSurveyId] = useState("") 
    const [answerType, setAnswerType] = useState("All") 
    const [category, setCategory] = useState("All") 

    const [reOptions, setReOptions] = useState<{ id: string, name: string }[]>([]) 
    const [surveyOptions, setSurveyOptions] = useState<{ id: string, name: string }[]>([]) 
    const [questionOptions, setQuestionOptions] = useState<string[]>(["All"]) 
    const [graphData, setGraphData] = useState<any>(null) 

    useEffect(() => {
        fetchRe() 
    }, []) 

    useEffect(() => {
        if (answerType === "ALL") {
            setQuestionOptions(() => ["ALL"]) 
        } else {
            fetchSurveys() 
        }
    }, [surveyId, reId, answerType, category]) 

    const fetchRe = async () => {
        try {
            const res = await fetch(`/api/teams/re`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            }) 

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`) 
            }

            const result = await res.json() 
            const options = result.map((re: any) => ({
                id: re.id,
                name: re.name
            })) 
            setReOptions(options) 
        } catch (error) {
            console.error("Error fetching teams: ", error) 
        }
    } 

    const fetchSurveyName = async (surveyId: string) => {
        try {
            const res = await fetch(`/api/survey?surveyId=${surveyId}`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            }) 
    
            if (!res.ok) {
                throw new Error(`Failed to fetch survey name for surveyId: ${surveyId}, status: ${res.status}`) 
            }
    
            const data = await res.json() 
            return data.name 
        } catch (error) {
            console.error("Error fetching survey name: ", error) 
            return null 
        }
    } 
    
    const fetchSurveys = async () => {
        try {
            const res = await fetch(`/api/answers?revieweeId=${reId}`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            }) 
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`) 
            }
    
            const result = await res.json() 
    
            const surveyIds: string[] = [] 
            const surveyOptions: { id: string, name: string }[] = [] 
    
            for (const item of result) {
                if (!surveyIds.includes(item.surveyId)) {
                    surveyIds.push(item.surveyId) 
                    const surveyName = await fetchSurveyName(item.surveyId) 
                    surveyOptions.push({
                        id: item.surveyId,
                        name: surveyName || item.surveyId
                    }) 
                }
            }
    
            setSurveyOptions(surveyOptions) 
    
            if (surveyId !== "All") {
                // Filter surveys by surveyId, answerType, and category
                const filteredSurveys = result.filter((survey: any) => 
                    survey.surveyId === surveyId && survey.type === answerType
                ) 

                if (filteredSurveys.length > 0) {
                    const questionMap: { [key: string]: { total: number, count: number } } = {} 
    
                    filteredSurveys.forEach((survey: any) => {
                        survey.answers.forEach((q: any) => {
                            if (category === "All" || q.category === category) {
                                if (!questionMap[q.question]) {
                                    questionMap[q.question] = { total: 0, count: 0 } 
                                }
                                questionMap[q.question].total += parseInt(q.answer) 
                                questionMap[q.question].count += 1  
                            }
                        }) 
                    }) 
                    
                    const answersForGraph = Object.keys(questionMap).map(question => ({
                        question: question,
                        answer: questionMap[question].total / questionMap[question].count
                    })) 
                    setQuestionOptions(["All", ...Object.keys(questionMap)]) 
                    setGraphData(answersForGraph) 
                }
            }
        } catch (error) {
            console.error("Error fetching surveys: ", error) 
        }
    } 
    
    // Prepare data for the bar chart using graphData
    const chartData = {
        labels: graphData?.map((d: any) => d.question) || [],
        datasets: [
            {
                label: 'Average Score',
                data: graphData?.map((d: any) => d.answer) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    } 

    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        scales: {
            x: {  
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    } 

    return (
        <main className="min-h-screen p-6 bg-gray-100">
            <Typography variant="h4" className="mb-6 text-center">
                Home
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* RE Autocomplete */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Autocomplete
                        fullWidth
                        options={reOptions}
                        getOptionLabel={(option) => option.name}
                        value={reOptions.find(re => re.id === reId) || null}
                        onChange={(event, newValue) => setReId(newValue ? newValue.id : '')}
                        renderInput={(params) => <TextField {...params} label="Requirement Engineer" variant="outlined" />}
                    />
                </div>

                {/* Survey Autocomplete */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Autocomplete
                        fullWidth
                        options={surveyOptions}
                        getOptionLabel={(option) => option.name}
                        value={surveyOptions.find(survey => survey.id === surveyId) || null}
                        onChange={(event, newValue) => setSurveyId(newValue ? newValue.id : '')}
                        renderInput={(params) => <TextField {...params} label="Survey" variant="outlined" />}
                    />
                </div>

                {/* Answer Type Dropdown */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <FormControl fullWidth variant="outlined" disabled={!reId || !surveyId}>
                        <InputLabel>Answer Type</InputLabel>
                        <Select
                            value={answerType}
                            onChange={(event) => setAnswerType(event.target.value)}
                            label="Answer Type"
                        >
                            <MenuItem value="DEV">Dev</MenuItem>
                            <MenuItem value="RE">RE</MenuItem>
                            <MenuItem value="MANAGER">Manager</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* Question Category Dropdown */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <FormControl fullWidth variant="outlined" disabled={!reId || !surveyId}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            label="Category"
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Communication">Communication</MenuItem>
                            <MenuItem value="User_Story_Quality">User Story Quality</MenuItem>
                            <MenuItem value="Time_Management">Time Management</MenuItem>
                            <MenuItem value="Technical_Proficiency">Technical Proficiency</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            {/* Overview Chart */}
            <div className="flex justify-center items-center mt-10">
                <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
                    <Typography variant="h6" className="mb-4">
                        Overview Chart
                    </Typography>
                    {/* Display Bar chart here */}
                    {graphData && (
                        <div className="h-[600px] w-full">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    )}
                </div>
            </div>
        </main>
    ) 
}
