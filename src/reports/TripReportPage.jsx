import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  IconButton, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import {
  formatDistance, formatSpeed, formatVolume, formatTime, formatNumericHours,
} from '../common/util/formatter';
import ReportFilter from './components/ReportFilter';
import { useAttributePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ColumnSelect from './components/ColumnSelect';
import usePersistedState from '../common/util/usePersistedState';
import { useCatch, useEffectAsync } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import AddressValue from '../common/components/AddressValue';
import TableShimmer from '../common/components/TableShimmer';
import MapMarkers from '../map/MapMarkers';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import scheduleReport from './common/scheduleReport';
import MapScale from '../map/MapScale';

const columnsArray = [
  ['startTime', 'reportStartTime'],
  ['startOdometer', 'reportStartOdometer'],
  ['startAddress', 'reportStartAddress'],
  ['endTime', 'reportEndTime'],
  ['endOdometer', 'reportEndOdometer'],
  ['endAddress', 'reportEndAddress'],
  ['distance', 'sharedDistance'],
  ['averageSpeed', 'reportAverageSpeed'],
  ['maxSpeed', 'reportMaximumSpeed'],
  ['duration', 'reportDuration'],
  ['spentFuel', 'reportSpentFuel'],
  ['driverName', 'sharedDriver'],
];
const columnsMap = new Map(columnsArray);

const TripReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [columns, setColumns] = usePersistedState('tripColumns', ['duration', 'startAddress', 'endAddress', 'distance', 'maxSpeed', 'startTime', 'endTime']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [route, setRoute] = useState(null);

  const createMarkers = () => ([
    {
      latitude: selectedItem.startLat,
      longitude: selectedItem.startLon,
      image: 'start-success',
    },
    {
      latitude: selectedItem.endLat,
      longitude: selectedItem.endLon,
      image: 'finish-error',
    },
  ]);

  useEffectAsync(async () => {
    if (selectedItem) {
      const query = new URLSearchParams({
        deviceId: selectedItem.deviceId,
        from: selectedItem.startTime,
        to: selectedItem.endTime,
      });
      const response = await fetch(`/api/reports/route?${query.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
      });
      if (response.ok) {
        setRoute(await response.json());
      } else {
        throw Error(await response.text());
      }
    } else {
      setRoute(null);
    }
  }, [selectedItem]);

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    if (type === 'export') {
      window.location.assign(`/api/reports/trips/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/trips/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/trips?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          setItems(await response.json());
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'trips';
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value].name;
      case 'startTime':
      case 'endTime':
        return formatTime(value, 'minutes');
      case 'startOdometer':
      case 'endOdometer':
      case 'distance':
        return formatDistance(value, distanceUnit, t);
      case 'averageSpeed':
      case 'maxSpeed':
        return value > 0 ? formatSpeed(value, speedUnit, t) : null;
      case 'duration':
        return formatNumericHours(value, t);
      case 'spentFuel':
        return value > 0 ? formatVolume(value, volumeUnit, t) : null;
      case 'startAddress':
        return (<AddressValue latitude={item.startLat} longitude={item.startLon} originalAddress={value} />);
      case 'endAddress':
        return (<AddressValue latitude={item.endLat} longitude={item.endLon} originalAddress={value} />);
      default:
        return value;
    }
  };

  const cellProps = {
    className: classes.columnAction,
    padding: 'none',
    size: 'small',
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportTrips']}>
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {route && (
                <>
                  <MapRoutePath positions={route} />
                  <MapMarkers markers={createMarkers()} />
                  <MapCamera positions={route} />
                </>
              )}
            </MapView>
            <MapScale />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} multiDevice includeGroups loading={loading}>
              <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
            </ReportFilter>
          </div>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {items.length > 0 && <TableCell {...cellProps} />}
                <TableCell {...cellProps}>{t('sharedDevice')}</TableCell>
                {columns.map((key) => (<TableCell key={key} {...cellProps}>{t(columnsMap.get(key))}</TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.map((item) => (
                <TableRow key={item.startPositionId} hover className={classes.rows} selected={selectedItem === item} onClick={() => setSelectedItem(selectedItem === item ? null : item)}>
                  <TableCell {...cellProps}>
                    {selectedItem === item && (
                      <IconButton size="small" sx={{ padding: 0 }}>
                        <GpsFixedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell {...cellProps}>{devices[item.deviceId].name}</TableCell>
                  {columns.map((key) => (
                    <TableCell key={key} {...cellProps}>
                      {formatValue(item, key)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (<TableShimmer columns={columns.length + 2} startAction />)}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default TripReportPage;
