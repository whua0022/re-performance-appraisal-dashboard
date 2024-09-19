'use client'

import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SendSurveyPickRePage() {
    const [requirementEngineers, setRequirementEngineers] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchRes();
    }, []);

    const fetchRes = async () => {
        try {
            const res = await fetch("/api/teams/re", {
                method: "GET",
                headers: {
                    'Accept': "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setRequirementEngineers(result);
        } catch (error) {
            console.error("Error fetching teams: ", error);
        }
    };

    const handleNav = (revieweeId: string) => {
        router.push(`/dashboard/send-survey/team?revieweeId=${revieweeId}`);
    };

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
                Select a Requirement Engineer to send a survey about:
            </Typography>
            <List>
                {requirementEngineers.map((requirementEngineer) => (
                    <div key={requirementEngineer.id}>
                        <ListItem>
                            <ListItemButton 
                                onClick={() => handleNav(requirementEngineer.id)} 
                                sx={{ 
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                    borderRadius: 2, 
                                    mb: 1 
                                }}
                            >
                                <ListItemText 
                                    primary={requirementEngineer.name} 
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
