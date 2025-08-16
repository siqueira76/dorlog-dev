import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Plus, Mail, Phone, Edit, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Doctor type based on Firebase structure
interface Doctor {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
  contato: {
    telefone: string;
    email: string;
  };
  usuarioId: string;
}

export default function Doctors() {
  const [, setLocation] = useLocation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const handleAddDoctor = () => {
    setLocation('/doctors/add');
  };

  // Fetch doctors from Firebase
  const fetchDoctors = async () => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Buscando médicos para usuário:', firebaseUser.uid);
      
      const doctorsCollection = collection(db, 'medicos');
      const q = query(
        doctorsCollection,
        where('usuarioId', '==', firebaseUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const doctorsData: Doctor[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        doctorsData.push({
          id: doc.id,
          nome: data.nome || '',
          especialidade: data.especialidade || '',
          crm: data.crm || '',
          contato: {
            telefone: data.contato?.telefone || '',
            email: data.contato?.email || ''
          },
          usuarioId: data.usuarioId || ''
        });
      });

      // Sort doctors by name on the client side
      const sortedDoctors = doctorsData.sort((a, b) => a.nome.localeCompare(b.nome));
      setDoctors(sortedDoctors);
      console.log('✅ Médicos carregados:', sortedDoctors.length);

    } catch (error) {
      console.error('❌ Erro ao buscar médicos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de médicos"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [firebaseUser]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Meus Médicos</h2>
          <p className="text-muted-foreground text-sm">
            Gerencie sua equipe médica e mantenha as informações atualizadas
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Meus Médicos</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
            data-testid="button-add-doctor"
            onClick={handleAddDoctor}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Gerencie sua equipe médica e mantenha as informações atualizadas
        </p>
      </div>

      {/* Doctors List or Empty State */}
      {doctors.length === 0 ? (
        /* Empty State */
        <Card className="shadow-sm border border-border">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum médico cadastrado</h3>
              <p className="text-sm mb-6">
                Adicione seus médicos para ter acesso rápido às informações de contato e especialidades
              </p>
              <Button
                className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
                data-testid="button-add-first-doctor"
                onClick={handleAddDoctor}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Médico
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Doctors List */
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-sm border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{doctor.nome}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{doctor.especialidade}</p>
                    <p className="text-xs text-muted-foreground mb-3">CRM: {doctor.crm}</p>
                    
                    {/* Contact Information */}
                    <div className="space-y-1">
                      {doctor.contato.telefone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {doctor.contato.telefone}
                        </div>
                      )}
                      {doctor.contato.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {doctor.contato.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
