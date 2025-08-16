import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Pill, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

// Validation schema based on Firebase structure
const medicationSchema = z.object({
  nome: z.string().min(1, 'Nome do medicamento é obrigatório'),
  posologia: z.string().min(1, 'Dosagem é obrigatória'),
  frequencia: z.string().min(1, 'Frequência é obrigatória'),
  medicoId: z.string().min(1, 'Médico é obrigatório'),
  hora: z.string().min(1, 'Hora do lembrete é obrigatória')
});

type MedicationFormData = z.infer<typeof medicationSchema>;

// Doctor interface for dropdown
interface Doctor {
  id: string;
  nome: string;
}

export default function AddMedication() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const { toast } = useToast();
  const { firebaseUser } = useAuth();

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      nome: '',
      posologia: '',
      frequencia: '',
      medicoId: '',
      hora: ''
    }
  });

  // Fetch doctors for dropdown
  const fetchDoctors = async () => {
    if (!firebaseUser) {
      setLoadingDoctors(false);
      return;
    }

    try {
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
          nome: data.nome || ''
        });
      });

      const sortedDoctors = doctorsData.sort((a, b) => a.nome.localeCompare(b.nome));
      setDoctors(sortedDoctors);

    } catch (error) {
      console.error('❌ Erro ao buscar médicos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de médicos"
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [firebaseUser]);

  const onSubmit = async (data: MedicationFormData) => {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare medication data according to Firebase structure
      const medicationData = {
        nome: data.nome,
        posologia: data.posologia,
        frequencia: data.frequencia,
        medicoId: data.medicoId,
        lembrete: {
          hora: data.hora,
          status: true
        },
        usuarioId: firebaseUser.uid,
        createdAt: serverTimestamp()
      };

      // Add to Firestore medicamentos collection
      const docRef = await addDoc(collection(db, 'medicamentos'), medicationData);
      
      console.log('✅ Medicamento adicionado com sucesso:', docRef.id);

      toast({
        title: "Sucesso!",
        description: "Medicamento cadastrado com sucesso"
      });

      // Navigate back to medications page
      setLocation('/medications');
      
      // Force refresh the medications page
      window.location.reload();

    } catch (error) {
      console.error('❌ Erro ao adicionar medicamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível cadastrar o medicamento. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/medications')}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground">Adicionar Medicamento</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Cadastre um novo medicamento para seu tratamento
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Pill className="h-5 w-5 mr-2 text-primary" />
            Dados do Medicamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome do Medicamento *
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Paracetamol"
                {...form.register('nome')}
                className="rounded-xl"
                disabled={isSubmitting}
              />
              {form.formState.errors.nome && (
                <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
              )}
            </div>

            {/* Dosagem (Posologia) */}
            <div className="space-y-2">
              <Label htmlFor="posologia" className="text-sm font-medium">
                Dosagem *
              </Label>
              <Input
                id="posologia"
                type="text"
                placeholder="Ex: 500mg"
                {...form.register('posologia')}
                className="rounded-xl"
                disabled={isSubmitting}
              />
              {form.formState.errors.posologia && (
                <p className="text-sm text-red-500">{form.formState.errors.posologia.message}</p>
              )}
            </div>

            {/* Frequência */}
            <div className="space-y-2">
              <Label htmlFor="frequencia" className="text-sm font-medium">
                Frequência *
              </Label>
              <Input
                id="frequencia"
                type="text"
                placeholder="Ex: 3x ao dia"
                {...form.register('frequencia')}
                className="rounded-xl"
                disabled={isSubmitting}
              />
              {form.formState.errors.frequencia && (
                <p className="text-sm text-red-500">{form.formState.errors.frequencia.message}</p>
              )}
            </div>

            {/* Médico */}
            <div className="space-y-2">
              <Label htmlFor="medicoId" className="text-sm font-medium">
                Médico Responsável *
              </Label>
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando médicos...</span>
                </div>
              ) : doctors.length === 0 ? (
                <div className="p-4 border border-border rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhum médico cadastrado. Cadastre um médico primeiro.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/doctors/add')}
                    className="w-full mt-2"
                  >
                    Cadastrar Médico
                  </Button>
                </div>
              ) : (
                <Select
                  onValueChange={(value) => form.setValue('medicoId', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.medicoId && (
                <p className="text-sm text-red-500">{form.formState.errors.medicoId.message}</p>
              )}
            </div>

            {/* Horário do Lembrete */}
            <div className="space-y-2">
              <Label htmlFor="hora" className="text-sm font-medium">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora do Lembrete *
              </Label>
              <Input
                id="hora"
                type="time"
                {...form.register('hora')}
                className="rounded-xl"
                disabled={isSubmitting}
              />
              {form.formState.errors.hora && (
                <p className="text-sm text-red-500">{form.formState.errors.hora.message}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/medications')}
                className="flex-1 rounded-xl"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
                disabled={isSubmitting || (doctors.length === 0 && !loadingDoctors)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Medicamento'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}