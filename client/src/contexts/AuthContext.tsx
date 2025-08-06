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

  // Create or update user document in Firestore with enhanced validation
  const createUserDocument = async (firebaseUser: FirebaseUser, additionalData?: any, requireSave: boolean = false) => {
    if (!firebaseUser?.uid) {
      console.error('Firebase user ou UID inválido');
      return null;
    }

    try {
      // Wait for proper authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get authentication token with proper error handling
      const token = await firebaseUser.getIdToken(true);
      if (!token) {
        console.error('Token de autenticação não disponível');
        return null;
      }

      console.log('Token obtido, tentando acessar Firestore...');
      const userRef = doc(db, 'usuarios', firebaseUser.uid);
      
      // Check if user exists
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email } = firebaseUser;
        const provider = firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
        
        const userData = {
          id: firebaseUser.uid,
          name: displayName || additionalData?.name || '',
          email: email || '',
          provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log('Criando novo usuário no Firestore:', userData);
        await setDoc(userRef, userData);
        
        // Verify the document was created
        const verifySnap = await getDoc(userRef);
        if (verifySnap.exists()) {
          console.log('✅ Usuário criado e verificado no Firestore');
          return userData as User;
        } else {
          console.error('❌ Falha na verificação: usuário não foi salvo');
          if (requireSave) throw new Error('Falha ao salvar usuário no Firestore');
          return null;
        }
      } else {
        console.log('✅ Usuário existente encontrado no Firestore');
        return userSnap.data() as User;
      }
    } catch (error: any) {
      console.error('❌ Erro detalhado ao acessar Firestore:', error);
      
      if (error.code === 'permission-denied') {
        console.error('Erro de permissão - verifique as regras do Firestore');
      } else if (error.code === 'unavailable') {
        console.error('Firestore indisponível');
      }
      
      if (requireSave) {
        throw new Error(`Falha crítica no Firestore: ${error.message}`);
      }
      
      return null;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for auth token
      await result.user.getIdToken();
      
      console.log('Tentando fazer login e salvar/buscar usuário no Firestore...');
      const userDoc = await createUserDocument(result.user);
      if (userDoc) {
        setCurrentUser(userDoc);
        toast({
          title: "Login realizado com sucesso!",
          description: "Dados carregados do Firestore.",
        });
      } else {
        // Fallback user data
        const fallbackUser: User = {
          id: result.user.uid,
          name: result.user.displayName || '',
          email: result.user.email || '',
          provider: 'email',
        };
        setCurrentUser(fallbackUser);
        toast({
          title: "Login realizado com sucesso!",
          description: "Usando dados locais (Firestore não disponível).",
        });
      }
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

  // Register with email and password - requires Firestore save
  const register = async (email: string, password: string, name: string) => {
    let firebaseUser: FirebaseUser | null = null;
    
    try {
      console.log('🔄 Iniciando processo de registro...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
      
      // Update display name
      await updateProfile(result.user, {
        displayName: name,
      });

      console.log('🔄 Tentando salvar usuário no Firestore (obrigatório)...');
      // Require Firestore save for registration
      const userDoc = await createUserDocument(result.user, { name }, true);
      
      if (userDoc) {
        setCurrentUser(userDoc);
        toast({
          title: "✅ Conta criada com sucesso!",
          description: "Usuário registrado no sistema.",
        });
      } else {
        throw new Error('Falha ao salvar no Firestore');
      }
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      // If user was created in Firebase Auth but failed in Firestore, delete it
      if (firebaseUser) {
        try {
          console.log('🔄 Removendo usuário do Firebase Auth devido a falha no Firestore...');
          await firebaseUser.delete();
          console.log('✅ Usuário removido do Firebase Auth');
        } catch (deleteError) {
          console.error('❌ Erro ao remover usuário do Firebase Auth:', deleteError);
        }
      }
      
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message?.includes('Firestore')) {
        errorMessage = "Erro de configuração do banco de dados. Contacte o suporte.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      }
      
      toast({
        title: "❌ Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Login with Google - Check if user exists, create if new
  const loginWithGoogle = async () => {
    try {
      console.log('🔄 Iniciando login com Google...');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Wait for authentication token to be available
      await result.user.getIdToken();
      
      // Small delay to ensure Firebase Auth is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 Verificando/criando usuário no Firestore...');
      // For Google login, try to save but don't require it for existing users
      const userDoc = await createUserDocument(result.user, undefined, false);
      
      if (userDoc) {
        setCurrentUser(userDoc);
        toast({
          title: "✅ Login realizado com sucesso!",
          description: "Dados carregados do Firestore.",
        });
      } else {
        // For Google login, we can proceed with fallback for existing users
        // but new users should ideally be saved to Firestore
        const fallbackUser: User = {
          id: result.user.uid,
          name: result.user.displayName || '',
          email: result.user.email || '',
          provider: 'google',
        };
        setCurrentUser(fallbackUser);
        toast({
          title: "⚠️ Login realizado",
          description: "Conectado com dados limitados.",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro no login com Google:', error);
      let errorMessage = "Erro no login com Google. Tente novamente.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelado pelo usuário.";
      } else if (error.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as configurações do Firebase.";
      }
      
      toast({
        title: "❌ Erro no login",
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
      const userRef = doc(db, 'usuarios', firebaseUser.uid);
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
        // Always create fallback user first to prevent auth state issues
        const fallbackUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
        };

        setCurrentUser(fallbackUser);
        setLoading(false);

        // Try to enhance with Firestore data in background
        setTimeout(async () => {
          try {
            console.log('Tentando carregar dados do usuário do Firestore...');
            const userDoc = await createUserDocument(firebaseUser);
            if (userDoc) {
              console.log('Dados do usuário carregados do Firestore');
              setCurrentUser(userDoc);
            } else {
              console.log('Usando dados de fallback - Firestore não disponível');
            }
          } catch (error) {
            console.log('Erro ao carregar do Firestore, usando dados de fallback');
          }
        }, 1000);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
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
