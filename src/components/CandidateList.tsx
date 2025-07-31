import { useState } from "react";
import { ArrowLeft, Search, Filter, Download, Eye, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Candidate } from "./Dashboard";

interface CandidateListProps {
  candidates: Candidate[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: Candidate["status"]) => void;
}

const CandidateList = ({ candidates, onBack, onUpdateStatus }: CandidateListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");

  const getStatusInfo = (status: Candidate["status"]) => {
    switch (status) {
      case "called":
        return { label: "Chamado", variant: "default" as const, color: "text-primary" };
      case "interviewed":
        return { label: "Entrevistado", variant: "default" as const, color: "text-success" };
      case "no_show":
        return { label: "Não Compareceu", variant: "destructive" as const, color: "text-destructive" };
      default:
        return { label: "Aguardando", variant: "secondary" as const, color: "text-warning" };
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesDate = !dateFilter || candidate.interviewDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewResume = (resumeUrl: string, candidateName: string) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast({
        title: "Currículo não encontrado",
        description: `${candidateName} não possui currículo anexado.`,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsInterviewed = (candidateId: string, candidateName: string) => {
    onUpdateStatus(candidateId, "interviewed");
    toast({
      title: "Status atualizado",
      description: `${candidateName} foi marcado como entrevistado.`,
    });
  };

  const handleMarkAsNoShow = (candidateId: string, candidateName: string) => {
    onUpdateStatus(candidateId, "no_show");
    toast({
      title: "Status atualizado",
      description: `${candidateName} foi marcado como não compareceu.`,
    });
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Email", "Telefone", "Data", "Horário", "Status", "Data da Chamada"];
    const csvData = filteredCandidates.map(candidate => [
      candidate.name,
      candidate.email,
      candidate.phone,
      candidate.interviewDate,
      candidate.interviewTime,
      getStatusInfo(candidate.status).label,
      candidate.calledAt ? new Date(candidate.calledAt).toLocaleString('pt-BR') : ""
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidatos_chamados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: "Lista de candidatos exportada com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Candidatos Chamados</h1>
          <p className="text-muted-foreground">
            Gerencie os candidatos que já foram chamados para entrevista
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="called">Chamado</SelectItem>
                <SelectItem value="interviewed">Entrevistado</SelectItem>
                <SelectItem value="no_show">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Filtrar por data"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredCandidates.length} candidatos encontrados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Candidatos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {candidates.length === 0 ? "Nenhum candidato foi chamado ainda." : "Nenhum candidato encontrado com os filtros aplicados."}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => {
                const statusInfo = getStatusInfo(candidate.status);
                return (
                  <div key={candidate.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <h3 className="font-medium text-foreground">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Telefone:</p>
                          <p className="text-foreground">{candidate.phone || "Não informado"}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Data/Hora:</p>
                          <p className="text-foreground">
                            {new Date(candidate.interviewDate).toLocaleDateString('pt-BR')} às {candidate.interviewTime}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Chamado em:</p>
                          <p className="text-foreground">
                            {candidate.calledAt 
                              ? new Date(candidate.calledAt).toLocaleString('pt-BR')
                              : "Não chamado"
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.variant} className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {candidate.resumeUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResume(candidate.resumeUrl!, candidate.name)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Currículo
                          </Button>
                        )}
                        {candidate.status === "called" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsInterviewed(candidate.id, candidate.name)}
                              className="flex items-center gap-1 text-success hover:text-success"
                            >
                              <UserCheck className="h-4 w-4" />
                              Entrevistado
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateList;