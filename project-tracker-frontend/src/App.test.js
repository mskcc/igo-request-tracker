import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import App from './App';
import reducer from './redux/reducers/index'

test('renders learn react link', () => {
  const { getByText } = render(<Provider store={createStore(reducer, {})}><App /></Provider>);
  const linkElement = getByText(/IGO Request Tracker/i);
  expect(linkElement).toBeInTheDocument();
});
