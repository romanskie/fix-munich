export interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    favoriteColor?: string;
    role: Role;
  }

  export interface Role{
    isAdmin: boolean;
    isReader: boolean;
  }
