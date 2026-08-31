import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Signup from '../../../src/pages/SignupPage';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import { ToastProvider } from '../../../src/context/ToastContext';

const renderSignup = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <ToastProvider>
          <Signup />
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Signup Component', () => {

  it('renders create account button', () => {
    renderSignup();

    expect(
      screen.getByRole('button', {
        name: /create account/i,
      })
    ).toBeInTheDocument();
  });

  it('allows user to enter full name', () => {
    renderSignup();

    const nameInput = screen.getByPlaceholderText('John Doe');

    fireEvent.change(nameInput, {
      target: {
        value: 'Min Xuan',
      },
    });

    expect(nameInput.value).toBe('Min Xuan');
  });

  it('allows user to enter email', () => {
    renderSignup();

    const emailInput = screen.getByPlaceholderText(
      'your.email@university.edu'
    );

    fireEvent.change(emailInput, {
      target: {
        value: 'test@example.com',
      },
    });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('allows user to enter phone number', () => {
    renderSignup();

    const phoneInput = screen.getByPlaceholderText(
      '+ 1 234 567 8900'
    );

    fireEvent.change(phoneInput, {
      target: {
        value: '0123456789',
      },
    });

    expect(phoneInput.value).toBe('0123456789');
  });

  it('allows user to enter occupation', () => {
    renderSignup();

    const occupationInput = screen.getByPlaceholderText(
      'eg. Student, Faculty, Staff'
    );

    fireEvent.change(occupationInput, {
      target: {
        value: 'Student',
      },
    });

    expect(occupationInput.value).toBe('Student');
  });

  it('allows user to enter password', () => {
    renderSignup();

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    const passwordInput = passwordInputs[0];

    fireEvent.change(passwordInput, {
      target: {
        value: 'Password123!',
      },
    });

    expect(passwordInput.value).toBe('Password123!');
  });

  it('allows user to enter confirm password', () => {
    renderSignup();

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(confirmPasswordInput, {
      target: {
        value: 'Password123!',
      },
    });

    expect(confirmPasswordInput.value).toBe('Password123!');
  });

  it('requires full name', () => {
    renderSignup();

    const nameInput = screen.getByPlaceholderText('John Doe');

    expect(nameInput).toBeRequired();
  });

  it('requires email', () => {
    renderSignup();

    const emailInput = screen.getByPlaceholderText(
      'your.email@university.edu'
    );

    expect(emailInput).toBeRequired();
  });

  it('requires password', () => {
    renderSignup();

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    expect(passwordInputs[0]).toBeRequired();
  });

  it('requires confirm password', () => {
    renderSignup();

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    expect(passwordInputs[1]).toBeRequired();
  });

  it('phone number is optional', () => {
    renderSignup();

    const phoneInput = screen.getByPlaceholderText(
      '+ 1 234 567 8900'
    );

    expect(phoneInput).not.toBeRequired();
  });

  it('occupation is optional', () => {
    renderSignup();

    const occupationInput = screen.getByPlaceholderText(
      'eg. Student, Faculty, Staff'
    );

    expect(occupationInput).not.toBeRequired();
  });

  it('renders sign in text', () => {
    renderSignup();

    const signInText = screen.getByText(/sign in/i);

    expect(signInText).toBeInTheDocument();
  });

  it('shows error when password is shorter than 8 characters', () => {
    renderSignup();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Test User' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        'your.email@university.edu'
      ),
      {
        target: { value: 'test@example.com' },
      }
    );

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'Ab1!' },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'Ab1!' },
    });

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /create account/i,
        })
        .closest('form')
    );

    expect(
      screen.getByText(
        /password must be at least 8 characters long/i
      )
    ).toBeInTheDocument();
  });


  it('shows error when confirm password does not match', () => {
    renderSignup();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Test User' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        'your.email@university.edu'
      ),
      {
        target: { value: 'test@example.com' },
      }
    );

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'Password123!' },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'Different123!' },
    });

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /create account/i,
        })
        .closest('form')
    );

    expect(
      screen.getByText(
        /confirm password is not same with password/i
      )
    ).toBeInTheDocument();
  });


  it('shows error when password has no uppercase letter', () => {
    renderSignup();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Test User' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        'your.email@university.edu'
      ),
      {
        target: { value: 'test@example.com' },
      }
    );

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'password123!' },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'password123!' },
    });

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /create account/i,
        })
        .closest('form')
    );

    expect(
      screen.getByText(
        /password must contain at least 1 capital letter/i
      )
    ).toBeInTheDocument();
  });


  it('shows error when password has no lowercase letter', () => {
    renderSignup();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Test User' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        'your.email@university.edu'
      ),
      {
        target: { value: 'test@example.com' },
      }
    );

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'PASSWORD123!' },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'PASSWORD123!' },
    });

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /create account/i,
        })
        .closest('form')
    );

    expect(
      screen.getByText(
        /password must contain at least 1 small letter/i
      )
    ).toBeInTheDocument();
  });


  it('shows error when password has no special character', () => {
    renderSignup();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Test User' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        'your.email@university.edu'
      ),
      {
        target: { value: 'test@example.com' },
      }
    );

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'Password123' },
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'Password123' },
    });

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /create account/i,
        })
        .closest('form')
    );

    expect(
      screen.getByText(
        /password must contain at least 1 special character/i
      )
    ).toBeInTheDocument();
  });

});