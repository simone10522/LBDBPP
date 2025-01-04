import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '../lib/supabase';
    import { Link } from 'react-router-dom';

    export default function Register() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [username, setUsername] = useState('');
      const [profileImage, setProfileImage] = useState('');
      const [error, setError] = useState('');
      const navigate = useNavigate();

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (authError) throw authError;

          if (authData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{ id: authData.user.id, username, profile_image: profileImage }]);

            if (profileError) throw profileError;
            navigate('/');
          }

        } catch (error: any) {
          setError(error.message);
        }
      };

      const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProfileImage(e.target.value);
      };

      return (
        <div className="max-w-md mx-auto p-4 bg-gray-200 bg-opacity-50 rounded-lg shadow-md"> {/* Added background */}
          <h1 className="text-2xl font-bold text-center mb-8">Register</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <select
                value={profileImage}
                onChange={handleImageChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select an image</option>
                <option value="/icons/profile1.png">Profile 1</option>
                <option value="/icons/profile2.png">Profile 2</option>
                <option value="/icons/profile3.png">Profile 3</option>
                <option value="/icons/profile4.png">Profile 4</option>
                <option value="/icons/profile5.png">Profile 5</option>
                <option value="/icons/profile6.png">Profile 6</option>
                <option value="/icons/profile7.png">Profile 7</option>
                <option value="/icons/profile8.png">Profile 8</option>
                <option value="/icons/profile9.png">Profile 9</option>
                <option value="/icons/profile10.png">Profile 10</option>
                <option value="/icons/profile11.png">Profile 11</option>
                <option value="/icons/profile12.png">Profile 12</option>
              </select>
              <input
                type="text"
                placeholder="Or enter image URL"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-gray-900">
            Already have an account? <Link to="/login" className="text-indigo-800 hover:underline">Login</Link>
          </p>
        </div>
      );
    }
