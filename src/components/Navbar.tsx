import React, { useEffect, useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { supabase } from '../lib/supabase';
    import { useAuth } from '../hooks/useAuth';

    export default function Navbar() {
      const { user } = useAuth();
      const navigate = useNavigate();
      const [username, setUsername] = useState('');
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchUsername = async () => {
          if (user) {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
              if (error) {
                console.error("Error fetching username:", error);
                setUsername('Guest'); // Default if error
              } else {
                setUsername(data?.username || 'Guest'); // Default if username is null
              }
            } catch (error) {
              console.error("Error fetching username:", error);
              setUsername('Guest'); // Default if error
            }
          } else {
            setUsername('Guest');
          }
          setLoading(false);
        };
        fetchUsername();
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
              <Link to="/" className="flex items-center space-x-12">
                <img
                  src="/icons/pokeball.png"
                  alt="Pokeball Icon"
                  className="h-12 w-12 animate-spin-slow"
                />
                <span className="text-xl font-bold text-white">LBDB Pokemon Pocket Tournaments</span>
              </Link>

              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <span className="text-white">Ciao! {username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-white hover:text-gray-200 transition"
                    >
                      Logout
                    </button>
                  </>
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
