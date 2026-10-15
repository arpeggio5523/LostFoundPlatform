vi.mock("../../../src/components/NotificationButton", () => ({ default: () => <button aria-label="Notifications" /> }));
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NavBar2 from '../../../src/components/NavBar2';
import { clearAuth } from '../../../src/services/authState';


const mockNavigate = vi.fn();

const mockResetTheme = vi.fn();


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


vi.mock('../../../src/context/ThemeContext', () => ({
  useTheme: () => ({
    resetTheme: mockResetTheme,
  }),
}));


vi.mock('../../../src/services/authState', () => ({
  clearAuth: vi.fn(),
}));


const renderNavbar2 = () => {
  return render(
    <MemoryRouter>
      <NavBar2 />
    </MemoryRouter>
  );
};


describe('Navbar2 Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('renders LostFound MY brand', () => {
    renderNavbar2();

    expect(
      screen.getByText('LostFound MY')
    ).toBeInTheDocument();
  });


  it('renders two navigation buttons', () => {
    renderNavbar2();

    const buttons = screen.getAllByRole('button');

    expect(buttons).toHaveLength(2);
  });


  it('calls resetTheme when logout button is clicked', () => {
    renderNavbar2();

    const buttons = screen.getAllByRole('button');

    const logoutButton = buttons[1];

    fireEvent.click(logoutButton);

    expect(mockResetTheme).toHaveBeenCalledTimes(1);
  });


  it('calls clearAuth when logout button is clicked', () => {
    renderNavbar2();

    const buttons = screen.getAllByRole('button');

    const logoutButton = buttons[1];

    fireEvent.click(logoutButton);

    expect(clearAuth).toHaveBeenCalledTimes(1);
  });


  it('navigates to home page after logout', () => {
    renderNavbar2();

    const buttons = screen.getAllByRole('button');

    const logoutButton = buttons[1];

    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });


  it('performs complete logout process', () => {
    renderNavbar2();

    const buttons = screen.getAllByRole('button');

    const logoutButton = buttons[1];

    fireEvent.click(logoutButton);

    expect(mockResetTheme).toHaveBeenCalledTimes(1);
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

});