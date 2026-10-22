import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Login from '../../../src/pages/LoginPage';
import { ThemeProvider } from '../../../src/context/ThemeContext';

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Login Component', () => {

  it('renders email and password fields', () => {
    renderLogin();

    expect(
      screen.getByPlaceholderText('your.email@university.edu')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('••••••••')
    ).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderLogin();

    expect(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    ).toBeInTheDocument();
  });

  it('allows user to enter email', () => {
    renderLogin();

    const emailInput =
      screen.getByPlaceholderText('your.email@university.edu');

    fireEvent.change(emailInput, {
      target: {
        value: 'test@example.com',
      },
    });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('allows user to enter password', () => {
    renderLogin();

    const passwordInput =
      screen.getByPlaceholderText('••••••••');

    fireEvent.change(passwordInput, {
      target: {
        value: 'Password123!',
      },
    });

    expect(passwordInput.value).toBe('Password123!');
  });

  it('prevents submission when fields are empty', () => {
    renderLogin();

    const emailInput =
      screen.getByPlaceholderText('your.email@university.edu');

    const passwordInput =
      screen.getByPlaceholderText('••••••••');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderLogin();
    const passwordInput =
      screen.getByPlaceholderText('••••••••');

    expect(passwordInput).toHaveAttribute('type', 'password');
    const toggleButton = screen.getByRole('button', {
      name: /show password/i,
    });

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

});