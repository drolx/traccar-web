import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMediaQuery, Paper, Select, FormControl, Tooltip, IconButton, Box, MenuItem, Typography, Link } from '@mui/material';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import ReactCountryFlag from 'react-country-flag';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';
import WelcomeImage from '../resources/images/welcome.svg?react';
import { nativeEnvironment } from '../common/components/NativeInterface';
import ServiceInfo from '../data/service.json';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: theme.palette.primary.main,
    padding: theme.spacing(0.1, 2, 3, 2),
    width: theme.dimensions.sidebarWidth,
    [theme.breakpoints.down('lg')]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down('sm')]: {
      width: '0px',
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    boxShadow: '-2px 0px 16px rgba(0, 0, 0, 0.25)',
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 2, 0, 2),
    },
    [theme.breakpoints.down('lg')]: {
      padding: theme.spacing(2, 0, 0, 0),
    },
  },
  form: {
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: '100%',
  },
  headerLogo: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'none',
      visibility: 'hidden'
    },
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0, 2),
    },
  },
  footer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  footerCompany: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  menu: {
    gap: theme.spacing(2),
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(0.2),
    },
  },
  menuItem: {
    padding: theme.spacing(4, 6),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 3),
    },
  },
  menuItemFaqs: {
    padding: theme.spacing(4, 6),
    [theme.breakpoints.down('md')]: {
      display: 'none',
      visibility: 'hidden',
    },
  },
  menuItemFaqs: {
    padding: theme.spacing(4, 6),
    [theme.breakpoints.down('md')]: {
      display: 'none',
      visibility: 'hidden',
    },
  },
  menuItemBack: {
    padding: theme.spacing(4, 6),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2, 3),
      display: 'none',
      visibility: 'hidden',
    },
  }
}));

const LoginLayout = ({ children, isForm = true }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], country: values[1].country, name: values[1].name }));

  const languageEnabled = useSelector((state) => !state.session.server.attributes['ui.disableLoginLanguage']);
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const [showServerTooltip, setShowServerTooltip] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
          <IconButton disableRipple={true} className={classes.headerLogo} onClick={() => navigate("/")}>
            <LogoImage color={theme.palette.secondary.contrastText} />
          </IconButton>
        </div>
        <div style={{ height: '80%' }}>
          {!useMediaQuery(theme.breakpoints.down('lg')) && <WelcomeImage color={theme.palette.secondary.contrastText} />}
        </div>
      </div>
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Box className={classes.menu}>
            {location.pathname !== "/login" && (
              <MenuItem className={classes.menuItem} onClick={() => navigate("/login")}>
                <Typography variant="body1" color="text.primary">
                  {t('loginLogin')}
                </Typography>
              </MenuItem>
            )}
            <MenuItem className={classes.menuItem} onClick={() => navigate("/support")}>
              <Typography variant="body1" color="text.primary">
                {t('settingsSupport')}
              </Typography>
            </MenuItem>
            <MenuItem className={classes.menuItemFaqs} onClick={() => navigate("/faqs")}>
              <Typography variant="body1" color="text.primary">
                {"FAQ's"}
              </Typography>
            </MenuItem>
          </Box>
          {nativeEnvironment && changeEnabled && (
            <Tooltip title={t('settingsServer')}>
              <IconButton onClick={() => navigate('/change-server')}>
                <LockOpenIcon />
              </IconButton>
            </Tooltip>
          )}
          {languageEnabled && (
            <FormControl>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languageList.map((it) => (
                  <MenuItem key={it.code} value={it.code}>
                    <Box component="span" sx={{ mr: 1 }}>
                      <ReactCountryFlag countryCode={it.country} svg />
                    </Box>
                    {it.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        {isForm ? (
          <form className={classes.form}>
            {children}
          </form>
        ) : (
          <div style={{ height: '100%', width: '100%', overflow: 'scroll', }}>
            {children}
          </div>)}
        <div
          className={classes.footer}>
          <Typography>{ServiceInfo.dev.attribution} <Link underline="none" target="_blank" href={ServiceInfo.dev.link} color="primary">{ServiceInfo.dev.name}</Link></Typography>
          <Typography className={classes.footerCompany}>
            &copy;&nbsp;
            {(new Date()).getFullYear()}
            <span>,&nbsp;</span>
            <Link underline="none" target="_blank" href={ServiceInfo.company.link} color="primary">{ServiceInfo.company.name}</Link>
            <span>,&nbsp;{ServiceInfo.company.attribution}</span>
          </Typography>
        </div>
      </Paper>
    </main>
  );
};

export default LoginLayout;
