import {
  Divider, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CreateIcon from '@mui/icons-material/Create';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import StorageIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import PublishIcon from '@mui/icons-material/Publish';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import HelpIcon from '@mui/icons-material/Help';
import CampaignIcon from '@mui/icons-material/Campaign';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../common/components/LocalizationProvider';
import {
  useAdministrator, useManager, useRestriction,
} from '../../common/util/permissions';
import useFeatures from '../../common/util/useFeatures';

const MenuItem = ({
  title, link, icon, selected, dense = false,
}) => (
  <ListItemButton key={link} dense={dense} component={Link} to={link} selected={selected}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const SettingsMenu = ({ dense = true }) => {
  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const supportLink = useSelector((state) => state.session.server.attributes.support);

  const features = useFeatures();

  return (
    <>
      {!readonly && (<MenuItem
        dense={dense}
        title={t('settingsUser')}
        link={`/settings/user/${userId}`}
        icon={<PersonIcon />}
        selected={location.pathname === `/settings/user/${userId}`}
      />)}
      <MenuItem
        dense={dense}
        title={t('sharedPreferences')}
        link="/settings/preferences"
        icon={<SettingsIcon />}
        selected={location.pathname === '/settings/preferences'}
      />
      {!readonly && (
        <>
          <MenuItem
            dense={dense}
            title={t('sharedNotifications')}
            link="/settings/notifications"
            icon={<NotificationsIcon />}
            selected={location.pathname.startsWith('/settings/notification')}
          />
          <MenuItem
            dense={dense}
            title={t('deviceTitle')}
            link="/settings/devices"
            icon={<SmartphoneIcon />}
            selected={location.pathname.startsWith('/settings/device')}
          />
          {!features.disableGroups && (
            <MenuItem
              dense={dense}
              title={t('settingsGroups')}
              link="/settings/groups"
              icon={<FolderIcon />}
              selected={location.pathname.startsWith('/settings/group')}
            />
          )}
          <MenuItem
            dense={dense}
            title={t('sharedGeofences')}
            link="/geofences"
            icon={<CreateIcon />}
            selected={location.pathname.startsWith('/settings/geofence')}
          />
          {!features.disableDrivers && (
            <MenuItem
              dense={dense}
              title={t('sharedDrivers')}
              link="/settings/drivers"
              icon={<PersonIcon />}
              selected={location.pathname.startsWith('/settings/driver')}
            />
          )}
          {!features.disableCalendars && (
            <MenuItem
              dense={dense}
              title={t('sharedCalendars')}
              link="/settings/calendars"
              icon={<TodayIcon />}
              selected={location.pathname.startsWith('/settings/calendar')}
            />
          )}
          {!features.disableComputedAttributes && (
            <MenuItem
              dense={dense}
              title={t('sharedComputedAttributes')}
              link="/settings/attributes"
              icon={<StorageIcon />}
              selected={location.pathname.startsWith('/settings/attribute')}
            />
          )}
          {!features.disableMaintenance && (
            <MenuItem
              dense={dense}
              title={t('sharedMaintenance')}
              link="/settings/maintenances"
              icon={<BuildIcon />}
              selected={location.pathname.startsWith('/settings/maintenance')}
            />
          )}
          {!features.disableSavedCommands && (
            <MenuItem
              dense={dense}
              title={t('sharedSavedCommands')}
              link="/settings/commands"
              icon={<PublishIcon />}
              selected={location.pathname.startsWith('/settings/command')}
            />
          )}
          {supportLink && (
            <MenuItem
              dense={dense}
              title={t('settingsSupport')}
              link={supportLink}
              icon={<HelpIcon />}
            />
          )}
        </>
      )}
      {manager && (
        <>
          <Divider />
          <MenuItem
            dense={dense}
            title={t('serverAnnouncement')}
            link="/settings/announcement"
            icon={<CampaignIcon />}
            selected={location.pathname === '/settings/announcement'}
          />
          {admin && (
            <MenuItem
              dense={dense}
              title={t('settingsServer')}
              link="/settings/server"
              icon={<StorageIcon />}
              selected={location.pathname === '/settings/server'}
            />
          )}
          <MenuItem
            dense={dense}
            title={t('settingsUsers')}
            link="/settings/users"
            icon={<PeopleIcon />}
            selected={location.pathname.startsWith('/settings/user') && location.pathname !== `/settings/user/${userId}`}
          />
        </>
      )}
    </>
  );
};

export default SettingsMenu;
