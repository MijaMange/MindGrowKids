import { create } from 'zustand';

export type Role = 'child' | 'parent' | 'pro' | '';

interface RoleState {
  role: Role;
  setRole: (r: Role) => void;
  clearRole: () => void;
}

const KEY = 'mgk-role';

function persistSet(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    // Silent fail
  }
}

function persistGet(): Role {
  try {
    return (localStorage.getItem(KEY) as Role) || '';
  } catch {
    return '';
  }
}

export const useRoleStore = create<RoleState>((set) => ({
  role: persistGet(),
  setRole: (r) => {
    persistSet(r);
    set({ role: r });
  },
  clearRole: () => {
    persistSet('');
    set({ role: '' });
  },
}));




