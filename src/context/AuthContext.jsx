import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut, UserButton, SignIn, SignUp } from '@clerk/clerk-react';
import { joinCustomerRoom } from '../services/socket';
import { loginDemo as loginDemoAction, logoutDemo as logoutDemoAction } from '../store/slices/authSlice';

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

  const dispatch = useDispatch();

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
    dispatch(loginDemoAction(role));
  };

  const demoSignOut = () => {
    setDemoUser(null);
    localStorage.removeItem('aura_demo_user');
    dispatch(logoutDemoAction());
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
  const { user: clerkUser, isSignedIn: isClerkSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

  const [localDemoUser, setLocalDemoUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_demo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const activeUser = clerkUser || localDemoUser;
  const effectiveIsSignedIn = !!isClerkSignedIn || !!localDemoUser;

  useEffect(() => {
    if (activeUser?.id) {
      joinCustomerRoom(activeUser.id);
    }
  }, [activeUser?.id]);

  const dispatch = useDispatch();

  const loginDemo = (role = 'buyer', customData = {}) => {
    const defaultEmail = role === 'buyer' ? 'alex.morgan@example.com' : 'jordan.taylor@example.com';
    const defaultName = role === 'buyer' ? 'Alex Morgan' : 'Jordan Taylor';
    const email = customData.email || defaultEmail;
    const fullName = customData.name || (email.includes('@') ? email.split('@')[0] : defaultName);
    const firstName = fullName.split(' ')[0] || 'User';
    const lastName = fullName.split(' ').slice(1).join(' ') || '';

    const mock = {
      id: customData.id || ('usr_demo_' + Math.random().toString(36).substring(2, 9)),
      firstName,
      lastName,
      fullName,
      primaryEmailAddress: { emailAddress: email },
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    };
    setLocalDemoUser(mock);
    localStorage.setItem('aura_demo_user', JSON.stringify(mock));
    dispatch(loginDemoAction(role));
  };

  const handleSignOut = async () => {
    setLocalDemoUser(null);
    localStorage.removeItem('aura_demo_user');
    dispatch(logoutDemoAction());
    if (isClerkSignedIn && clerk?.signOut) {
      try {
        await clerk.signOut();
      } catch (err) {
        console.warn('Clerk signOut error:', err);
      }
    }
  };

  const value = {
    isClerkEnabled: true,
    user: activeUser,
    isSignedIn: effectiveIsSignedIn,
    isLoaded: isLoaded,
    signOut: handleSignOut,
    loginDemo: loginDemo,
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
