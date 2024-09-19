'use client'

import { Box, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, List, FormGroup } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SendSurveyPage() {
    const [surveys, setSurveys] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const revieweeId = searchParams.get('revieweeId');
    const teamId = searchParams.get("teamId");
    const router = useRouter();

    const handleSurveyClick = (surveyId: string) => {
        router.push(`/dashboard/send-survey/${surveyId}?teamId=${teamId}&revieweeId=${revieweeId}`);
    };

    // TODO: CHANGE TO CURR USER TOKEN
    const temp = "66ea71380a379e73dffb6783";
    useEffect(() => {
        const initialFetch = async () => {
            await fetchSurveys(temp);
            await fetchMembers(teamId || "");
        };
        initialFetch();
    }, [teamId]);

    const fetchSurveys = async (creatorId: string) => {
        try {
            const res = await fetch("/api/survey?creatorId=" + creatorId, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setSurveys(result);
        } catch (error) {
            console.error("Error getting surveys: ", error);
        }
    };

    const fetchMembers = async (teamId: string) => {
        try {
            const res = await fetch("/api/teams/members?teamId=" + teamId, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setMembers(result);
        } catch (error) {
            console.error("Error getting members: ", error);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Team Members
                        </Typography>
                        <TableContainer component={Paper} sx={{ width: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center"><Typography variant="h6">Name</Typography></TableCell>
                                        <TableCell align="center"><Typography variant="h6">Role</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.name}>
                                            <TableCell align="center">{member.name}</TableCell>
                                            <TableCell align="center">{member.roles}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 3,
                            padding: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Surveys to Send Out
                        </Typography>
                        <List sx={{ padding: 0 }}>
                            {surveys.map((survey, index) => (
                                <FormGroup key={index} sx={{ mb: 2 }}>
                                    <Typography
                                        id={survey.id}
                                        onClick={() => handleSurveyClick(survey.id)}
                                        sx={{
                                            cursor: 'pointer',
                                            padding: 1,
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        {survey.name || "Unnamed Survey"}
                                    </Typography>
                                    {index < surveys.length - 1 && <Divider />}
                                </FormGroup>
                            ))}
                        </List>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
