import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
import axios from 'axios';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import getConfig from 'next/config';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/router";

const PasswordChangeAlert = () => {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicRuntimeConfig } = getConfig();
  const router = useRouter();

  useEffect(() => {
    const token = getItemFromSessionStorage('token');
    if(token) {
      const isFirstTime = jwtDecode(token).isFirstTime;
      if (isFirstTime === true && token) {
        setShowModal(true);
      }
    }
  }, [getItemFromSessionStorage('token')]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setLoading(true);

    try {
      const token = getItemFromSessionStorage('token');
      const employeeId = jwtDecode(token).employeeId;
      const response = await axios.post(
        `${publicRuntimeConfig.apiURL}/api/auth/password/set/${employeeId}`,
        {
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Clear session storage and log out
        sessionStorage.clear();
        setShowModal(false);
        router.push('/login');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Setting Password Required</h2>
        <p className="text-gray-600 mb-6">
          For security reasons, you need to set your password before continuing.
        </p>

        <form onSubmit={handlePasswordChange}>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Set Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Set Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeAlert; 