
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('alevate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('alevate_token') || null
  );

  const [loading, setLoading] = useState(true);

  // Handle Google and GitHub OAuth callbacks
  useEffect(() => {
    const handleOAuthCallback = () => {
      const params = new URLSearchParams(
        window.location.search
      );

      const googleToken = params.get('google_token');
      const googleUser = params.get('google_user');
      const googleError = params.get('google_error');

      const githubToken = params.get('github_token');
      const githubUser = params.get('github_user');
      const githubError = params.get('github_error');

      if (googleError || githubError) {
        console.error(
          'Social authentication failed:',
          googleError || githubError
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        return;
      }

      const processOAuth = (oauthToken, oauthUser) => {
        if (!oauthToken || !oauthUser) {
          return false;
        }

        try {
          const parsedUser = JSON.parse(oauthUser);

          // Never establish a session for unapproved alumni.
          if (
            parsedUser.role === 'alumni' &&
            parsedUser.isVerified !== true
          ) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            alert(
              'Your alumni registration is awaiting administrator approval.'
            );

            return true;
          }

          setToken(oauthToken);
          setUser(parsedUser);

          localStorage.setItem(
            'alevate_token',
            oauthToken
          );

          localStorage.setItem(
            'alevate_user',
            JSON.stringify(parsedUser)
          );

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          if (parsedUser.role === 'alumni') {
            window.location.replace('/alumni/dashboard');
          } else if (parsedUser.role === 'admin') {
            window.location.replace('/admin/dashboard');
          } else {
            window.location.replace('/student/dashboard');
          }

          return true;
        } catch (error) {
          console.error(
            'Unable to process social login:',
            error
          );

          return true;
        }
      };

      if (processOAuth(googleToken, googleUser)) {
        return;
      }

      processOAuth(githubToken, githubUser);
    };

    handleOAuthCallback();
  }, []);

  // Verify an existing session
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/test/profile');

          if (res.user) {
            const updated = {
              id:
                res.user.userId ||
                res.user.id ||
                user?.id,

              name:
                res.user.name ||
                user?.name ||
                'Alex Rivera',

              email:
                res.user.email ||
                user?.email,

              role:
                res.user.role ||
                user?.role ||
                'student',

              isVerified:
                res.user.isVerified ??
                user?.isVerified
            };

            // Clear any session that belongs to unapproved alumni.
            if (
              updated.role === 'alumni' &&
              updated.isVerified !== true
            ) {
              setToken(null);
              setUser(null);

              localStorage.removeItem('alevate_token');
              localStorage.removeItem('alevate_user');

              return;
            }

            setUser(updated);

            localStorage.setItem(
              'alevate_user',
              JSON.stringify(updated)
            );
          }
        } catch (error) {
          console.error(
            'Session verification failed:',
            error
          );

          // Do not keep a session if the server cannot verify it.
          setToken(null);
          setUser(null);

          localStorage.removeItem('alevate_token');
          localStorage.removeItem('alevate_user');
        }
      }

      setLoading(false);
    };

    verifyUser();
  }, [token]);

  // Email/password login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    });

    if (res.token && res.user) {
      if (
        res.user.role === 'alumni' &&
        res.user.isVerified !== true
      ) {
        throw new Error(
          'Your alumni registration is awaiting administrator approval.'
        );
      }

      setToken(res.token);
      setUser(res.user);

      localStorage.setItem(
        'alevate_token',
        res.token
      );

      localStorage.setItem(
        'alevate_user',
        JSON.stringify(res.user)
      );
    }

    return res;
  };

  // Registration
  const register = async (userData) => {
    const res = await api.post(
      '/auth/register',
      userData
    );

    // Alumni must wait for approval. Do not call login().
    if (userData.role === 'alumni') {
      return res;
    }

    // Students can use the token returned by registration.
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);

      localStorage.setItem(
        'alevate_token',
        res.token
      );

      localStorage.setItem(
        'alevate_user',
        JSON.stringify(res.user)
      );
    }

    return res;
  };

  // Google login
  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  // GitHub login
  const loginWithGithub = () => {
    window.location.href = '/api/auth/github';
  };

  // Demo quick login
  const quickLogin = async (role) => {
    let email = 'alex@university.edu';

    if (role === 'alumni') {
      email = 'priya.sharma@google.com';
    }

    if (role === 'admin') {
      email = 'admin@alevate.edu';
    }

    try {
      return await login(email, 'password123');
    } catch (error) {
      // Do not automatically register a demo alumni account.
      if (role === 'alumni') {
        throw error;
      }

      if (role === 'admin') {
        throw error;
      }

      return await register({
        name: 'Alex Rivera',
        email,
        password: 'password123',
        role: 'student'
      });
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('alevate_token');
    localStorage.removeItem('alevate_user');
  };

  // Update profile
  const updateUserProfile = (updatedData) => {
    const updated = {
      ...user,
      ...updatedData
    };

    setUser(updated);

    localStorage.setItem(
      'alevate_user',
      JSON.stringify(updated)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithGithub,
        quickLogin,
        logout,
        updateUserProfile,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
