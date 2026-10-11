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

  // ============================================================
  // GOOGLE / GITHUB OAUTH CALLBACK
  // ============================================================

  useEffect(() => {
    const handleOAuthCallback = () => {
      const params = new URLSearchParams(
        window.location.search
      );

      // --------------------------------------------------------
      // GOOGLE
      // --------------------------------------------------------

      const googleToken =
        params.get('google_token');

      const googleUser =
        params.get('google_user');

      const googleError =
        params.get('google_error');

      // --------------------------------------------------------
      // GITHUB
      // --------------------------------------------------------

      const githubToken =
        params.get('github_token');

      const githubUser =
        params.get('github_user');

      const githubError =
        params.get('github_error');

      // --------------------------------------------------------
      // GOOGLE ERROR
      // --------------------------------------------------------

      if (googleError) {
        console.error(
          'Google authentication failed:',
          googleError
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        return;
      }

      // --------------------------------------------------------
      // GITHUB ERROR
      // --------------------------------------------------------

      if (githubError) {
        console.error(
          'GitHub authentication failed:',
          githubError
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        return;
      }

      // --------------------------------------------------------
      // GOOGLE SUCCESS
      // --------------------------------------------------------

      if (googleToken && googleUser) {
        try {
          const parsedUser =
            JSON.parse(googleUser);

          setToken(googleToken);
          setUser(parsedUser);

          localStorage.setItem(
            'alevate_token',
            googleToken
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
            window.location.replace(
              '/alumni/dashboard'
            );
          } else if (
            parsedUser.role === 'admin'
          ) {
            window.location.replace(
              '/admin/dashboard'
            );
          } else {
            window.location.replace(
              '/student/dashboard'
            );
          }

          return;

        } catch (error) {
          console.error(
            'Unable to process Google login:',
            error
          );
        }
      }

      // --------------------------------------------------------
      // GITHUB SUCCESS
      // --------------------------------------------------------

      if (githubToken && githubUser) {
        try {
          const parsedUser =
            JSON.parse(githubUser);

          setToken(githubToken);
          setUser(parsedUser);

          localStorage.setItem(
            'alevate_token',
            githubToken
          );

          localStorage.setItem(
            'alevate_user',
            JSON.stringify(parsedUser)
          );

          // Remove OAuth information from URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Redirect according to role
          if (parsedUser.role === 'alumni') {
            window.location.replace(
              '/alumni/dashboard'
            );
          } else if (
            parsedUser.role === 'admin'
          ) {
            window.location.replace(
              '/admin/dashboard'
            );
          } else {
            window.location.replace(
              '/student/dashboard'
            );
          }

        } catch (error) {
          console.error(
            'Unable to process GitHub login:',
            error
          );
        }
      }
    };

    handleOAuthCallback();
  }, []);

  // ============================================================
  // VERIFY EXISTING USER
  // ============================================================

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
                'student'
            };

            setUser(updated);

            localStorage.setItem(
              'alevate_user',
              JSON.stringify(updated)
            );
          }
        } catch {
          // Keep existing local session.
        }
      }

      setLoading(false);
    };

    verifyUser();
  }, [token]);

  // ============================================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ============================================================

  const login = async (
    email,
    password
  ) => {
    const res = await api.post(
      '/auth/login',
      {
        email,
        password
      }
    );

    if (res.token) {
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

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (userData) => {
    const res = await api.post(
      '/auth/register',
      userData
    );

    if (res.user) {
      return await login(
        userData.email,
        userData.password
      );
    }

    return res;
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const loginWithGoogle = () => {
    window.location.href =
      '/api/auth/google';
  };

  // ============================================================
  // GITHUB LOGIN
  // ============================================================

  const loginWithGithub = () => {
    window.location.href =
      '/api/auth/github';
  };

  // ============================================================
  // QUICK LOGIN
  // ============================================================

  const quickLogin = async (role) => {
    let email =
      'alex@university.edu';

    if (role === 'alumni') {
      email =
        'priya.sharma@google.com';
    }

    if (role === 'admin') {
      email =
        'admin@alevate.edu';
    }

    try {
      return await login(
        email,
        'password123'
      );

    } catch {
      const name =
        role === 'alumni'
          ? 'Priya Sharma'
          : role === 'admin'
            ? 'Alevate Admin'
            : 'Alex Rivera';

      return await register({
        name,
        email,
        password: 'password123',
        role
      });
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(
      'alevate_token'
    );

    localStorage.removeItem(
      'alevate_user'
    );
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const updateUserProfile = (
    updatedData
  ) => {
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
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};