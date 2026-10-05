import { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

interface Invitation {
  id: number;
  organization: { id: number; name: string };
  role_display?: string;
  timestamp: string;
}

export function OrgPendingInvitations({ onAccepted = () => {} }: { onAccepted?: () => void }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('/api/organizations/v1/my/invitations')
      .then((response) => setInvitations(response.data))
      .catch((error) => console.error('Error fetching invitations:', error));
  }, []);

  const handleAccept = async (invitation: Invitation) => {
    setAcceptingId(invitation.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { data } = await axios.get('/api/csrf-token/');
      await axios.post(`/api/organizations/v1/my/invitations/${invitation.id}/accept`, {}, {
        headers: { 'X-CSRFToken': data.token },
      });
      setInvitations((items) => items.filter((item) => item.id !== invitation.id));
      setSuccessMessage(`You have joined ${invitation.organization.name}.`);
      onAccepted();
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Unable to accept the invitation.');
    } finally {
      setAcceptingId(null);
    }
  };

  if (!invitations.length && !successMessage) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {invitations.length > 0 && (
        <>
          <Typography variant="h6">Pending invitations</Typography>
          <List>
            {invitations.map((invitation) => (
              <ListItem
                key={invitation.id}
                divider
                secondaryAction={(
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={acceptingId === invitation.id}
                    onClick={() => handleAccept(invitation)}
                  >
                    Accept
                  </Button>
                )}
              >
                <ListItemText
                  primary={invitation.organization.name}
                  secondary={invitation.role_display}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  );
}
