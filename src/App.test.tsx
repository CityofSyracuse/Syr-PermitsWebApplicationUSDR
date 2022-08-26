import { render, screen } from '@testing-library/react';
import App from './App';

test('renders first page', () => {
    render(<App />);
    const linkElement = screen.getByText("Track Permit Status");
    expect(linkElement).toBeInTheDocument();
});
