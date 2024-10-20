import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Paper, Button, Avatar, Menu, MenuItem, ListItemIcon, Divider, Typography, } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
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
                        width: '200px',
                        marginTop: '8px',
                    },
                }}
            >
                <MenuItem onClick={() => navigate(`/settings/user/${user.id}`)}>
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <Typography>{t('settingsUser')}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate('/reports/route')}>
                    <ListItemIcon>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <Typography>{t('reportTitle')}</Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings/preferences')}>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <Typography>{t('settingsTitle')}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <Typography>{t('loginLogout')}</Typography>
                </MenuItem>
            </Menu>
        </Paper>
    );
};

export default DesktopMenu;

