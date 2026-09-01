import React from 'react';
function AuthInput({ label, type, placeholder, value, onChange, required = false, minLength }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-black dark:text-[var(--color-text-primary)]">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="rounded-lg border border-white dark:border-[var(--color-border)] bg-gray-100 dark:bg-[var(--color-bg-raised)] px-4 py-3 text-sm text-gray-900 dark:text-[var(--color-text-primary)] placeholder-gray-400 dark:placeholder-[var(--color-text-muted)] outline-none transition focus:border-blue-500 dark:focus:border-[var(--color-brand)] focus:ring-2 focus:ring-blue-100 dark:focus:ring-[var(--color-brand)]/20"
      />
    </div>
  );
}

export default AuthInput;