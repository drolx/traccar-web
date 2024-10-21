import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';;
import CloseIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Repeat';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsIcon from '@mui/icons-material/Settings';
import PendingIcon from '@mui/icons-material/Pending';
import LocationIcon from '@mui/icons-material/LocationSearching';
import { useTranslation } from './LocalizationProvider';
import PositionValue from './PositionValue';
import { useDeviceReadonly } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';

const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 1, 0, 2),
  },
  headerText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.neutral.main,
  },
  content: {
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
  },
  root: ({ desktopPadding }) => ({
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(73% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(5),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(5)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell size='small' sx={{ textWrap: 'nowrap' }} className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell size='small' className={classes.cell}>
        <Typography variant="body2" color="textSecondary">{content}</Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'address,fixTime,speed');

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable
            handle={`.${classes.media}, .${classes.header}`}
          >
            <Card elevation={3} className={classes.card}>
              <Stack className={classes.headerText} direction="row">
                <Typography sx={{ fontWeight: 600 }} variant="body1">{device.name}</Typography>
              </Stack>
              {deviceImage && <CardMedia
                className={classes.media}
                image={`/api/media/${device.uniqueId}/${deviceImage}`}
              >
              </CardMedia>
              }
              {position && (
                <CardContent sx={{ padding: 0.55 }} className={classes.content}>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      {positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => (
                        <StatusRow
                          key={key}
                          name={`${positionAttributes[key]?.name || key}:`}
                          content={(
                            <PositionValue
                              position={position}
                              property={position.hasOwnProperty(key) ? key : null}
                              attribute={position.hasOwnProperty(key) ? null : key}
                            />
                          )}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <IconButton
                  color="primary"
                  onClick={onClose}
                  onTouchStart={onClose}
                >
                  <CloseIcon />
                </IconButton>

                <IconButton
                  color="secondary"
                  onClick={(e) => navigate(`/position/${position.id}`)}
                  disabled={!position}
                >
                  <PendingIcon />
                </IconButton>

                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position}
                >
                  <LocationIcon />
                </IconButton>

                <IconButton
                  onClick={() => navigate('/replay')}
                  disabled={disableActions || !position}
                >
                  <ReplayIcon />
                </IconButton>
                <IconButton
                  onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                  disabled={disableActions}
                >
                  <PublishIcon />
                </IconButton>
                <IconButton
                  onClick={() => navigate(`/settings/device/${deviceId}`)}
                  disabled={disableActions || deviceReadonly}
                >
                  <SettingsIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Draggable>
        )}
      </div>
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {/* <MenuItem onClick={() => navigate(`/position/${position.id}`)}><Typography color="secondary">{t('sharedShowDetails')}</Typography></MenuItem> */}
          <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>{t('linkAppleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>{t('linkStreetView')}</MenuItem>
          {navigationAppTitle && <MenuItem component="a" target="_blank" href={navigationAppLink.replace('{latitude}', position.latitude).replace('{longitude}', position.longitude)}>{navigationAppTitle}</MenuItem>}
          {!shareDisabled && !user.temporary && <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}>{t('deviceShare')}</MenuItem>}
        </Menu>
      )}
    </>
  );
};

export default StatusCard;
