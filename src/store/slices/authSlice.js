import { createSlice } from '@reduxjs/toolkit';

const DEMO_PROFILES = {
  buyer: {
    id: 'user_demo_buyer_01',
    firstName: 'Alex',
    lastName: 'Vance',
    fullName: 'Alex Vance',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    primaryEmailAddress: { emailAddress: 'alex.buyer@aura-luxe.com' },
    role: 'buyer',
  },
  vip: {
    id: 'user_demo_vip_02',
    firstName: 'Jordan',
    lastName: 'Kaye',
    fullName: 'Jordan Kaye (VIP)',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    primaryEmailAddress: { emailAddress: 'jordan.vip@aura-luxe.com' },
    role: 'vip',
  },
};

function getInitialDemoUser() {
  try {
    const saved = localStorage.getItem('aura_demo_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const initialState = {
  demoUser: getInitialDemoUser(),
  role: getInitialDemoUser()?.role || 'guest',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginDemo: (state, action) => {
      const role = action.payload || 'buyer';
      const user = DEMO_PROFILES[role] || DEMO_PROFILES.buyer;
      state.demoUser = user;
      state.role = role;
      try {
        localStorage.setItem('aura_demo_user', JSON.stringify(user));
      } catch {}
    },
    logoutDemo: (state) => {
      state.demoUser = null;
      state.role = 'guest';
      try {
        localStorage.removeItem('aura_demo_user');
      } catch {}
    },
  },
});

export const { loginDemo, logoutDemo } = authSlice.actions;

export const selectDemoUser = (state) => state.auth.demoUser;
export const selectUserRole = (state) => state.auth.role;
export const selectIsDemoLoggedIn = (state) => Boolean(state.auth.demoUser);

export default authSlice.reducer;
