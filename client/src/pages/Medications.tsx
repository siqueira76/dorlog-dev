import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Clock, Calendar, Edit, Loader2, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Medication type based on Firebase structure
interface Medication {
  id: string;
  nome: string;
  posologia: string;
  frequencia: string;
  medicoId: string;
  lembrete: {
    hora: string;
    status: boolean;
  };
  usuarioId: string;
  medicoNome?: string; // Will be populated from doctor lookup
}

export default function Medications() {
  const [, setLocation] = useLocation();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const handleAddMedication = () => {
    setLocation('/medications/add');
  };

  // Fetch medications from Firebase
  const fetchMedications = async () => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Buscando medicamentos para usuário:', firebaseUser.uid);
      
      const medicationsCollection = collection(db, 'medicamentos');
      const q = query(
        medicationsCollection,
        where('usuarioId', '==', firebaseUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const medicationsData: Medication[] = [];
      
      // Get medications first
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        medicationsData.push({
          id: doc.id,
          nome: data.nome || '',
          posologia: data.posologia || '',
          frequencia: data.frequencia || '',
          medicoId: data.medicoId || '',
          lembrete: {
            hora: data.lembrete?.hora || '',
            status: data.lembrete?.status || false
          },
          usuarioId: data.usuarioId || ''
        });
      });

      // Now fetch doctor names for each medication
      if (medicationsData.length > 0) {
        const doctorsCollection = collection(db, 'medicos');
        const doctorsQuery = query(
          doctorsCollection,
          where('usuarioId', '==', firebaseUser.uid)
        );
        
        const doctorsSnapshot = await getDocs(doctorsQuery);
        const doctorsMap = new Map<string, string>();
        
        doctorsSnapshot.forEach((doc) => {
          const data = doc.data();
          doctorsMap.set(doc.id, data.nome || 'Médico não encontrado');
        });

        // Add doctor names to medications
        medicationsData.forEach(medication => {
          medication.medicoNome = doctorsMap.get(medication.medicoId) || 'Médico não encontrado';
        });
      }

      // Sort medications by name on the client side
      const sortedMedications = medicationsData.sort((a, b) => a.nome.localeCompare(b.nome));
      setMedications(sortedMedications);
      console.log('✅ Medicamentos carregados:', sortedMedications.length);

    } catch (error) {
      console.error('❌ Erro ao buscar medicamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de medicamentos"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [firebaseUser]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Medicamentos</h2>
          <p className="text-muted-foreground text-sm">
            Controle seus medicamentos e nunca esqueça de tomar na hora certa
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
          <h2 className="text-xl font-semibold text-foreground">Medicamentos</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
            data-testid="button-add-medication"
            onClick={handleAddMedication}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Controle seus medicamentos e nunca esqueça de tomar na hora certa
        </p>
      </div>

      {/* Medications List or Empty State */}
      {medications.length === 0 ? (
        /* Empty State */
        <Card className="shadow-sm border border-border">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Pill className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum medicamento cadastrado</h3>
              <p className="text-sm mb-6">
                Adicione seus medicamentos para receber lembretes e acompanhar seu tratamento
              </p>
              <Button
                className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
                data-testid="button-add-first-medication"
                onClick={handleAddMedication}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Medicamento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Medications List */
        <div className="space-y-3">
          {medications.map((medication) => (
            <Card key={medication.id} className="shadow-sm border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">
                      {medication.nome} - {medication.posologia}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{medication.frequencia}</p>
                    
                    {/* Medication Information */}
                    <div className="space-y-1">
                      {medication.lembrete.hora && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          Lembrete: {medication.lembrete.hora}
                        </div>
                      )}
                      {medication.medicoNome && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          {medication.medicoNome}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Tomei
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
