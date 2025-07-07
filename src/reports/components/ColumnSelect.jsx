import {
  FormControl, InputLabel, MenuItem, Select,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';

const ColumnSelect = ({
  columns, setColumns, columnsArray, rawValues, disabled,
}) => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  return (
    <div className={classes.filterItem}>
      <FormControl fullWidth>
        <InputLabel>{t('sharedColumns')}</InputLabel>
        <Select
          label={t('sharedColumns')}
          value={columns}
          size="small"
          onChange={(e) => setColumns(e.target.value)}
          multiple
          disabled={disabled}
        >
          {columnsArray.map(([key, string]) => (
            <MenuItem size="small" key={key} value={key}>{rawValues ? string : t(string)}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ColumnSelect;
