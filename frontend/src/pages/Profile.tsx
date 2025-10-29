import React, { useState } from 'react'; // 1. Import useState
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button'; // Pastikan path ini benar

// Skema (Tidak berubah)
const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});
type NameForm = z.infer<typeof nameSchema>;

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

// Ikon Mata (helper)
const EyeIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 10.224 7.29 6.3 12 6.3c4.71 0 8.577 3.924 9.964 5.383.143.18.143.459 0 .639C20.577 13.776 16.71 17.7 12 17.7c-4.71 0-8.577-3.924-9.964-5.383Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const EyeSlashIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L12 12"
    />
  </svg>
);
// Akhir Ikon Mata

export const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [nameError, setNameError] = useState('');
  const [passError, setPassError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // 2. Tambahkan state untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ... (hook form, onUpdateName, onUpdatePassword tidak berubah)
  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameFormErrors },
  } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passFormErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateName = async (data: NameForm) => {
    setNameError('');
    setNameSuccess('');
    try {
      await updateProfile({ name: data.name });
      setNameSuccess('Name updated successfully!');
    } catch (err: any) {
      setNameError(err.message || 'Failed to update name');
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    setPassError('');
    setPassSuccess('');
    try {
      await updateProfile({ password: data.password });
      setPassSuccess('Password updated successfully!');
      resetPasswordForm();
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Form Update Nama (Tidak berubah) */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Information</h2>
        {nameSuccess && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
            {nameSuccess}
          </div>
        )}
        {nameError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {nameError}
          </div>
        )}
        <form onSubmit={handleSubmitName(onUpdateName)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              {...registerName('name')}
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {nameFormErrors.name && (
              <p className="mt-1 text-sm text-red-600">
                {nameFormErrors.name.message}
              </p>
            )}
          </div>
          <div className="text-right">
            <Button type="submit" isLoading={isLoading}>
              Update Name
            </Button>
          </div>
        </form>
      </div>

      {/* Form Update Password (DIPERBARUI) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        {passSuccess && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
            {passSuccess}
          </div>
        )}
        {passError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {passError}
          </div>
        )}
        <form
          onSubmit={handleSubmitPassword(onUpdatePassword)}
          className="space-y-4"
        >
          {/* 3. Input Password Baru */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="mt-1 relative">
              <input
                {...registerPassword('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {passFormErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {passFormErrors.password.message}
              </p>
            )}
          </div>

          {/* 4. Input Konfirmasi Password Baru */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="mt-1 relative">
              <input
                {...registerPassword('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {passFormErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passFormErrors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="text-right">
            <Button type="submit" isLoading={isLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};