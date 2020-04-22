import React from 'react';
import ReactDOM from 'react-dom';
import CheckOut from '../Pages/CheckOut';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CheckOut />, div);
  ReactDOM.unmountComponentAtNode(div);
});
