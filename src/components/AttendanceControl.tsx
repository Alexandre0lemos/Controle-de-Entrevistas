import { useState } from "react";
import { ArrowLeft, Clock, Users, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Candidate } from "./Dashboard";

interface AttendanceControlProps {
  candidates: Candidate[];
  onBack: () => void;
  onMarkAttendance: (id: string, attended: boolean) => void;
  onViewArrivedCandidates: () => void;
}

const AttendanceControl = ({ 
  candidates, 
  onBack, 
  onMarkAttendance, 
  onViewArrivedCandidates 
}: AttendanceControlProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar candidatos que ainda não tiveram presença marcada
  const pendingCandidates = candidates.filter(c => !c.arrivedAt && c.status !== "no_show");
  const arrivedCandidates = candidates.filter(c => c.arrivedAt);
  const noShowCandidates = candidates.filter(c => c.status === "no_show");

  const filteredCandidates = pendingCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-4 w-full">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl text-right font-bold text-foreground">Controle de Presença</h2>
            <p className="text-muted-foreground">
              Marque a presença dos candidatos no dia da entrevista
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{candidates.length}</div>
                <p className="text-sm text-muted-foreground">Total agendados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">{pendingCandidates.length}</div>
                <p className="text-sm text-muted-foreground">Aguardando chegada</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">{arrivedCandidates.length}</div>
                <p className="text-sm text-muted-foreground">Compareceram</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">{noShowCandidates.length}</div>
                <p className="text-sm text-muted-foreground">Não compareceram</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Digite o nome ou email do candidato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos Aguardando Presença ({pendingCandidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum candidato encontrado" : "Todos os candidatos já tiveram presença marcada"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{candidate.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{candidate.email}</span>
                      <span>{candidate.phone}</span>
                      <span>
                        Entrevista: {formatDate(candidate.interviewDate)} às {candidate.interviewTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => onMarkAttendance(candidate.id, true)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Compareceu
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onMarkAttendance(candidate.id, false)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Não Compareceu
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Marked */}
      {(arrivedCandidates.length > 0 || noShowCandidates.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arrivedCandidates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-success">Chegaram Hoje ({arrivedCandidates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {arrivedCandidates
                    .sort((a, b) => new Date(b.arrivedAt!).getTime() - new Date(a.arrivedAt!).getTime())
                    .slice(0, 10)
                    .map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{candidate.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-success border-success">
                            {formatTime(candidate.arrivedAt!)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
                {arrivedCandidates.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    + {arrivedCandidates.length - 10} outros...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {noShowCandidates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Não Compareceram ({noShowCandidates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {noShowCandidates.slice(0, 10).map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{candidate.name}</span>
                      <Badge variant="destructive">Ausente</Badge>
                    </div>
                  ))}
                </div>
                {noShowCandidates.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    + {noShowCandidates.length - 10} outros...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceControl;