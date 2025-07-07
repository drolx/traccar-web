import { useEffect, useState } from 'react';
import {
  useMediaQuery, Button, TextField, Link, Snackbar, IconButton,
} from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken, handleLoginTokenListeners, nativeEnvironment, nativePostMessage,
} from '../common/components/NativeInterface';
import LogoImage from './LogoImage';
import { useCatch } from '../reactHelper';
import Loader from '../common/components/Loader';
import QrCodeDialog from '../common/components/QrCodeDialog';

const useStyles = makeStyles()((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
  },
  footer: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  registerButton: {
    minWidth: 'unset',
  },
  link: {
    cursor: 'pointer',
  },
}));

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector((state) => state.session.server.openIdEnabled && state.session.server.openIdForce);
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate('/');
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate('/');
    } else {
      throw Error(await response.text());
    }
  });

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return (<Loader />);
  }

  return (
    <LoginLayout>
      
      <div className={classes.container}>
        {useMediaQuery(theme.breakpoints.down('lg')) && <LogoImage color={theme.palette.primary.main} />}
        <TextField
          required
          error={failed}
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          autoFocus={!email}
          onChange={(e) => setEmail(e.target.value)}
          helperText={failed && 'Invalid username or password'}
        />
        <TextField
          required
          error={failed}
          label={t('userPassword')}
          name="password"
          value={password}
          type="password"
          autoComplete="current-password"
          autoFocus={!!email}
          onChange={(e) => setPassword(e.target.value)}
        />
        {codeEnabled && (
          <TextField
            required
            error={failed}
            label={t('loginTotpCode')}
            name="code"
            value={code}
            type="number"
            onChange={(e) => setCode(e.target.value)}
          />
        )}
        <Button
          onClick={handlePasswordLogin}
          type="submit"
          variant="contained"
          color="secondary"
          disabled={!email || !password || (codeEnabled && !code)}
        >
          {t('loginLogin')}
        </Button>
        {openIdEnabled && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="contained"
            color="secondary"
          >
            {t('loginOpenId')}
          </Button>
        )}
        <div className={classes.extraContainer}>
          {registrationEnabled && (
            <Link
              onClick={() => navigate('/register')}
              className={classes.link}
              underline="none"
              variant="caption"
            >
              {t('loginRegister')}
            </Link>
          )}
          {emailEnabled && (
            <Link
              onClick={() => navigate('/reset-password')}
              className={classes.link}
              underline="none"
              variant="caption"
            >
              {t('loginReset')}
            </Link>
          )}
        </div>
      </div>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={(
          <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      />
    </LoginLayout>
  );
};

export default LoginPage;
