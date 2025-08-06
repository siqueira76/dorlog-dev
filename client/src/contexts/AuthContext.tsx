import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Create or update user document in Firestore
  const createUserDocument = async (firebaseUser: FirebaseUser, additionalData?: any) => {
    if (!firebaseUser) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email } = firebaseUser;
      const provider = firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
      
      try {
        await setDoc(userRef, {
          id: firebaseUser.uid,
          name: displayName || additionalData?.name || '',
          email: email || '',
          provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
      }
    }

    // Get the user document
    const updatedUserSnap = await getDoc(userRef);
    if (updatedUserSnap.exists()) {
      return updatedUserSnap.data() as User;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await createUserDocument(result.user);
      setCurrentUser(userDoc || null);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao DorLog.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Erro no login. Tente novamente.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Register with email and password
  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, {
        displayName: name,
      });

      const userDoc = await createUserDocument(result.user, { name });
      setCurrentUser(userDoc || null);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao DorLog.",
      });
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await createUserDocument(result.user);
      setCurrentUser(userDoc || null);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao DorLog.",
      });
    } catch (error: any) {
      console.error('Google login error:', error);
      let errorMessage = "Erro no login com Google. Tente novamente.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelado pelo usuário.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Erro ao sair. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (name: string) => {
    if (!firebaseUser || !currentUser) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      // Update Firestore document
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        name,
        updatedAt: new Date(),
      });

      // Update local state
      setCurrentUser({
        ...currentUser,
        name,
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Erro ao atualizar informações. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user password
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser) return;

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email!, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error: any) {
      console.error('Update password error:', error);
      let errorMessage = "Erro ao alterar senha. Tente novamente.";
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha atual incorreta.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A nova senha deve ter pelo menos 6 caracteres.";
      }
      
      toast({
        title: "Erro ao alterar senha",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await createUserDocument(firebaseUser);
          setCurrentUser(userDoc || null);
        } catch (error) {
          console.error('Error getting user document:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    firebaseUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
