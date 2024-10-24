import React from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery, Paper, Select, FormControl, Tooltip, Box, MenuItem, Typography, Link } from '@mui/material';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import ReactCountryFlag from 'react-country-flag';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';
import WelcomeImage from '../resources/images/welcome.svg?react';
import { nativeEnvironment } from '../common/components/NativeInterface';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.primary.main,
    padding: theme.spacing(3),
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
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  menuItem: {
    padding: theme.spacing(4, 6),
    borderRadius: 4,
  },
}));

const LoginLayout = ({ children }) => {
  const classes = useStyles();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], country: values[1].country, name: values[1].name }));

  const languageEnabled = useSelector((state) => !state.session.server.attributes['ui.disableLoginLanguage']);
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {!useMediaQuery(theme.breakpoints.down('lg')) && <WelcomeImage color={theme.palette.secondary.contrastText} />}
      </div>
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <span className={classes.headerLogo}>
            <LogoImage color={theme.palette.secondary.contrastText} />
          </span>
          <Box className={classes.menu}>
            <MenuItem className={classes.menuItem}>
              <Typography variant="body1" color="text.primary">
                {'Home'}
              </Typography>
            </MenuItem>
            <MenuItem className={classes.menuItem}>
              <Typography variant="body1" color="text.primary">
                {'Support'}
              </Typography>
            </MenuItem>
            <MenuItem className={classes.menuItem}>
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

        <form className={classes.form}>
          {children}
        </form>

        <div
          className={classes.footer}>
          <Typography>Powered by <Link underline="none" target="_blank" href="https://drolx.com" color="primary">drolx Labs</Link></Typography>
          <Typography className={classes.footerCompany}>
            &copy;&nbsp;
            {(new Date()).getFullYear()}
            <span>,&nbsp;</span>
            <Link underline="none" target="_blank" href="https://gpstrack.ng" color="primary">{'Tang Telematics'}</Link>
            <span>,&nbsp;{'All rights reserved.'}</span>
          </Typography>
        </div>
      </Paper>
    </main>
  );
};

export default LoginLayout;
