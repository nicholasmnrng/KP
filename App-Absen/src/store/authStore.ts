import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Hardcoded credentials
const VALID_CREDENTIALS = [
  { nama: 'Admin', password: 'admin123' },
  { nama: 'User', password: 'user123' },
];

interface AuthStore {
  isLoggedIn: boolean;
  userName: string | null;
  login: (nama: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userName: null,

      login: (nama: string, password: string) => {
        const isValid = VALID_CREDENTIALS.some(
          (cred) => cred.nama === nama && cred.password === password
        );

        if (isValid) {
          set({ isLoggedIn: true, userName: nama });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isLoggedIn: false, userName: null });
      },
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
    }
  )
);
