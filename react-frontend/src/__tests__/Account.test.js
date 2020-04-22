import React from 'react';
import ReactDOM from 'react-dom';
import AccountSettings from '../Pages/Account';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AccountSettings history={[]}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
