import React from 'react';
import { Route } from 'react-router-dom'
import LoginP from './Pages/Login'
import Register from './Pages/Register'
import AccountSettings from './Pages/Account'
//import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <React.Fragment>
      <Route path='/' exact component={LoginP}/>
      <Route path='/register' exact component={Register}/>
      <Route path='/login' exact component={LoginP}/>
      <Route path='/account_settings' exact component={AccountSettings}/>
    </React.Fragment>
  );
}

export default App;