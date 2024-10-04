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

export default function DashboardTeamView() {
  const [reId, setReId] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [answerType, setAnswerType] = useState('All');
  const [category, setCategory] = useState('All');
  const [reOptions, setReOptions] = useState([]);
  const [surveyOptions, setSurveyOptions] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [numericalQuestions, setNumericalQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answersMap, setAnswersMap] = useState({});
  const [overTimeData, setOverTimeData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openEndedQuestions, setOpenEndedQuestions] = useState([]);

  useEffect(() => {
    fetchRe();
  }, []);

  useEffect(() => {
    if (answerType !== 'ALL') {
      fetchSurveys();
    }
  }, [surveyId, reId, answerType, category]);

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
      const openEndedQs = [];
      const numericalQsSet = new Set();

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

      if (surveyId !== '') {
        const filteredSurveys = result.filter(
          (survey) =>
            survey.surveyId === surveyId && survey.type === answerType
        );

        if (filteredSurveys.length > 0) {
          const questionMap = {};
          const answersMapTemp = {};

          filteredSurveys.forEach((surveyItem) => {
            surveyItem.answers.forEach((q) => {
              if (category === 'All' || q.category === category) {
                if (q.isOpenEnded) {
                  // Collect open-ended questions
                  const existingQuestion = openEndedQs.find(
                    (item) => item.question === q.question
                  );
                  if (existingQuestion) {
                    existingQuestion.answers.push(q.answer);
                  } else {
                    openEndedQs.push({
                      question: q.question,
                      answers: [q.answer],
                    });
                  }
                } else {
                  // Collect numerical questions
                  numericalQsSet.add(q.question);

                  // Prepare data for the overview chart
                  if (!questionMap[q.question]) {
                    questionMap[q.question] = { total: 0, count: 0 };
                  }
                  questionMap[q.question].total += parseInt(q.answer);
                  questionMap[q.question].count += 1;

                  if (!answersMapTemp[q.question]) {
                    answersMapTemp[q.question] = [];
                  }
                  answersMapTemp[q.question].push({
                    answer: q.answer,
                    createdAt: surveyItem.createdAt,
                  });
                }
              }
            });
          });

          const answersForGraph = Object.keys(questionMap).map(
            (question) => ({
              question: question,
              answer:
                questionMap[question].total / questionMap[question].count,
            })
          );
          setGraphData(answersForGraph);

          setAnswersMap(answersMapTemp);
          setOpenEndedQuestions(openEndedQs);
          setNumericalQuestions(Array.from(numericalQsSet));
        }
      }
    } catch (error) {
      console.error('Error fetching surveys: ', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleQuestionChange = (event, newValue) => {
    setSelectedQuestion(newValue || '');

    if (newValue && answersMap[newValue]) {
      const filteredOverTimeData = answersMap[newValue].map((answer) => ({
        date: new Date(answer.createdAt).toLocaleDateString(),
        score: parseFloat(answer.answer),
      }));

      const overTimeDataTemp = filteredOverTimeData.reduce((acc, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = [];
        }
        acc[curr.date].push(curr.score);
        return acc;
      }, {});

      const formattedOverTimeData = Object.keys(overTimeDataTemp).map(
        (date) => ({
          date,
          average:
            overTimeDataTemp[date].reduce((a, b) => a + b, 0) /
            overTimeDataTemp[date].length,
        })
      );

      setOverTimeData(formattedOverTimeData);
    } else {
      setOverTimeData([]);
    }
  };

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

  const overTimeChartData = overTimeData.length > 0
    ? {
        labels: overTimeData.map((d) => d.date),
        datasets: [
          {
            label: `Average Score for "${selectedQuestion}" Over Time`,
            data: overTimeData.map((d) => d.average),
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1,
          },
        ],
      }
    : null;

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        min: 1,
        max: 5,
        stepSize: 1,
        ticks: {
          callback: function (value) {
            const labelsMap = {
              1: 'Needs Improvement',
              2: 'Below Expectations',
              3: 'Meets Expectations',
              4: 'Exceeds Expectations',
              5: 'Excellent',
            };
            return labelsMap[value] || value;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            const labelsMap = {
              1: 'Needs Improvement',
              2: 'Below Expectations',
              3: 'Meets Expectations',
              4: 'Exceeds Expectations',
              5: 'Excellent',
            };
            return labelsMap[value] || value;
          },
        },
      },
    },
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <Typography variant="h4" className="mb-6 text-center">
        Team Survey Dashboard
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <Autocomplete
            fullWidth
            options={reOptions}
            getOptionLabel={(option) => option.name}
            value={reOptions.find((re) => re.id === reId) || null}
            onChange={(event, newValue) => setReId(newValue ? newValue.id : '')}
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
            value={
              surveyOptions.find((survey) => survey.id === surveyId) || null
            }
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
              <MenuItem value="User_Story_Quality">
                User Story Quality
              </MenuItem>
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
        <Tab label="Open-ended Questions" />
        <Tab label="Detailed View" />
      </Tabs>

      {activeTab === 0 && (
        <div className="flex justify-center items-center mt-10">
          <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
            <Typography variant="h6" className="mb-4">
              Overview Chart
            </Typography>
            {graphData.length > 0 ? (
              <div className="h-[600px] w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <Typography>No data available for the overview chart.</Typography>
            )}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="flex justify-center items-center mt-10">
          <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
            {openEndedQuestions.length > 0 ? (
              openEndedQuestions.map((item, index) => (
                <div key={index} className="mb-6 grid grid-cols-1 gap-4">
                  <Typography
                    variant="h6"
                    className="font-semibold text-gray-700 mb-2"
                  >
                    {item.question}
                  </Typography>
                  <ul className="list-disc pl-6 mt-2">
                    {item.answers.map((answer, idx) => (
                      <li key={idx}>{answer}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <Typography>No open-ended questions available.</Typography>
            )}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="flex flex-col justify-center items-center mt-10">
          <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
            <Typography variant="h6" className="mb-4">
              Detailed View (Over Time)
            </Typography>

            {/* Dropdown for numerical questions */}
            <div className="mb-4">
              <Autocomplete
                fullWidth
                options={numericalQuestions}
                getOptionLabel={(option) => option}
                value={selectedQuestion || null}
                onChange={handleQuestionChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Question"
                    variant="outlined"
                  />
                )}
              />
            </div>

            {overTimeChartData ? (
              <div className="h-[600px] w-full">
                <Line data={overTimeChartData} options={lineChartOptions} />
              </div>
            ) : (
              <Typography>
                {selectedQuestion
                  ? 'No data available for this question.'
                  : 'Please select a question to view the over-time graph.'}
              </Typography>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
