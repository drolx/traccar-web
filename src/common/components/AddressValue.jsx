import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { formatCoordinate } from '../util/formatter';
import { usePreference } from '../util/preferences';
import { useCatch } from '../../reactHelper';

const AddressValue = ({ latitude, longitude, originalAddress }) => {
  const t = useTranslation();

  const coordinateFormat = usePreference('coordinateFormat');
  const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);

  const [address, setAddress] = useState();

  useEffect(() => {
    setAddress(originalAddress);
  }, [latitude, longitude, originalAddress]);

  const showAddress = useCatch(async (event) => {
    event.preventDefault();
    const query = new URLSearchParams({ latitude, longitude });
    const response = await fetch(`/api/server/geocode?${query.toString()}`);
    if (response.ok) {
      setAddress(await response.text());
    } else {
      throw Error(await response.text());
    }
  });

  if (address) {
    return address;
  }
  if (addressEnabled) {
    return (<Link href="#" onClick={showAddress}>{ t('sharedShowAddress') + `(${formatCoordinate('latitude', latitude, coordinateFormat)}, ${formatCoordinate('longitude', longitude, coordinateFormat)})`}</Link>);
  }
  return `${formatCoordinate('latitude', latitude, coordinateFormat)}, ${formatCoordinate('longitude', longitude, coordinateFormat)}`;
};

export default AddressValue;
