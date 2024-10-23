import * as React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Paper,
    Button,
    Avatar,
    Menu,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import SettingsMenu from '../../settings/components/SettingsMenu';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { nativePostMessage } from './NativeInterface';

const DesktopMenu = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const t = useTranslation();
    const user = useSelector((state) => state.session.user);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    /** TODO: Fix duplicate of logout method */
    const handleLogout = async () => {
        setAnchorEl(null);

        const notificationToken = window.localStorage.getItem('notificationToken');
        if (notificationToken && !user.readonly) {
            window.localStorage.removeItem('notificationToken');
            const tokens = user.attributes.notificationTokens?.split(',') || [];
            if (tokens.includes(notificationToken)) {
                const updatedUser = {
                    ...user,
                    attributes: {
                        ...user.attributes,
                        notificationTokens: tokens.length > 1 ? tokens.filter((it) => it !== notificationToken).join(',') : undefined,
                    },
                };
                await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser),
                });
            }
        }

        await fetch('/api/session', { method: 'DELETE' });
        nativePostMessage('logout');
        navigate('/login');
        dispatch(sessionActions.updateUser(null));
    };
    return (
        <Paper elevation={3}>
            <Button color="primary" size="large" onClick={handleClick} sx={{ textTransform: 'none' }}>
                <Avatar color="primary" sx={{ width: 32, height: 32, mr: 1 }}>
                    <PersonIcon />
                </Avatar>
                <Typography sx={{ minWidth: 80 }}>{(user && user.name) ?? t('settingsUser')}</Typography>
                <ArrowDropDown />
            </Button>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    style: {
                        width: '224px',
                        marginTop: '8px',
                    },
                }}
            >
                <ListItemButton key="/reports/route" dense={true} component={Link} to="/reports/route">
                    <ListItemIcon>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('reportTitle')} />
                </ListItemButton>
                <Divider />
                <SettingsMenu dense={true} />
                <Divider />
                <ListItemButton dense={true} component={Link} onClick={handleLogout}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('loginLogout')} />
                </ListItemButton>
            </Menu>
        </Paper>
    );
};

export default DesktopMenu;

