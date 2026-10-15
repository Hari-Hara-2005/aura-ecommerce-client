import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut, UserButton, SignIn, SignUp } from '@clerk/clerk-react';
import { joinCustomerRoom } from '../services/socket';

const AuthContext = createContext(null);

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkValid = CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.trim() !== '' && (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'));

function FallbackAuthProvider({ children }) {
  const [demoUser, setDemoUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_demo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (demoUser?.id) {
      joinCustomerRoom(demoUser.id);
    }
  }, [demoUser]);

  const demoLogin = (role = 'buyer') => {
    const mock = {
      id: 'usr_demo_' + Math.random().toString(36).substring(2, 9),
      firstName: role === 'buyer' ? 'Alex' : 'Jordan',
      lastName: role === 'buyer' ? 'Morgan' : 'Taylor',
      fullName: role === 'buyer' ? 'Alex Morgan' : 'Jordan Taylor',
      primaryEmailAddress: { emailAddress: role === 'buyer' ? 'alex.morgan@example.com' : 'jordan.taylor@example.com' },
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    };
    setDemoUser(mock);
    localStorage.setItem('aura_demo_user', JSON.stringify(mock));
  };

  const demoSignOut = () => {
    setDemoUser(null);
    localStorage.removeItem('aura_demo_user');
  };

  const value = {
    isClerkEnabled: false,
    user: demoUser,
    isSignedIn: !!demoUser,
    signOut: demoSignOut,
    loginDemo: demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkBridgeProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (user?.id) {
      joinCustomerRoom(user.id);
    }
  }, [user]);

  const value = {
    isClerkEnabled: true,
    user: user,
    isSignedIn: !!isSignedIn,
    isLoaded: isLoaded,
    signOut: () => signOut(),
    loginDemo: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function CustomAuthProvider({ children }) {
  if (isClerkValid) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ClerkBridgeProvider>{children}</ClerkBridgeProvider>
      </ClerkProvider>
    );
  }

  return <FallbackAuthProvider>{children}</FallbackAuthProvider>;
}

export function useAuthUser() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthUser must be used within CustomAuthProvider');
  }
  return context;
}

export { SignedIn, SignedOut, UserButton, SignIn, SignUp, isClerkValid };
