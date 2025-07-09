import { makeStyles } from 'tss-react/mui';

export default makeStyles()((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  containerMap: {
    flexBasis: '40%',
    flexShrink: 0,
  },
  containerMain: {
    overflow: 'auto',
  },
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  rows: { borderBottom: 0.1, borderBottomColor: '#7f7f7f' },
  columnAction: {
    maxWidth: '200px',
    padding: theme.spacing('2px', 0, '2px', 0),
    whiteSpace: 'nowrap',
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontSize: 12
  },
  filter: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2),
  },
  filterItem: {
    minWidth: 0,
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButton: {
    flexGrow: 1,
  },
  chart: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  actionCellPadding: {
    '&.MuiTableCell-body': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
}));
