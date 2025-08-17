import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pill, Plus, Clock, Calendar, Edit, Trash2, Loader2, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ReminderService from '@/services/reminderService';

// Medication type based on Firebase structure
interface Medication {
  id: string;
  nome: string;
  posologia: string;
  frequencia: string;
  medicoId: string;
  lembrete: Array<{
    hora: string;
    status: boolean;
  }>;
  usuarioId: string;
  medicoNome?: string; // Will be populated from doctor lookup
  lastReset?: string; // Data do último reset (formato YYYY-MM-DD)
}

// Doctor interface for the select dropdown
interface Doctor {
  id: string;
  nome: string;
  especialidade: string;
}

export default function Medications() {
  const [, setLocation] = useLocation();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [updatingReminder, setUpdatingReminder] = useState<string | null>(null); // medicationId-index
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const handleAddMedication = () => {
    setLocation('/medications/add');
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMedication || !firebaseUser) return;

    setIsUpdateLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      // Parse reminder times from form
      const newReminderTimes = (formData.get('lembrete') as string || '')
        .split(',')
        .map(time => time.trim())
        .filter(time => time);

      // Preserve existing reminder status when possible
      const updatedReminders = newReminderTimes.map(hora => {
        // Find existing reminder with same time to preserve status
        const existingReminder = editingMedication.lembrete?.find(r => r.hora === hora);
        return {
          hora,
          status: existingReminder ? existingReminder.status : false
        };
      });

      const updatedMedication = {
        nome: formData.get('nome') as string,
        posologia: formData.get('posologia') as string,
        frequencia: formData.get('frequencia') as string,
        medicoId: formData.get('medicoId') as string,
        lembrete: updatedReminders,
        // Preserve other fields that might exist
        lastReset: editingMedication.lastReset
      };

      const medicationRef = doc(db, 'medicamentos', editingMedication.id);
      await updateDoc(medicationRef, updatedMedication);

      setIsEditDialogOpen(false);
      setEditingMedication(null);
      fetchMedications(); // Refresh the list

      toast({
        title: "Sucesso",
        description: "Medicamento atualizado com sucesso!"
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar medicamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o medicamento"
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleDeleteMedication = async (medicationId: string, medicationName: string) => {
    if (!firebaseUser) return;

    try {
      const medicationRef = doc(db, 'medicamentos', medicationId);
      await deleteDoc(medicationRef);

      fetchMedications(); // Refresh the list

      toast({
        title: "Sucesso",
        description: `Medicamento ${medicationName} removido com sucesso!`
      });

    } catch (error) {
      console.error('❌ Erro ao deletar medicamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o medicamento"
      });
    }
  };

  // Função para marcar/desmarcar um lembrete como tomado
  const handleToggleReminderStatus = async (medicationId: string, reminderIndex: number, currentStatus: boolean) => {
    if (!firebaseUser) return;

    const updateId = `${medicationId}-${reminderIndex}`;
    setUpdatingReminder(updateId);

    try {
      // Encontrar o medicamento na lista local
      const medication = medications.find(med => med.id === medicationId);
      if (!medication) return;

      // Criar cópia dos lembretes com o status atualizado
      const updatedReminders = medication.lembrete.map((reminder, index) => 
        index === reminderIndex 
          ? { ...reminder, status: !currentStatus }
          : reminder
      );

      // Atualizar no Firebase
      const medicationRef = doc(db, 'medicamentos', medicationId);
      await updateDoc(medicationRef, {
        lembrete: updatedReminders
      });

      // Atualizar estado local
      setMedications(prevMedications => 
        prevMedications.map(med => 
          med.id === medicationId 
            ? { ...med, lembrete: updatedReminders }
            : med
        )
      );

      toast({
        title: "Status atualizado",
        description: `Lembrete ${!currentStatus ? 'marcado como tomado' : 'desmarcado'}`,
        duration: 2000
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar status do lembrete:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do lembrete"
      });
    } finally {
      setUpdatingReminder(null);
    }
  };

  // Fetch doctors for the select dropdown
  const fetchDoctors = async () => {
    if (!firebaseUser) return;

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
          nome: data.nome || '',
          especialidade: data.especialidade || ''
        });
      });

      setDoctors(doctorsData.sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch (error) {
      console.error('❌ Erro ao buscar médicos para edição:', error);
    }
  };

  // Fetch medications from Firebase
  const fetchMedications = async () => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Buscando medicamentos para usuário:', firebaseUser.uid);
      
      // Verificar e resetar lembretes se necessário antes de buscar
      try {
        await ReminderService.checkAndResetIfNeeded(firebaseUser.uid);
      } catch (error) {
        console.error('Erro ao verificar reset de lembretes na tela medicamentos:', error);
      }
      
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
          lembrete: Array.isArray(data.lembrete) 
            ? data.lembrete 
            : data.lembrete?.hora 
              ? [{ hora: data.lembrete.hora, status: data.lembrete.status || false }]
              : [],
          usuarioId: data.usuarioId || '',
          lastReset: data.lastReset || undefined
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
    fetchDoctors();
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
          {medications.map((medication) => {
            const totalReminders = medication.lembrete?.length || 0;
            const completedReminders = medication.lembrete?.filter(l => l.status).length || 0;
            const allCompleted = totalReminders > 0 && completedReminders === totalReminders;
            const hasPending = totalReminders > 0 && completedReminders < totalReminders;
            
            return (
            <Card key={medication.id} className={`shadow-sm border transition-colors ${
              allCompleted 
                ? 'border-green-200 bg-green-50/30' 
                : hasPending 
                  ? 'border-red-200 bg-red-50/20' 
                  : 'border-border'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">
                      {medication.nome} - {medication.posologia}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{medication.frequencia}</p>
                    
                    {/* Medication Information */}
                    <div className="space-y-1">
                      {medication.lembrete && medication.lembrete.length > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          Lembretes: {medication.lembrete.map(l => l.hora).join(', ')}
                        </div>
                      )}
                      {medication.medicoNome && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          {medication.medicoNome}
                        </div>
                      )}
                      
                      {/* Lembretes com botões individuais */}
                      {medication.lembrete && medication.lembrete.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground font-medium">Lembretes de hoje:</p>
                            <span className="text-xs text-muted-foreground">
                              {medication.lembrete.filter(l => l.status).length}/{medication.lembrete.length} tomados
                            </span>
                          </div>
                          {medication.lembrete.map((lembrete, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm font-medium">{lembrete.hora}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  lembrete.status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {lembrete.status ? '✓ Tomado' : '○ Pendente'}
                                </span>
                              </div>
                              <Button
                                variant={lembrete.status ? "default" : "outline"}
                                size="sm"
                                className={`text-xs px-3 py-1 min-w-[70px] ${
                                  lembrete.status
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                                onClick={() => handleToggleReminderStatus(medication.id, index, lembrete.status)}
                                disabled={updatingReminder === `${medication.id}-${index}`}
                                data-testid={`button-toggle-reminder-${medication.id}-${index}`}
                              >
                                {updatingReminder === `${medication.id}-${index}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  lembrete.status ? 'Tomado' : 'Tomar'
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMedication(medication)}
                      data-testid={`button-edit-medication-${medication.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-medication-${medication.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o medicamento <strong>{medication.nome}</strong>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMedication(medication.id, medication.nome)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Edit Medication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Medicamento</DialogTitle>
          </DialogHeader>
          {editingMedication && (
            <form onSubmit={handleUpdateMedication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do Medicamento*</Label>
                <Input
                  id="edit-nome"
                  name="nome"
                  defaultValue={editingMedication.nome}
                  placeholder="Digite o nome do medicamento"
                  required
                  data-testid="input-edit-medication-nome"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-posologia">Posologia*</Label>
                <Input
                  id="edit-posologia"
                  name="posologia"
                  defaultValue={editingMedication.posologia}
                  placeholder="Ex: 500mg, 1 comprimido"
                  required
                  data-testid="input-edit-medication-posologia"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-frequencia">Frequência*</Label>
                <Input
                  id="edit-frequencia"
                  name="frequencia"
                  defaultValue={editingMedication.frequencia}
                  placeholder="Ex: 2 vezes ao dia, A cada 8 horas"
                  required
                  data-testid="input-edit-medication-frequencia"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-medicoId">Médico Responsável*</Label>
                <Select name="medicoId" defaultValue={editingMedication.medicoId} required>
                  <SelectTrigger data-testid="select-edit-medication-doctor">
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.nome} - {doctor.especialidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-lembrete">Horários de Lembrete</Label>
                <Input
                  id="edit-lembrete"
                  name="lembrete"
                  defaultValue={editingMedication.lembrete.map(l => l.hora).join(', ')}
                  placeholder="Ex: 08:00, 14:00, 20:00"
                  data-testid="input-edit-medication-lembrete"
                />
                <p className="text-xs text-muted-foreground">
                  Separe os horários por vírgula. Formato: HH:MM
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdateLoading}
                  data-testid="button-update-medication"
                >
                  {isUpdateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    'Atualizar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
