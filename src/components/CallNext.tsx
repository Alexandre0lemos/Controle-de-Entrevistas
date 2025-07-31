import { useState, useEffect } from "react";
import { Phone, User, Calendar, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Candidate } from "./Dashboard";

interface CallNextProps {
  nextCandidate: Candidate | undefined;
  onCallNext: (candidateId: string) => void;
}

const CallNext = ({ nextCandidate, onCallNext }: CallNextProps) => {
  const { toast } = useToast();
  const [isCallingSound, setIsCallingSound] = useState(false);

  // Play notification sound
  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleCallNext = () => {
    if (!nextCandidate) {
      toast({
        title: "Nenhum candidato na fila",
        description: "Não há candidatos aguardando para serem chamados.",
        variant: "destructive",
      });
      return;
    }

    // Show notification with sound
    setIsCallingSound(true);
    playNotificationSound();

    // Display calling notification
    toast({
      title: "🔔 Candidato Chamado!",
      description: (
        <div className="flex flex-col gap-2 mt-2">
          <div className="font-semibold text-lg">{nextCandidate.name}</div>
          <div className="text-sm opacity-90">
            Entrevista: {new Date(nextCandidate.interviewDate).toLocaleDateString('pt-BR')} às {nextCandidate.interviewTime}
          </div>
        </div>
      ),
      duration: 5000,
    });

    // Update candidate status
    onCallNext(nextCandidate.id);

    // Reset sound indicator
    setTimeout(() => setIsCallingSound(false), 1000);
  };

  if (!nextCandidate) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-2">Nenhum candidato na fila</h3>
        <p className="text-sm text-muted-foreground">
          Todos os candidatos foram chamados ou não há novos cadastros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Next Candidate Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Próximo Candidato</h3>
              <Badge variant="secondary">Aguardando Chamada</Badge>
            </div>
          </div>
          {isCallingSound && (
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Bell className="h-5 w-5" />
              <span className="text-sm font-medium">Chamando...</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-bold text-foreground mb-1">{nextCandidate.name}</h4>
            <p className="text-muted-foreground">{nextCandidate.email}</p>
            {nextCandidate.phone && (
              <p className="text-muted-foreground">{nextCandidate.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {new Date(nextCandidate.interviewDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Horário:</span>
              <span className="font-medium">{nextCandidate.interviewTime}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Cadastrado em: {new Date(nextCandidate.createdAt).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Call Action */}
      <div className="text-center">
        <Button 
          onClick={handleCallNext}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Phone className="h-5 w-5 mr-2" />
          Chamar {nextCandidate.name.split(' ')[0]}
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Clique para chamar o próximo candidato e enviar notificação
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Instruções:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• O candidato será notificado através de som e pop-up</li>
          <li>• Após a chamada, o candidato será movido para a lista de "Chamados"</li>
          <li>• Você poderá marcar como "Entrevistado" ou "Não Compareceu" posteriormente</li>
        </ul>
      </div>
    </div>
  );
};

export default CallNext;