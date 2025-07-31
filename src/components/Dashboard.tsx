import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Phone,
  BarChart3,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CandidateForm from "./CandidateForm";
import CandidateList from "./CandidateList";
import InterviewedList from "./InterviewedList";
import CallNext from "./CallNext";
import ArrivedCandidatesList from "./ArrivedCandidatesList";
import AttendanceControl from "./AttendanceControl";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  interviewDate: string;
  interviewTime: string;
  resumeUrl?: string;
  status: "waiting" | "called" | "interviewed" | "no_show";
  createdAt: string;
  calledAt?: string;
  arrivedAt?: string;
}

const Dashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "register"
    | "waiting"
    | "interviewed"
    | "arrived"
    | "attendance"
  >("dashboard");

  // Load candidates from localStorage on mount
  useEffect(() => {
    const storedCandidates = localStorage.getItem("candidates");
    if (storedCandidates) {
      setCandidates(JSON.parse(storedCandidates));
    }
  }, []);

  // Save candidates to localStorage whenever candidates state changes
  useEffect(() => {
    localStorage.setItem("candidates", JSON.stringify(candidates));
  }, [candidates]);

  // Listen for arrival events from the public arrival page
  useEffect(() => {
    const handleCandidateArrival = (event: CustomEvent) => {
      const { candidateName, arrivedAt } = event.detail;
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.name.toLowerCase() === candidateName.toLowerCase() &&
          !candidate.arrivedAt
            ? { ...candidate, arrivedAt }
            : candidate
        )
      );
    };

    window.addEventListener(
      "candidateArrival",
      handleCandidateArrival as EventListener
    );
    return () => {
      window.removeEventListener(
        "candidateArrival",
        handleCandidateArrival as EventListener
      );
    };
  }, []);

  const addCandidate = (
    candidate: Omit<Candidate, "id" | "status" | "createdAt">
  ) => {
    const newCandidate: Candidate = {
      ...candidate,
      id: Date.now().toString(),
      status: "waiting",
      createdAt: new Date().toISOString(),
    };
    setCandidates((prev) => [...prev, newCandidate]);
  };

  const updateCandidateStatus = (id: string, status: Candidate["status"]) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status,
              calledAt:
                status === "called"
                  ? new Date().toISOString()
                  : candidate.calledAt,
            }
          : candidate
      )
    );
  };

  const markCandidateArrived = (candidateName: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.name.toLowerCase() === candidateName.toLowerCase() &&
        !candidate.arrivedAt
          ? {
              ...candidate,
              arrivedAt: new Date().toISOString(),
            }
          : candidate
      )
    );
  };

  const markAttendance = (id: string, attended: boolean) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status: attended ? "waiting" : "no_show",
              arrivedAt: attended ? new Date().toISOString() : undefined,
            }
          : candidate
      )
    );
  };

  const waitingCandidates = candidates.filter((c) => c.status === "waiting");
  const calledCandidates = candidates.filter(
    (c) => c.status === "called" || c.status === "interviewed"
  );
  const interviewedCandidates = candidates.filter(
    (c) => c.status === "interviewed" || c.status === "no_show"
  );
  const arrivedCandidates = candidates
    .filter((c) => c.arrivedAt)
    .sort(
      (a, b) =>
        new Date(a.arrivedAt!).getTime() - new Date(b.arrivedAt!).getTime()
    );
  // Só mostra candidatos que chegaram e estão aguardando para chamar
  const nextCandidate = arrivedCandidates.find((c) => c.status === "waiting");

  const renderContent = () => {
    switch (activeView) {
      case "register":
        return (
          <CandidateForm
            onAddCandidate={addCandidate}
            onBack={() => setActiveView("dashboard")}
          />
        );
      case "waiting":
        return (
          <CandidateList
            candidates={calledCandidates}
            onBack={() => setActiveView("dashboard")}
            onUpdateStatus={updateCandidateStatus}
          />
        );
      case "interviewed":
        return (
          <InterviewedList
            candidates={interviewedCandidates}
            onBack={() => setActiveView("dashboard")}
          />
        );
      case "arrived":
        return (
          <ArrivedCandidatesList
            candidates={candidates}
            onBack={() => setActiveView("dashboard")}
            onUpdateStatus={updateCandidateStatus}
          />
        );
      case "attendance":
        return (
          <AttendanceControl
            candidates={candidates}
            onBack={() => setActiveView("dashboard")}
            onMarkAttendance={markAttendance}
            onViewArrivedCandidates={() => setActiveView("arrived")}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-border pb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Sistema de Gerenciamento de Entrevistas
              </h1>
              <p className="text-muted-foreground mb-2">
                Gerencie candidatos, entrevistas e acompanhe todo o processo de
                forma eficiente
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Candidatos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Todos os registros
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aguardando
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {waitingCandidates.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Na fila de espera
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Chegaram
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {arrivedCandidates.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Presentes hoje
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Chamados
                  </CardTitle>
                  <Phone className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {calledCandidates.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Já foram chamados
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Entrevistados
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {
                      candidates.filter((c) => c.status === "interviewed")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </CardContent>
              </Card>
            </div>

            {/* Call Next Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Chamar Próximo Candidato</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CallNext
                  nextCandidate={nextCandidate}
                  onCallNext={(candidateId) =>
                    updateCandidateStatus(candidateId, "called")
                  }
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveView("register")}
              >
                <CardHeader className="text-center">
                  <UserPlus className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Cadastrar Candidato</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Registre um novo candidato para entrevista
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary">
                      <br />
                    </Badge>
                  </div>
                  <Button className="w-full">Cadastrar</Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveView("attendance")}
              >
                <CardHeader className="text-center">
                  <UserCheck className="h-12 w-12 text-warning mx-auto mb-2" />
                  <CardTitle>Controle de Presença</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Marque presença dos candidatos
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {
                        candidates.filter(
                          (c) => !c.arrivedAt && c.status !== "no_show"
                        ).length
                      }{" "}
                      pendentes
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Controlar Presença
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveView("arrived")}
              >
                <CardHeader className="text-center">
                  <UserCheck className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Candidatos que Chegaram</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Veja quem já chegou para entrevista
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {arrivedCandidates.length} chegaram
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver Chegadas
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveView("waiting")}
              >
                <CardHeader className="text-center">
                  <Phone className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Candidatos Chamados</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Veja quem já foi chamado para entrevista
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {calledCandidates.length} candidatos
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver Lista
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveView("interviewed")}
              >
                <CardHeader className="text-center">
                  <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Relatório de Entrevistas</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Acompanhe resultados e estatísticas
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {interviewedCandidates.length} registros
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
