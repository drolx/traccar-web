import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  IconButton, Tooltip, ListItemText, ListItemButton,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatSpeed, getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  mnimalText: {
    fontSize: '0.65rem',
    marginRight: '0.3rem',
  },
  deviceStatus: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
  },
  selected: {
    backgroundColor: theme.palette.action.selected,
  },
  successBackground: {
    backgroundColor: theme.palette.success.main,
  },
  warningBackground: {
    backgroundColor: theme.palette.warning.main,
  },
  errorBackground: {
    backgroundColor: theme.palette.error.main,
  },
  neutralBackground: {
    backgroundColor: theme.palette.neutral.main,
  },
  nameText: {

  },
  mnimalText: {
    fontSize: '0.65rem',
    marginRight: '0.3rem',
  },
  deviceStatusRoot: {
    minWidth: 12,
    alignItems: 'center'
  },
  deviceStatus: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);
  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');
  const speedUnit = useAttributePreference('speedUnit');

  const primarySection = () => {
    const time = dayjs(item.lastUpdate).fromNow() ?? 'None';

    return (<div>
      <div className={classes.mnimalText}>{time}</div>
      <div>
        {item[devicePrimary]}
        {deviceSecondary && item[deviceSecondary] && ` • ${item[deviceSecondary]}`}
      </div>
    </div>)
  };

  const secondarySection = () => {
    return (<>
      {position && (
        <Tooltip title={`${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`}>
          <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{position.address ?? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}` }</span>
        </Tooltip>
      )}
    </>)
  };

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={selectedDeviceId === item.id}
        className={selectedDeviceId === item.id ? classes.selected : null}
      >
        <ListItemIcon style={{minWidth: '20px'}}>
          <Tooltip title={item.status}>
            <span className={[classes.deviceStatus, classes[getStatusColor(item.status) + 'Background']]}></span>
          </Tooltip>
        </ListItemIcon>
        <ListItemText
          primary={primarySection()}
          secondary={secondarySection()}
          slotProps={{
            primary: { noWrap: true, fontSize: '0.85rem' },
            secondary: { noWrap: true, fontSize: '0.7rem' },
          }}
        />
        {position && (
          <div style={{ whiteSpace: 'nowrap' }}>
            <span className={classes.mnimalText}>{formatSpeed(position.speed, speedUnit, t)}</span>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={20} height={20} className={classes.success} />
                  ) : (
                    <EngineIcon width={20} height={20} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                <IconButton size="small">
                  {(position.attributes.batteryLevel > 70 && (
                    position.attributes.charge
                      ? (<BatteryChargingFullIcon fontSize="small" className={classes.success} />)
                      : (<BatteryFullIcon fontSize="small" className={classes.success} />)
                  )) || (position.attributes.batteryLevel > 30 && (
                    position.attributes.charge
                      ? (<BatteryCharging60Icon fontSize="small" className={classes.warning} />)
                      : (<Battery60Icon fontSize="small" className={classes.warning} />)
                  )) || (
                      position.attributes.charge
                        ? (<BatteryCharging20Icon fontSize="small" className={classes.error} />)
                        : (<Battery20Icon fontSize="small" className={classes.error} />)
                    )}
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
