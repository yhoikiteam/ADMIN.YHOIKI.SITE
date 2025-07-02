// components/ui.tsx
'use client'; // Mark as client component

import React from 'react';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}> = ({ children, onClick, className = '', type = 'button', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      px-6 py-3 rounded-xl font-semibold text-white
      bg-gradient-to-r from-purple-600 to-indigo-600
      hover:from-purple-700 hover:to-indigo-700
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      transition duration-300 ease-in-out transform hover:scale-105
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
  >
    {children}
  </button>
);

export const Input: React.FC<{
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  register: any;
  error?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ label, id, type = 'text', placeholder, register, error, defaultValue, onChange, className = '' }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
      {label}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...register(id)}
      onChange={onChange}
      className={`
        shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
        transition duration-200 ease-in-out
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    />
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
  </div>
);

export const TextArea: React.FC<{
  label: string;
  id: string;
  placeholder?: string;
  register: any;
  error?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, id, placeholder, register, error, defaultValue, onChange }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
      {label}
    </label>
    <textarea
      id={id}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...register(id)}
      onChange={onChange}
      rows={6}
      className={`
        shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
        transition duration-200 ease-in-out
        ${error ? 'border-red-500' : 'border-gray-300'}
      `}
    />
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
  </div>
);

export const Select: React.FC<{
  label: string;
  id: string;
  options: { value: string; label: string }[];
  register: any;
  error?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}> = ({ label, id, options, register, error, defaultValue, onChange, className = '' }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
      {label}
    </label>
    <select
      id={id}
      defaultValue={defaultValue}
      {...register(id)}
      onChange={onChange}
      className={`
        shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
        transition duration-200 ease-in-out
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
  </div>
);

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 ease-in-out transform hover:scale-105">
            Batal
          </Button>
          <Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 ease-in-out transform hover:scale-105">
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
};