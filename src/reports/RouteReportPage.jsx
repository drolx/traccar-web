import {
  Fragment, useCallback, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ReportFilter from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import PositionValue from '../common/components/PositionValue';
import ColumnSelect from './components/ColumnSelect';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import scheduleReport from './common/scheduleReport';
import MapScale from '../map/MapScale';
import { useRestriction, useDeviceReadonly } from '../common/util/permissions';
import CollectionActions from '../settings/components/CollectionActions';

const RouteReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const devices = useSelector((state) => state.devices.items);
  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();

  const [available, setAvailable] = useState([]);
  const [columns, setColumns] = useState(['fixTime', 'speed', 'address', 'course', 'latitude', 'longitude']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const selectedIcon = useRef();

  useEffect(() => {
    if (selectedIcon.current) {
      selectedIcon.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [selectedIcon.current]);

  const onMapPointClick = useCallback((positionId) => {
    setSelectedItem(items.find((it) => it.id === positionId));
  }, [items, setSelectedItem]);

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    if (type === 'export') {
      window.location.assign(`/api/reports/route/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/route/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/route?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          const keySet = new Set();
          const keyList = [];
          data.forEach((position) => {
            Object.keys(position).forEach((it) => keySet.add(it));
            Object.keys(position.attributes).forEach((it) => keySet.add(it));
          });
          ['id', 'deviceId', 'outdated', 'network', 'attributes'].forEach((key) => keySet.delete(key));
          Object.keys(positionAttributes).forEach((key) => {
            if (keySet.has(key)) {
              keyList.push(key);
              keySet.delete(key);
            }
          });
          setAvailable([...keyList, ...keySet].map((key) => [key, positionAttributes[key]?.name || key]));
          setItems(data);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'route';
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  const cellProps = {
    className: classes.columnAction,
    padding: 'none',
    size: 'small',
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportRoute']}>
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {[...new Set(items.map((it) => it.deviceId))].map((deviceId) => {
                const positions = items.filter((position) => position.deviceId === deviceId);
                return (
                  <Fragment key={deviceId}>
                    <MapRoutePath positions={positions} />
                    <MapRoutePoints positions={positions} onClick={onMapPointClick} />
                  </Fragment>
                );
              })}
              <MapPositions positions={[selectedItem]} titleField="fixTime" />
            </MapView>
            <MapScale />
            <MapCamera positions={items} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} multiDevice includeGroups loading={loading}>
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={available}
                rawValues
                disabled={!items.length}
              />
            </ReportFilter>
          </div>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell {...cellProps} />
                <TableCell {...cellProps}>{t('sharedDevice')}</TableCell>
                {columns.map((key) => (<TableCell key={key} {...cellProps}>{positionAttributes[key]?.name || key}</TableCell >))}
                <TableCell {...cellProps} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.slice(0, 4000).map((item) => (
                <TableRow key={item.id} hover className={classes.rows} selected={selectedItem === item} onClick={() => setSelectedItem(selectedItem === item ? null : item)}>
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
                      <PositionValue
                        position={item}
                        property={item.hasOwnProperty(key) ? key : null}
                        attribute={item.hasOwnProperty(key) ? null : key}
                      />
                    </TableCell>
                  ))}
                  <TableCell {...cellProps}>
                    {/* TODO: Fix rendering for this except hovered */}
                    {selectedItem === item && (
                    <CollectionActions
                      itemId={item.id}
                      endpoint="positions"
                      readonly={readonly || deviceReadonly}
                      setTimestamp={() => {
                        // NOTE: Gets called when an item was removed
                        setItems(items.filter((position) => position.id !== item.id));
                      }}
                    />
                    )}
                  </TableCell>
                </TableRow>
              )) : (<TableShimmer columns={columns.length + 2} startAction />)}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default RouteReportPage;
