'use client'
import { TableContainer, Paper, Table, TableBody, TableRow, TableCell, Box, Button, Typography } from "@mui/material";
import { Surveys } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SurveyDetailsPage({params}: {params: {id: string}}) {
    const searchParams = useSearchParams();
    const teamId = searchParams.get('teamId')
    const revieweeId = searchParams.get('revieweeId')
    const [survey, setSurvey] = useState<Surveys>({
        id: "",
        name: "",
        creatorId: "",
        devQuestionList: [],
        reQuestionList: [],
        managerQuestionList: [],
    })

    useEffect(() => {
        fetchSurveyInfo(params.id)
    }, [params.id])

    const fetchSurveyInfo = async (surveyId:string) => {
        try {
            const res = await fetch("/api/survey?surveyId=" + surveyId, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            })
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const result = await res.json()
            setSurvey(result)
        } catch(error) {
            console.error("Error getting questions: ", error)
        }
    }

    const sendSurvey = async (teamId: string) => {
        let members;
        try {
            const res = await fetch("/api/teams/members?teamId=" + teamId)
            const data = await res.json()
            members = data
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        } catch(error) {
            console.error("Error getting questions: ", error)
        }

        for (const member of members) {
            try {
                const res = await fetch("/api/survey/send?role=" + member.roles, {
                    method: "POST",
                    headers: {
                        'Accept': "application/json"
                    },
                    body: JSON.stringify({
                        surveyId: params.id,
                        teamId: teamId,
                        revieweeId: revieweeId,
                        reviewerId: member.id
                    })
                })
        
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
            } catch(error) {
                console.error("Error getting questions: ", error)
            }
        }
    }
    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                Questions for Developers
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableBody>
                        {Array.isArray(survey.devQuestionList) && survey.devQuestionList.map((question: any) => (
                            <TableRow
                                key={question?.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{question?.question}</TableCell>
                                <TableCell>{question?.category}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                Questions for Requirement Engineers
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableBody>
                        {Array.isArray(survey.reQuestionList) && survey.reQuestionList.map((question: any) => (
                            <TableRow
                                key={question?.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{question?.question}</TableCell>
                                <TableCell>{question?.category}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                Questions for Managers
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableBody>
                        {Array.isArray(survey.managerQuestionList) && survey.managerQuestionList.map((question: any) => (
                            <TableRow
                                key={question?.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{question?.question}</TableCell>
                                <TableCell>{question?.category}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                variant="contained"
                color="primary"
                onClick={() => sendSurvey(teamId || "")}
                sx={{ alignSelf: 'center' }}
            >
                Send
            </Button>
        </Box>
    )
}