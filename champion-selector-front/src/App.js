import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Home } from './Screens/Home';
import Notification from './Components/Notification';
import { Provider as LoadingProvider } from './Core/Loading'
import 'typeface-roboto';
import './App.css';

function App() {
  return (
    <LoadingProvider>
      <Router>
        <Notification />
        <Home />
      </Router>
    </LoadingProvider>
  );
}

export default App;
