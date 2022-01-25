import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import createStore from './store';
import { AppWalletProvider } from './components/Wallet';

const store = createStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppWalletProvider>
        <App />
      </AppWalletProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
