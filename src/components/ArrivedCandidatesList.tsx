import { ArrowLeft, Clock, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "./Dashboard";

interface ArrivedCandidatesListProps {
  candidates: Candidate[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: Candidate["status"]) => void;
}

const ArrivedCandidatesList = ({ candidates, onBack, onUpdateStatus }: ArrivedCandidatesListProps) => {
  const arrivedCandidates = candidates
    .filter(c => c.arrivedAt)
    .sort((a, b) => new Date(a.arrivedAt!).getTime() - new Date(b.arrivedAt!).getTime());

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Candidate["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary">Aguardando</Badge>;
      case "called":
        return <Badge variant="default">Na entrevista</Badge>;
      case "interviewed":
        return <Badge variant="outline" className="text-success border-success">Entrevistado</Badge>;
      case "present":
        return <Badge variant="default">Aguardando ser chamado</Badge>;
      case "no_show":
        return <Badge variant="destructive">Não compareceu</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground text-right">Candidatos que Chegaram</h2>
          <p className="text-muted-foreground text-right">
            Lista ordenada por horário de chegada
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">
                  {arrivedCandidates.filter(e => e.status === "present").length}
                </div>
                <p className="text-sm text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">
                  {arrivedCandidates.filter(c => c.status === "interviewed").length}
                </div>
                <p className="text-sm text-muted-foreground">Entrevistados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Chegadas</CardTitle>
        </CardHeader>
        <CardContent>
          {arrivedCandidates.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum candidato chegou ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {arrivedCandidates.filter(e => e.status !== "no_show").map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{candidate.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Chegou às {formatTime(candidate.arrivedAt!)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(candidate.status)}
                    {candidate.status === "waiting" && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(candidate.id, "called")}
                      >
                        Chamar
                      </Button>
                    )}         
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArrivedCandidatesList;