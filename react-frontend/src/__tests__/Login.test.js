import React from 'react';
import ReactDOM from 'react-dom';
import LoginP from '../Pages/Login';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LoginP />, div);
  ReactDOM.unmountComponentAtNode(div);
});
