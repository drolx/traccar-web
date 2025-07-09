import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, TableRow, TableCell, TableHead, TableBody, IconButton, Tooltip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { sessionActions } from '../store';

const useStyles = makeStyles()((theme) => ({
  columnAction: {
    maxWidth: '200px',
    padding: theme.spacing('2px', 0, '2px', 0),
    whiteSpace: 'nowrap',
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontSize: 12,
  },
}));

const LogsPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  useEffect(() => {
    dispatch(sessionActions.enableLogs(true));
    return () => dispatch(sessionActions.enableLogs(false));
  }, []);

  const items = useSelector((state) => state.session.logs);

  const registerDevice = (uniqueId) => {
    const query = new URLSearchParams({ uniqueId });
    navigate(`/settings/device?${query.toString()}`);
  };

  const cellProps = {
    className: classes.columnAction,
    padding: 'none',
    size: 'small',
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedLogs']}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell {...cellProps} />
            <TableCell {...cellProps}>{t('deviceIdentifier')}</TableCell>
            <TableCell {...cellProps}>{t('positionProtocol')}</TableCell>
            <TableCell {...cellProps}>{t('commandData')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell {...cellProps}>
                {item.deviceId ? (
                  <IconButton color="success" size="small" disabled>
                    <CheckCircleOutlineIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Tooltip title={t('loginRegister')}>
                    <IconButton color="error" size="small" onClick={() => registerDevice(item.uniqueId)}>
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell {...cellProps}>{item.uniqueId}</TableCell>
              <TableCell {...cellProps}>{item.protocol}</TableCell>
              <TableCell {...cellProps}>{item.data}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default LogsPage;
