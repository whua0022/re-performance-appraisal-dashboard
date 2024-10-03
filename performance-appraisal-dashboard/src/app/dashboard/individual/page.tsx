'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  CircularProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MemberSurveyPage() {
  const [reId, setReId] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [category, setCategory] = useState('All');
  const [reOptions, setReOptions] = useState([]);
  const [surveyOptions, setSurveyOptions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [numericalAnswers, setNumericalAnswers] = useState([]);
  const [openEndedAnswers, setOpenEndedAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRe()
  }, []);

  useEffect(() => {
      fetchSurveys();
      fetchTeamMembers()
  }, [surveyId, reId, category]);


  useEffect(() => {
    if (selectedMember && reId && surveyId) {
      fetchMemberAnswers(selectedMember, reId, surveyId);
    }
  }, [surveyId, category, selectedMember]);

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
    } catch (error) {
      console.error('Error fetching surveys: ', error);
    }
  };

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

  const fetchMemberAnswers = async (memberId, reId, surveyId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/answers?&reviewerId=${memberId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const surveyList = await res.json();

      const numerical = [];
      const openEnded = [];

      surveyList.forEach((survey) => {
        if (survey.surveyId === surveyId && (category === 'All' || survey.answers.some(q => q.category === category))) {
          survey.answers.forEach((answer) => {
            if (answer.isOpenEnded) {
              openEnded.push({
                question: answer.question,
                answer: answer.answer,
              });
            } else {
              numerical.push({
                question: answer.question,
                answer: parseFloat(answer.answer),
              });
            }
          });
        }
      });
      console.log(surveyList)
      setNumericalAnswers(numerical);
      setOpenEndedAnswers(openEnded);
    } catch (error) {
      console.error('Error fetching member answers: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const chartData = {
    labels: numericalAnswers.map((d) => d.question), // Labels for each question
    datasets: [
      {
        label: 'Score',
        data: numericalAnswers.map((d) => d.answer), // Numerical scores (1, 2, 3, 4, 5)
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
        min: 1, // Minimum value on the x-axis
        max: 5, // Maximum value on the x-axis
        ticks: {
          stepSize: 1, // Step size between the values
          callback: function (value) {
            // Map numerical values to their corresponding string labels
            const labelsMap = {
              1: 'Needs Improvement',
              2: 'Below Expectations',
              3: 'Meets Expectations',
              4: 'Exceeds Expectations',
              5: 'Excellent',
            };
            return labelsMap[value] || value; // Return the mapped label or the value if not found
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

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <Typography variant="h4" className="mb-6 text-center">
        Team Member Survey Responses
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
              <TextField {...params} label="Requirement Engineer" variant="outlined" />
            )}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <Autocomplete
            fullWidth
            options={surveyOptions}
            getOptionLabel={(option) => option.name}
            value={surveyOptions.find((survey) => survey.id === surveyId) || null}
            onChange={(event, newValue) => setSurveyId(newValue ? newValue.id : '')}
            renderInput={(params) => (
              <TextField {...params} label="Survey" variant="outlined" />
            )}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <FormControl fullWidth variant="outlined">
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

        <div className="bg-white p-4 rounded-lg shadow">
          <Autocomplete
            fullWidth
            options={teamMembers}
            getOptionLabel={(option) => option.name}
            value={teamMembers.find((member) => member.id === selectedMember) || null}
            onChange={(event, newValue) => setSelectedMember(newValue ? newValue.id : '')}
            renderInput={(params) => (
              <TextField {...params} label="Select Team Member" variant="outlined" />
            )}
          />
        </div>
      </div>

      {selectedMember && !loading ? (
        <>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            className="mt-6"
          >
            <Tab label="Likert Scale Answers" />
            <Tab label="Open-ended Answers" />
          </Tabs>

          {activeTab === 0 && (
            <div className="flex justify-center items-center mt-10">
              <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
                <Typography variant="h6" className="mb-4">
                Likert Scale Answers
                </Typography>
                {numericalAnswers.length > 0 ? (
                  <div className="h-[600px] w-full">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <Typography>No answers available.</Typography>
                )}
              </div>
            </div>
          )}

        {activeTab === 1 && (
        <div className="flex justify-center items-center mt-10">
            <div className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-lg">
            {openEndedAnswers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                {openEndedAnswers.map((item, index) => (
                    <div
                    key={index}
                    className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                    <Typography
                        variant="h6"
                        className="font-semibold text-gray-700 mb-2"
                    >
                        {item.question}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        {item.answer}
                    </Typography>
                    </div>
                ))}
                </div>
            ) : (
                <Typography>No open-ended answers available.</Typography>
            )}
            </div>
        </div>
        )}

        </>
      ) : (
        loading && (
          <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
            <CircularProgress />
          </Box>
        )
      )}
    </main>
  );
}
