import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { currentUser, updateUserProfile, updateUserPassword, testFirestoreConnection } = useAuth();
  const { toast } = useToast();
  
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isTestingFirestore, setIsTestingFirestore] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira seu nome.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateUserProfile(profileForm.name.trim());
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password update error:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFirestoreTest = async () => {
    setIsTestingFirestore(true);
    try {
      const result = await testFirestoreConnection();
      toast({
        title: result ? "Firestore Funcional" : "Firestore Indisponível",
        description: result 
          ? "Conexão com Firestore bem-sucedida! A coleção 'usuarios' pode ser criada."
          : "Não foi possível conectar ao Firestore. Verifique as configurações do Firebase.",
        variant: result ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar conexão com Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsTestingFirestore(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card className="shadow-sm border border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Editar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Profile Information */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label htmlFor="profileName" className="block text-sm font-medium text-foreground mb-2">
                Nome
              </Label>
              <Input
                id="profileName"
                type="text"
                value={profileForm.name}
                onChange={(e) => handleProfileInputChange('name', e.target.value)}
                className="w-full rounded-xl"
                data-testid="input-profile-name"
              />
            </div>
            
            <div>
              <Label htmlFor="profileEmail" className="block text-sm font-medium text-foreground mb-2">
                E-mail
              </Label>
              <Input
                id="profileEmail"
                type="email"
                value={profileForm.email}
                className="w-full rounded-xl bg-muted text-muted-foreground"
                readOnly
                data-testid="input-profile-email"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O e-mail não pode ser alterado
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              data-testid="button-update-profile"
            >
              {isUpdatingProfile ? 'Salvando...' : 'Salvar Informações'}
            </Button>
          </form>

          <Separator />

          {/* Password Change */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Alterar Senha</h4>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                  Senha atual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  className="w-full rounded-xl"
                  placeholder="••••••••"
                  data-testid="input-current-password"
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  Nova senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  className="w-full rounded-xl"
                  placeholder="••••••••"
                  data-testid="input-new-password"
                />
              </div>

              <div>
                <Label htmlFor="confirmNewPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirmar nova senha
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  className="w-full rounded-xl"
                  placeholder="••••••••"
                  data-testid="input-confirm-new-password"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                data-testid="button-update-password"
              >
                {isUpdatingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Firestore Diagnostics */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Diagnóstico do Sistema</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Teste a conectividade com o Firestore para verificar se a coleção 'usuarios' pode ser criada.
            </p>
            
            <Button
              onClick={handleFirestoreTest}
              disabled={isTestingFirestore}
              variant="outline"
              className="w-full rounded-xl font-medium transition-colors"
              data-testid="button-test-firestore"
            >
              {isTestingFirestore ? 'Testando conexão...' : 'Testar Firestore'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
