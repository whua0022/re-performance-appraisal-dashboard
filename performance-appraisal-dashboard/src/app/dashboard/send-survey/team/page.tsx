'use client'

import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SendSurveyTeamPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const revieweeId = searchParams.get('revieweeId');

    useEffect(() => {
        fetchTeams();
    }, [revieweeId]);

    const fetchTeams = async () => {
        try {
            const res = await fetch(`/api/user/team?userId=${revieweeId}`, {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setTeams(result);
        } catch (error) {
            console.error("Error fetching teams: ", error);
        }
    };

    const handleTeamClick = (teamId: string) => {
        router.push(`/dashboard/send-survey?revieweeId=${revieweeId}&teamId=${teamId}`);
    };

    if (teams.length === 0) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Typography variant="h4" color="text.secondary">
                    No teams found
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: '100%', 
            maxWidth: 600, 
            bgcolor: 'background.paper', 
            margin: '0 auto', 
            padding: 3, 
            borderRadius: 2, 
            boxShadow: 3 
        }}>
            <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
                Select a Team
            </Typography>
            <List>
                {teams.map((team) => (
                    <div key={team.id}>
                        <ListItem>
                            <ListItemButton 
                                onClick={() => handleTeamClick(team.id)} 
                                sx={{ 
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                    borderRadius: 2, 
                                    mb: 1 
                                }}
                            >
                                <ListItemText 
                                    primary={team.name} 
                                    primaryTypographyProps={{ 
                                        fontWeight: 'bold' 
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>
        </Box>
    );
}
