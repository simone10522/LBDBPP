import React, { useEffect, useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { supabase } from '../lib/supabase';
    import { useAuth } from '../hooks/useAuth';

    export default function Navbar() {
      const { user } = useAuth();
      const navigate = useNavigate();
      const [username, setUsername] = useState('');
      const [profileImage, setProfileImage] = useState('');
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchUserData = async () => {
          if (user) {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('username, profile_image')
                .eq('id', user.id)
                .single();
              if (error) {
                console.error("Error fetching user data:", error);
                setUsername('Guest');
                setProfileImage('');
              } else {
                setUsername(data?.username || 'Guest');
                setProfileImage(data?.profile_image || '');
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
              setUsername('Guest');
              setProfileImage('');
            }
          } else {
            setUsername('Guest');
            setProfileImage('');
          }
          setLoading(false);
        };
        fetchUserData();
      }, [user]);

      const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
      };

      if (loading) return <nav>Loading...</nav>;

      return (
        <nav className="bg-red-600 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/icons/pokeball.png"
                  alt="Pokeball Icon"
                  className="h-12 w-12 animate-spin-slow"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/2560px-International_Pok%C3%A9mon_logo.svg.png"
                  alt="Pokemon Logo"
                  className="h-10"
                />
              </Link>

              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-2">
                    {profileImage && (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span className="text-white">Ciao! {username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-white hover:text-gray-200 transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-white hover:text-gray-200 transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      );
    }
