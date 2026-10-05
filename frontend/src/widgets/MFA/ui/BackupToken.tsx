import { useEffect, useState } from 'react';
import { Grid, Box, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, Button, TextField, Tooltip, Snackbar, Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios'
import req from 'shared/lib/req';
import { DS } from '../lib/styles';

const defaultStyles = DS(1, 'rem');

const CopyToClipboardButton = ({ textToCopy, ds = defaultStyles  }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setOpenSnackbar(true);
      } else {
        alert('Clipboard API not supported. Please, copy the text manually.');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Tooltip
        title="Copy to clipboard"
        arrow
        componentsProps={{
          tooltip: { sx: { fontSize: ds.textFontSize } }
        }}
      >
        <Button onClick={handleCopy} variant="text" startIcon={<ContentCopyIcon />} sx={{ fontSize: ds.textFontSize }}>
          Copy
        </Button>
      </Tooltip>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', fontSize: ds.textFontSize }}>
          Text copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

function VerifyByPasswordMode({ onVerified, onFailed, onModeChange, ds }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = () => {
    setLoading(true);
    req.post('/api/mfa/v1/backup/', { password }).then((data: { tokens?: string[] }) => {
      setLoading(false);
      onVerified(data.tokens || []);
    }).catch(( { detail }) => {
      const message = detail || 'Password verification failed. Please try again.';
      setLoading(false);
      setError(message);
      onFailed(message);
    });
  }

  return (
    <Stack spacing={2}>
      <DialogContentText sx={{ fontSize: ds.textFontSize}}>
        Enter your password to view your backup codes
      </DialogContentText>
      <TextField
        error={!!error}
        helperText={error}
        fullWidth
        label="Password"
        type="password"
        autoComplete="current-password"
        InputProps={{
          sx: { fontSize: ds.textFontSize }
        }}
        InputLabelProps={{
          sx: { fontSize: ds.textFontSize }
        }}
        FormHelperTextProps={{
          sx: { fontSize: ds.helperFontSize }
        }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
      />
      <Stack spacing={1}>
        <Button disabled={loading} onClick={handleVerify} sx={{ fontSize: ds.textFontSize }} variant="contained" fullWidth>Verify Password</Button>
        <Button onClick={() => onModeChange('email')} sx={{ fontSize: ds.textFontSize }} fullWidth>Forgot password? Verify via email instead</Button>
      </Stack>
    </Stack>
  )
}

function VeifyByEmailMode({ onVerified, onFailed, onModeChange, ds }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    req.post('/api/mfa/v1/otp/generate/', { email }).then(() => {
      setLoading(false);
      onModeChange('token');
    }).catch(( { detail }) => {
      const message = detail || 'Email verification failed. Please try again.';
      setLoading(false);
      setError(message);
    });
  }

  return (
    <Stack spacing={2}>
      <DialogContentText sx={{ fontSize: ds.textFontSize}}>
        We'll send a verification code to your email address
      </DialogContentText>
      <TextField
        error={!!error}
        helperText={error}
        fullWidth
        label="Email Address"
        type="email"
        InputProps={{
          sx: { fontSize: ds.textFontSize }
        }}
        InputLabelProps={{
          sx: { fontSize: ds.textFontSize }
        }}
        FormHelperTextProps={{
          sx: { fontSize: ds.helperFontSize }
        }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
      />
      <Stack spacing={1}>
        <Button disabled={loading} onClick={handleVerify} sx={{ fontSize: ds.textFontSize }} variant="contained" fullWidth>Send Verification Code</Button>
        <Button onClick={() => onModeChange('password')} sx={{ fontSize: ds.textFontSize }} fullWidth>Back to password</Button>
      </Stack>
    </Stack>
  )
}

function VerifyByTokenMode({ onVerified, onFailed, onModeChange, ds }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = () => {
    setLoading(true);
    req.post('/api/mfa/v1/otp/verify/', { token }).then((data: any) => {
      setLoading(false);
      onVerified(data.tokens || []);
      onModeChange('password');
    }).catch(( { detail }) => {
      const message = detail || 'Token verification failed. Please try again.';
      setLoading(false);
      setError(message);
    });
  }

  return (
    <Stack spacing={2}>
      <DialogContentText sx={{ fontSize: ds.textFontSize}}>
        Enter the verification code sent to your email
      </DialogContentText>
      <TextField
        error={!!error}
        helperText={error}
        fullWidth
        label="Enter 6-digit code"
        InputProps={{
          sx: { fontSize: ds.textFontSize }
        }}
        InputLabelProps={{
          sx: { fontSize: ds.textFontSize }
        }}
        FormHelperTextProps={{
          sx: { fontSize: ds.helperFontSize }
        }}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
      />
      <Stack spacing={1}>
        <Button disabled={loading} onClick={handleVerify} sx={{ fontSize: ds.textFontSize }} variant="contained" fullWidth>Verify Code</Button>
        <Button onClick={() => onModeChange('email')} sx={{ fontSize: ds.textFontSize }} fullWidth>Change email</Button>
      </Stack>
    </Stack>
  )
}

function RevialTokensDialog({ open, onClose, onVerified, onFailed, attempts, ds = defaultStyles }) {
  const modes = {
    password: VerifyByPasswordMode,
    email: VeifyByEmailMode,
    token: VerifyByTokenMode,
  };

  const [verificationMode, setVerificationMode] = useState('password');
  const [error, setError] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);

  const Verification = modes[verificationMode];

  const handleFailed = (message: string) => {
    setAttemptsRemaining(prev => prev - 1);
    setError(message);
    onFailed(message, attemptsRemaining - 1 <= 0);
  }

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    setAttemptsRemaining(attempts);
  }, [attempts]);

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ fontSize: ds.headerFontSize }}>
        Verify Your Identity
      </DialogTitle>
      <DialogContent>
        {attemptsRemaining ? (
          <>
          {attemptsRemaining === 1 && verificationMode === 'password' && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: ds.textFontSize }}>
              Last attempt before lockout!
              Consider <a style={{ cursor: 'pointer' }} onClick={() => setVerificationMode('email')}>verifying via email</a> instead.
            </Alert>
          )}
          <Verification onVerified={onVerified} onFailed={handleFailed} onModeChange={setVerificationMode} ds={ds} />
          </>
        ) : error ? (
          <Stack spacing={2}>
            <Alert severity="error" sx={{ mb: 2, fontSize: ds.textFontSize }}>{error}</Alert>
            <Button onClick={onClose} sx={{ fontSize: ds.textFontSize }} fullWidth>Ok</Button>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function GenerateTokensDialog({ open, onSuccess, onFailed, onClose, ds }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = () => {
    setLoading(true);
    req.post('/api/mfa/v1/backup/generate/', {}).then((data: { tokens?: string[] }) => {
      setLoading(false);
      onSuccess(data.tokens || []);
    }).catch(( { detail }) => {
      const message = detail || 'Failed to generate new backup codes. Please try again.';
      setLoading(false);
      setError(message);
      onFailed(message);
    });
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ fontSize: ds.headerFontSize }}>
        Generate new backup codes?
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText sx={{ fontSize: ds.textFontSize}}>
            This will invalidate all your existing backup codes. Make sure you have access to your primary authentication method before proceeding.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ fontSize: ds.textFontSize }}>{error}</Alert>}
          <Stack spacing={1} direction="row">
            <Button onClick={onClose} sx={{ fontSize: ds.textFontSize }} fullWidth>Cancel</Button>
            <Button disabled={loading} onClick={handleGenerate} sx={{ fontSize: ds.textFontSize }} variant="contained" fullWidth>Generate new codes</Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

function MFAToken({ token, index }) {
  const padZero = (num, length = 2) => {
    return String(num).padStart(length, '0');
  }
  return (
    <Box sx={{ p: 1, border: '1px solid #ccc', fontSize: '1.4rem', fontFamily: 'monospace', borderRadius: '6px'}}>
      <span style={{ marginRight: '10px', color: '#64748b' }}>{padZero(index + 1)}</span> {token}
    </Box>
  )
}

function MFATokenList({ tokens }) {
  return (
    <Grid container spacing={2}>
      {tokens.map((item, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <MFAToken key={index} token={item} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}

export function MFABackupTokens({ ds = defaultStyles }) {
  const [loaded, setLoaded] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);
  const [verify, setVerify] = useState(false);
  const [generateNew, setGenerateNew] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleVerified = (newTokens: string[]) => {
    setTokens(newTokens);
    setVerify(false);
    setVerified(true);
    setErrorMessage(null);
  }

  const handleFailed = (message: string, blocked) => {
    setErrorMessage(message);
    setIsBlocked(blocked);

    if (blocked) {
      setVerify(false);
    }
  }

  const handleGenerated = (newTokens: string[]) => {
    setTokens(newTokens);
    setGenerateNew(false);
    setVerified(true);
    setErrorMessage(null);
  }

  const hideCodes = () => {
    setVerified(false);
    setTokens(() => tokens.map((token) => '*'.repeat(token.length)));
  }

  useEffect(() => {
    axios.get('/api/mfa/v1/backup/').then(( { data }) => {
      setTokens(data.tokens || []);
      setAuthAttempts(data.auth_attempts);
      setIsBlocked(data.auth_attempts <= 0);
    }).catch(({ response }) => {
      const messageText = response?.data?.detail || 'Failed to fetch backup tokens.';
      setErrorMessage(messageText);
      setIsBlocked(true);
    }).finally(() => {
      setLoaded(true);
    });
  }, []);

  return (
    <>
    <RevialTokensDialog
      open={verify}
      onClose={() => setVerify(false)}
      onVerified={handleVerified}
      onFailed={handleFailed}
      attempts={authAttempts}
      ds={ds}
    />
    <GenerateTokensDialog
      open={generateNew}
      onClose={() => setGenerateNew(false)}
      onSuccess={handleGenerated}
      onFailed={() => {}}
      ds={ds}
    />
    <section className=''>
      <h2>Security Settings</h2>
      {isBlocked && errorMessage && <Alert severity="error" sx={{ mb: 2, fontSize: ds.textFontSize }}>{errorMessage}</Alert>}
      {loaded ? (
        <>
        {!isBlocked && tokens.length > 0 ? (
          <Stack spacing={2}>
            <div>Use these codes to access your account if you lose your device</div>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              { !isBlocked && !verified && <button className="btn btn-primary" type="button" onClick={() => setVerify(true)}>Reveal codes</button> }
              { !isBlocked && verified && <button className="btn btn-primary" type="button" onClick={hideCodes}>Hide codes</button> }
              { verified && <CopyToClipboardButton textToCopy={tokens.join('\n')} /> }
            </Stack>
            <MFATokenList tokens={tokens} />
          </Stack>
        ) : !isBlocked && (
          <p>No backup codes available.</p>
        )}
        </>
      ) : <p>Loading...</p> }
      {!isBlocked && <button className="btn btn-secondary" type="button" onClick={() => setGenerateNew(true)}>Generate new codes</button>}
    </section>
    </>
  )
}
