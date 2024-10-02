'use client';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [reId, setReId] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [answerType, setAnswerType] = useState('All');
  const [category, setCategory] = useState('All');
  const [reOptions, setReOptions] = useState([]);
  const [surveyOptions, setSurveyOptions] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answersMap, setAnswersMap] = useState({});
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [overTimeData, setOverTimeData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [memberScores, setMemberScores] = useState([]);

  useEffect(() => {
    fetchRe();
  }, []);

  useEffect(() => {
    if (answerType !== 'ALL') {
      fetchSurveys();
    }
  }, [surveyId, reId, answerType, category]);

  useEffect(() => {
    if (activeTab === 2) {
      fetchTeamMembers();
    }
  }, [activeTab]);

  const fetchRe = async () => {
    try {
      const res = await fetch(`/api/teams/re`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const result = await res.json();
      const options = result.map((re) => ({
        id: re.id,
        name: re.name,
      }));
      setReOptions(options);
    } catch (error) {
      console.error('Error fetching teams: ', error);
    }
  };

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

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`/api/answers?revieweeId=${reId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      const surveyIds = [];
      const surveyOptions = [];
      for (const item of result) {
        if (!surveyIds.includes(item.surveyId)) {
          surveyIds.push(item.surveyId);
          const surveyName = await fetchSurveyName(item.surveyId);
          surveyOptions.push({
            id: item.surveyId,
            name: surveyName || item.surveyId,
          });
        }
      }
      setSurveyOptions(surveyOptions);

      if (surveyId !== 'All') {
        const filteredSurveys = result.filter(
          (survey) =>
            survey.surveyId === surveyId && survey.type === answerType
        );

        if (filteredSurveys.length > 0) {
          const questionMap = {};
          const questionSet = new Map();
          const answersMapTemp = {};

          filteredSurveys.forEach((surveyItem) => {
            surveyItem.answers.forEach((q) => {
              if (category === 'All' || q.category === category) {
                if (!q.isOpenEnded) {
                  if (!questionMap[q.question]) {
                    questionMap[q.question] = { total: 0, count: 0 };
                  }
                  questionMap[q.question].total += parseInt(q.answer);
                  questionMap[q.question].count += 1;
                }

                if (!questionSet.has(q.question)) {
                  questionSet.set(q.question, {
                    question: q.question,
                    isOpenEnded: q.isOpenEnded,
                    category: q.category,
                  });
                }
                if (!answersMapTemp[q.question]) {
                  answersMapTemp[q.question] = [];
                }
                answersMapTemp[q.question].push({
                  answer: q.answer,
                  createdAt: surveyItem.createdAt,
                });
              }
            });
          });

          const answersForGraph = Object.keys(questionMap).map((question) => ({
            question: question,
            answer: questionMap[question].total / questionMap[question].count,
          }));
          setGraphData(answersForGraph);

          setAllQuestions(Array.from(questionSet.values()));
          setAnswersMap(answersMapTemp);
        }
      }
    } catch (error) {
      console.error('Error fetching surveys: ', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`/api/teams/members?teamId=66ea70320a379e73dffb6782`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      const members = result.map((member) => ({
        id: member.id,
        name: member.name,
      }));
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members: ', error);
    }
  };

  const fetchMemberScores = async (memberId) => {
    try {
      const res = await fetch(`/api/answers?revieweeId=${reId}&reviewerId=${memberId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const surveyList = await res.json();
      const surveyAnswers = [];
      const answersByQuestion = {}; // To accumulate scores for each question
  
      for (const survey of surveyList) {
        if (survey.reviewerId === selectedMember && survey.isCompleted) {
          for (const answer of survey.answers) {
            const question = answer.question;
            if (!answersByQuestion[question]) {
              answersByQuestion[question] = [];
            }
            answersByQuestion[question].push({
              date: survey.createdAt,
              score: parseFloat(answer.answer),
            });
          }
        }
      }
  
      // Format the data to chart-compatible format
      const formattedData = Object.keys(answersByQuestion).map((question) => {
        return {
          question: question,
          averageScore: (
            answersByQuestion[question].reduce((acc, item) => acc + item.score, 0) /
            answersByQuestion[question].length
          ).toFixed(2),
        };
      });
  
      setMemberScores(formattedData);
    } catch (error) {
      console.error('Error fetching member scores: ', error);
    }
  };
  

  useEffect(() => {
    if (selectedMember) {
      fetchMemberScores(selectedMember);
    }
  }, [selectedMember, reId]);

  useEffect(() => {
    if (selectedQuestion) {
      const questionData = allQuestions.find(
        (q) => q.question === selectedQuestion
      );
      const isOpenEnded = questionData.isOpenEnded;

      const answers = answersMap[selectedQuestion] || [];

      if (isOpenEnded) {
        setQuestionAnswers(answers);
        setOverTimeData([]);
      } else {
        const dateMap = {};

        answers.forEach((answer) => {
          const date = new Date(answer.createdAt).toLocaleDateString();
          if (!dateMap[date]) {
            dateMap[date] = [];
          }
          dateMap[date].push(parseFloat(answer.answer));
        });

        const overTimeDataTemp = Object.keys(dateMap)
          .map((date) => ({
            date: date,
            average:
              dateMap[date].reduce((a, b) => a + b, 0) / dateMap[date].length,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setOverTimeData(overTimeDataTemp);
        setQuestionAnswers([]);
      }
    } else {
      setQuestionAnswers([]);
      setOverTimeData([]);
    }
  }, [selectedQuestion, answersMap, allQuestions]);

  const chartData = {
    labels: graphData?.map((d) => d.question) || [],
    datasets: [
      {
        label: 'Average Score',
        data: graphData?.map((d) => d.answer) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

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
  };

  const lineChartData = overTimeData
    ? {
        labels: overTimeData.map((d) => d.date),
        datasets: [
          {
            label: 'Average Score Over Time',
            data: overTimeData.map((d) => d.average),
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1,
          },
        ],
      }
    : null;

  const lineChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <Typography variant="h4" className="mb-6 text-center">
        Home
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <Autocomplete
            fullWidth
            options={reOptions}
            getOptionLabel={(option) => option.name}
            value={reOptions.find((re) => re.id === reId) || null}
            onChange={(event, newValue) =>
              setReId(newValue ? newValue.id : '')
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Requirement Engineer"
                variant="outlined"
              />
            )}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <Autocomplete
            fullWidth
            options={surveyOptions}
            getOptionLabel={(option) => option.name}
            value={surveyOptions.find((survey) => survey.id === surveyId) || null}
            onChange={(event, newValue) =>
              setSurveyId(newValue ? newValue.id : '')
            }
            renderInput={(params) => (
              <TextField {...params} label="Survey" variant="outlined" />
            )}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <FormControl
            fullWidth
            variant="outlined"
            disabled={!reId || !surveyId}
          >
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

        <div className="bg-white p-4 rounded-lg shadow">
          <FormControl
            fullWidth
            variant="outlined"
            disabled={!reId || !surveyId}
          >
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
              <MenuItem value="Technical_Proficiency">
                Technical Proficiency
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        className="mt-6"
      >
        <Tab label="Overview Chart" />
        <Tab label="Individual Questions" />
        <Tab label="Responses by Member" />
      </Tabs>

      {activeTab === 0 && (
        <div className="flex justify-center items-center mt-10">
          <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
            <Typography variant="h6" className="mb-4">
              Overview Chart
            </Typography>
            {graphData && (
              <div className="h-[600px] w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <>
          <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <Autocomplete
                fullWidth
                options={[{ question: 'Pick a question' }, ...allQuestions]}
                getOptionLabel={(option) =>
                  option.question === 'Pick a question'
                    ? 'Pick a question'
                    : option.isOpenEnded
                    ? `${option.question} (Open-Ended)`
                    : option.question
                }
                value={
                  selectedQuestion
                    ? allQuestions.find(
                        (q) => q.question === selectedQuestion
                      ) || {
                        question: 'Pick a question',
                      }
                    : { question: 'Pick a question' }
                }
                onChange={(event, newValue) =>
                  setSelectedQuestion(
                    newValue && newValue.question !== 'Pick a question'
                      ? newValue.question
                      : ''
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Question" variant="outlined" />
                )}
              />
            </div>
          </div>

          {selectedQuestion && (
            <>
              {questionAnswers.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow mt-6">
                  <Typography variant="h6">Answers:</Typography>
                  <ul className="list-disc pl-6">
                    {questionAnswers.map((answer, index) => (
                      <li key={index}>{answer.answer}</li>
                    ))}
                  </ul>
                </div>
              ) : overTimeData ? (
                <div className="flex justify-center items-center mt-6">
                  <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
                    <Typography variant="h6" className="mb-4">
                      Over Time Chart
                    </Typography>
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </div>
              ) : (
                <Typography variant="body1" className="mt-6">
                  No data available for this question.
                </Typography>
              )}
            </>
          )}
        </>
      )}

  {activeTab === 2 && (
    <>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <Autocomplete
            fullWidth
            options={teamMembers}
            getOptionLabel={(option) => option.name}
            value={teamMembers.find((member) => member.id === selectedMember) || null}
            onChange={(event, newValue) =>
              setSelectedMember(newValue ? newValue.id : '')
            }
            renderInput={(params) => (
              <TextField {...params} label="Select Team Member" variant="outlined" />
            )}
          />
        </div>
      </div>

      {selectedMember && memberScores.length > 0 && (
        <div className="flex justify-center items-center mt-10">
          <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
            <Typography variant="h6" className="mb-4">
              Member's Average Scores
            </Typography>

            {/* Chart.js Bar Chart */}
            <div className="h-[600px] w-full">
              <Bar
                data={{
                  labels: memberScores.map((d) => d.question),
                  datasets: [
                    {
                      label: 'Average Score',
                      data: memberScores.map((d) => d.averageScore),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
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
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!memberScores.length && selectedMember && (
        <Typography variant="body1" className="mt-6">
          No scores available for this member.
        </Typography>
      )}
    </>
  )}

    </main>
  );
}
