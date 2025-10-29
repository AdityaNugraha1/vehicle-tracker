import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import type { User, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const USER_ROLES: [UserRole, ...UserRole[]] = ['USER', 'MANAGER', 'ADMIN'];

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(USER_ROLES),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

// Ikon Mata helper
const EyeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 10.224 7.29 6.3 12 6.3c4.71 0 8.577 3.924 9.964 5.383.143.18.143.459 0 .639C20.577 13.776 16.71 17.7 12 17.7c-4.71 0-8.577-3.924-9.964-5.383Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const EyeSlashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L12 12" />
  </svg>
);


export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [listError, setListError] = useState<string>('');
  const [createError, setCreateError] = useState<string>(''); // State untuk error create
  const [createSuccess, setCreateSuccess] = useState<string>(''); // State untuk sukses create

  const {
    getAllUsers,
    updateUserRole,
    adminCreateUser,
    adminDeleteUser,
    isLoading // Ambil isLoading global
  } = useAuthStore();
  const loggedInUser = useAuthStore(state => state.user);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const loadUsers = async () => {
    setListError('');
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (err: any) {
      setListError(err.message || 'Failed to fetch users');
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya load sekali saat komponen mount

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setListError('');
    try {
      const updatedUser = await updateUserRole(userId, newRole);
      setUsers(
        users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } catch (err: any) {
      setListError(err.message || 'Failed to update role');
    }
  };

  const onSubmitCreate = async (data: CreateUserForm) => {
    setCreateError('');
    setCreateSuccess('');
    try {
      await adminCreateUser(data);
      setCreateSuccess(`User ${data.name} created successfully!`);
      reset(); // Reset form setelah sukses
      loadUsers(); // Refresh daftar user
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      setListError('');
      try {
        await adminDeleteUser(userId);
        loadUsers(); // Refresh daftar user setelah delete
      } catch (err: any) {
        setListError(err.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Form Create User */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Create New User</h2>

        {/* --- PERBAIKAN DI SINI: Tampilkan createSuccess dan createError --- */}
        {createSuccess && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
            {createSuccess}
          </div>
        )}
        {createError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {createError}
          </div>
        )}
        {/* --- AKHIR PERBAIKAN --- */}

        <form
          onSubmit={handleSubmit(onSubmitCreate)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Input Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input {...register('name')} type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            {formErrors.name && (<p className="mt-1 text-sm text-red-600">{formErrors.name.message}</p>)}
          </div>

          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input {...register('email')} type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            {formErrors.email && (<p className="mt-1 text-sm text-red-600">{formErrors.email.message}</p>)}
          </div>

          {/* Input Password */}
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} id="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {formErrors.password && (<p className="mt-1 text-sm text-red-600">{formErrors.password.message}</p>)}
          </div>

          {/* Input Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select {...register('role')} id="role" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              {USER_ROLES.map((role) => (<option key={role} value={role}>{role}</option>))}
            </select>
            {formErrors.role && (<p className="mt-1 text-sm text-red-600">{formErrors.role.message}</p>)}
          </div>

          {/* Tombol Submit */}
          <div className="md:col-span-2 text-right">
            <Button type="submit" isLoading={isLoading}> {/* Tetap pakai isLoading global */}
              Create User
            </Button>
          </div>
        </form>
      </div>

      {/* Daftar User */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        {listError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {listError}
          </div>
        )}

        {/* Tampilkan loading list jika isLoading DAN users kosong */}
        {isLoading && users.length === 0 ? (
          <p>Loading users...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800' }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {USER_ROLES.map((role) => (
                        <Button
                          key={role}
                          variant="outline"
                          size="sm"
                          disabled={user.role === role || isLoading || user.id === loggedInUser?.id} // Jangan biarkan ubah diri sendiri
                          onClick={() => handleRoleChange(user.id, role)}
                        >
                          Make {role}
                        </Button>
                      ))}
                      {/* Tombol Delete */}
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isLoading || user.id === loggedInUser?.id} // Jangan biarkan hapus diri sendiri
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};