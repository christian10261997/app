import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(null);
  }, []);

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();
    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Email and password are required' } as const;
    }
    setLoading(true);
    try {
      const mockUser = { email: trimmedEmail };
      setUser(mockUser);
      return { success: true } as const;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();
    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Email and password are required' } as const;
    }
    return { success: true } as const;
  };

  const logout = async () => {
    setUser(null);
    return { success: true } as const;
  };

  const resetPassword = async (email: string) => {
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required' } as const;
    }
    return { success: true } as const;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
  };
}
