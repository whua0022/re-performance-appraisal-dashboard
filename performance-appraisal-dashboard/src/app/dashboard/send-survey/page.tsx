'use client'

import { Box, Checkbox, FormControlLabel, FormGroup, FormLabel, List, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function SendSurveyPage() {
    const [surveys, setSurveys] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])

    const router = useRouter();

    const handleSurveyClick = (surveyId: string) => {
        router.push(`/dashboard/send-survey/${surveyId}?teamId=66ea70320a379e73dffb6782&revieweeId=1`);
    };

    useEffect(() => {
        const initialFetch = async () => {
            await fetchSurveys("66ea71380a379e73dffb6783")
            await fetchMembers("66ea70320a379e73dffb6782")
        }
        initialFetch()
    }, [])

    const fetchSurveys = async (creatorId:string) => {
        try {
            const res = await fetch("/api/survey?creatorId=" + creatorId, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            })
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const result = await res.json()
            setSurveys(() => result)
        } catch(error) {
            console.error("Error getting questions: ", error)
        }
    }

    const fetchMembers = async (teamId:string) => {
        try {
            const res = await fetch("/api/teams/members?teamId=" + teamId, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            })
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const result = await res.json()
            setMembers(() => result)
        } catch(error) {
            console.error("Error getting questions: ", error)
        }
    }
    return (
        <>
            <div>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Member</TableCell>
                                <TableCell>Role</TableCell>
                            </TableRow>
                            </TableHead>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow
                                    key={member.name}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {member.name}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {member.role}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>  
                    </Table>
                </TableContainer>
            </div>
            <div>
            <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                <nav aria-label="main">
                    <List>
                    {
                        surveys.map((survey, index) => (
                            <FormGroup key={index}>
                                <Typography
                                    id={survey.id}
                                    onClick={() => handleSurveyClick(survey.id)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {survey.name || ""}
                                </Typography>
                            </FormGroup>
                        ))
                    }   
                    </List>
                </nav>
            </Box>
            </div>
        </>
    
    )
}