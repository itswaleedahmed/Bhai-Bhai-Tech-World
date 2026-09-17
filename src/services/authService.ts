import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { auth, googleProvider, SUPER_ADMIN_EMAIL } from '../lib/firebase';

export interface AdminAuthStatus {
  user: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  email: string | null;
  error?: string;
}

/**
 * Authentication Service for Bhai Bhai Tech World
 * Enforces strict Firebase Auth rules reserving administrative access
 * strictly and exclusively to 'itswaleedahmed@gmail.com'.
 */
export class AdminAuthService {
  public static readonly REQUIRED_ADMIN_EMAIL = SUPER_ADMIN_EMAIL; // 'itswaleedahmed@gmail.com'

  /**
   * Check if a given Firebase user matches the designated store owner email
   */
  public static isAuthorized(user: User | null): boolean {
    if (!user || !user.email) return false;
    return user.email.trim().toLowerCase() === this.REQUIRED_ADMIN_EMAIL.toLowerCase();
  }

  /**
   * Triggers Firebase Google Sign-In popup with prompt='select_account'
   */
  public static async signInWithGoogle(): Promise<{ user: User; isAuthorized: boolean }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isAuthorized = this.isAuthorized(result.user);
      return { user: result.user, isAuthorized };
    } catch (error: unknown) {
      console.error('Firebase Auth sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign out the active user
   */
  public static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Firebase Auth logout error:', error);
      throw error;
    }
  }

  /**
   * Get the current authenticated user synchronously
   */
  public static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Returns current admin authorization state
   */
  public static getAdminStatus(): AdminAuthStatus {
    const user = auth.currentUser;
    const isSuperAdmin = this.isAuthorized(user);
    return {
      user,
      isAuthenticated: Boolean(user),
      isSuperAdmin,
      email: user?.email || null,
    };
  }

  /**
   * Subscribe to Firebase Auth state changes
   */
  public static subscribe(
    callback: (status: AdminAuthStatus) => void
  ): Unsubscribe {
    return onAuthStateChanged(auth, (user) => {
      const isSuperAdmin = this.isAuthorized(user);
      callback({
        user,
        isAuthenticated: Boolean(user),
        isSuperAdmin,
        email: user?.email || null,
      });
    });
  }
}

export const authService = AdminAuthService;
