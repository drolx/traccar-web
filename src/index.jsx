import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import store from './store';
import { LocalizationProvider } from './common/components/LocalizationProvider';
import ErrorHandler from './common/components/ErrorHandler';
import Navigation from './Navigation';
import preloadImages from './map/core/preloadImages';
import NativeInterface from './common/components/NativeInterface';
import ServerProvider from './ServerProvider';
import ErrorBoundary from './ErrorBoundary';
import AppThemeProvider from './AppThemeProvider';
// import fetchIntercept from 'fetch-intercept';

preloadImages();

// NOTE: Revert fetch-interception hack
/*
fetchIntercept.register({
  request: function (url, config) {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const apiUrl = url.length > 0 ? (url.startsWith('/api') ? url : null) : null;

    if (serverUrl && apiUrl) {
      const serverProtocol = import.meta.env.VITE_SERVER_PROTOCOL ?? window.location.protocol;
      url = `${serverProtocol}//${serverUrl}${url}`;

      const method = config && config.method;
      const isServerUrl = apiUrl.includes('/api/server');
      const isAuthRequest = apiUrl.includes('/api/session') && method === 'POST';

      if (!isServerUrl && !isAuthRequest) {
        config = {
          ...config,
          credentials: 'include',
          mode: 'cors',
        };
      }
    }
    
    return [url, config];
  },
  response: function (response) {

    return response;
  }
});
*/

const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <LocalizationProvider>
        <StyledEngineProvider injectFirst>
          <AppThemeProvider>
            <CssBaseline />
            <ServerProvider>
              <BrowserRouter>
                <Navigation />
              </BrowserRouter>
              <ErrorHandler />
              <NativeInterface />
            </ServerProvider>
          </AppThemeProvider>
        </StyledEngineProvider>
      </LocalizationProvider>
    </Provider>
  </ErrorBoundary>,
);
