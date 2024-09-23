'use client';
import { useState, useEffect } from 'react';
import { Container, TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Box, List, ListItem, ListItemText, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

type Team = {
  id: string;
  name: string;
  members: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
};

const TeamManagementPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      const team = teams.find(t => t.id === selectedTeamId);
      if (team) {
        setTeamMembers(team.members.map(memberId => users.find(user => user.id === memberId)).filter(Boolean) as User[]);
        setAvailableUsers(users.filter(user => !team.members.includes(user.id)));
      }
    }
  }, [selectedTeamId, users, teams]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return alert('Please enter a team name.');

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!response.ok) throw new Error('Failed to create team');
      setNewTeamName('');
      fetchTeams();
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  const handleRemoveUserFromTeam = async (teamId: string, userId: string) => {
    try {
        const response = await fetch(`/api/teams/${teamId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeUserId: userId }),
        });

        if (!response.ok) {
            throw new Error(`Failed to remove user from team: ${await response.text()}`);
        }

        fetchTeams();
    } catch (err) {
        console.error('Error removing user from team: ', err);
    }

    try {
        const userResponse = await fetch(`/api/users/${userId}`);
    
        if (userResponse.status === 404) {
            console.error('User has been deleted');
            return;
        }
    
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }
    
        const userData = await userResponse.json();
        const currentTeams: string[] = Array.isArray(userData.teams) ? userData.teams : [];

        const updatedTeams: string[] = currentTeams.includes(selectedTeamId)
            ? currentTeams.filter((teamId: string) => teamId !== selectedTeamId)
            : currentTeams; 
    
        const updateResponse = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teams: updatedTeams }),
        });
    
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to update user: ${errorText}`);
        }

        await fetchTeams();
    } catch (err) {
        console.error('Error adding user to team:', err);
    }
  };

  const handleEditTeam = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setEditTeamName(teamName);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editTeamName || !selectedTeamId) return alert('Please enter a team name and select a team.');

    try {
      const response = await fetch(`/api/teams/${selectedTeamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTeamName }),
      });

      if (!response.ok) throw new Error('Failed to update team name');
      setOpenEditDialog(false);
      setEditTeamName('');
      fetchTeams();
    } catch (err) {
      console.error('Error updating team name:', err);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!teamId) return;

    try {
        const usersResponse = await fetch('/api/users'); 
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const users = await usersResponse.json();
        const updateUserPromises = users.map(async (user: { id: string; teams: string[] }) => {
            if (user.teams.includes(teamId)) {
                const updatedTeams = user.teams.filter((tId: string) => tId !== teamId);
                try {
                    const updateResponse = await fetch(`/api/users/${user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teams: updatedTeams }), 
                    });

                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        throw new Error(`Failed to update user ${user.id}: ${errorText}`);
                    }
                } catch (err) {
                    console.error(`Error updating user ${user.id}:`, err);
                }
            }
        });

        await Promise.all(updateUserPromises);
        const deleteResponse = await fetch(`/api/teams/${teamId}`, {
            method: 'DELETE',
        });
        if (!deleteResponse.ok) throw new Error('Failed to delete team');
        setOpenDeleteConfirmDialog(false);
        fetchTeams();
    } catch (err) {
        console.error('Error handling team deletion:', err);
    }
};

  const handleDeleteTeamClick = (team: Team) => {
    setTeamToDelete(team);
    setOpenDeleteConfirmDialog(true);
  };

  const handleAddUserToTeamInDialog = async (userId: string) => {
    if (!selectedTeamId) return;
    try {
      const response = await fetch(`/api/teams/${selectedTeamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to add user to team');
      fetchTeams();
    } catch (err) {
      console.error('Error adding user to team:', err);
    }

    try {
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
    
        const userData = await userResponse.json();

        const currentTeams = Array.isArray(userData.teams) ? userData.teams : [];
    
        const updatedTeams = currentTeams.includes(selectedTeamId)
          ? currentTeams 
          : [...currentTeams, selectedTeamId]; 
    
        const updateResponse = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: updatedTeams }),
        });
    
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Failed to update user: ${errorText}`);
        }
        await fetchTeams();
      } catch (err) {
        console.error('Error adding user to team:', err);
      }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }} align="center">
        Team Management
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Create a new team
        </Typography>
        <TextField
          label="Team Name"
          variant="outlined"
          fullWidth
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleCreateTeam}>
          Create Team
        </Button>
      </Box>
      
      <Box>
        <Typography variant="h5" gutterBottom>
          Teams
        </Typography>
        <List>
          {teams.map((team) => (
            <ListItem
              key={team.id}
              divider
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                mb: 1,
                p: 2,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  cursor: 'pointer',
                },
              }}
            >
              <ListItemText
                primary={`${team.name} - Members: ${team.members.length}`}
              />
              <Tooltip title="Edit Team">
                <IconButton onClick={() => handleEditTeam(team.id, team.name)} sx={{ ml: 1 }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Team">
                <IconButton onClick={() => handleDeleteTeamClick(team)} sx={{ ml: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent sx={{ width: '100%' }}>
          <TextField
            label="Team Name"
            variant="outlined"
            fullWidth
            value={editTeamName}
            onChange={(e) => setEditTeamName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <Typography variant="h6">Team Members:</Typography>
          <List>
            {teamMembers.map(member => (
              <ListItem key={member.id}>
                <ListItemText primary={member.name} />
                <IconButton onClick={() => handleRemoveUserFromTeam(selectedTeamId, member.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>

          <FormControl fullWidth>
            <InputLabel>Add a user to team</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              label="Add a user to team"
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => handleAddUserToTeamInDialog(selectedUserId)}
          >
            Add User
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirmDialog}
        onClose={() => setOpenDeleteConfirmDialog(false)}
      >
        <DialogTitle>Are you sure you want to delete this team?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (teamToDelete) {
                handleDeleteTeam(teamToDelete.id);
              }
              setOpenDeleteConfirmDialog(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamManagementPage;
