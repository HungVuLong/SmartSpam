import { render, screen } from '@testing-library/react';
import App from './App';
import * as test from "node:test";

test('renders the SmartSpam interface', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /smartspam/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /history/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/type or paste a message/i)).toBeInTheDocument();
});
