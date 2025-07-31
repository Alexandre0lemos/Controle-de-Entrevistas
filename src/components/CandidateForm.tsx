import { useState } from "react";
import { ArrowLeft, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Candidate } from "./Dashboard";

interface CandidateFormProps {
  onAddCandidate: (candidate: Omit<Candidate, "id" | "status" | "createdAt">) => void;
  onBack: () => void;
}

const CandidateForm = ({ onAddCandidate, onBack }: CandidateFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interviewDate: "",
    interviewTime: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Erro no arquivo",
          description: "Apenas arquivos PDF são aceitos para o currículo.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "O currículo deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome completo é obrigatório.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "E-mail é obrigatório.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.interviewDate) {
      toast({
        title: "Campo obrigatório",
        description: "Data da entrevista é obrigatória.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.interviewTime) {
      toast({
        title: "Campo obrigatório",
        description: "Horário da entrevista é obrigatório.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simular upload do arquivo (em um app real, faria upload para servidor/storage)
      let resumeUrl = "";
      if (selectedFile) {
        // Simular delay de upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        resumeUrl = URL.createObjectURL(selectedFile);
      }

      const candidateData = {
        ...formData,
        resumeUrl,
      };

      onAddCandidate(candidateData);

      toast({
        title: "Candidato cadastrado!",
        description: `${formData.name} foi adicionado à lista de entrevistas.`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        interviewDate: "",
        interviewTime: "",
      });
      setSelectedFile(null);

    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o candidato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col items-center max-w-2xl m-auto">
      {/* Header */}
      <div className="flex items-center w-full justify-between">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground text-right">Cadastrar Novo Candidato</h1>
          <p className="text-muted-foreground">Preencha os dados do candidato para a entrevista</p>
        </div>
      </div>

      {/* Form */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informações do Candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome completo */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite o nome completo do candidato"
                required
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Data da Entrevista *</Label>
                <Input
                  id="interviewDate"
                  name="interviewDate"
                  type="date"
                  value={formData.interviewDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewTime">Horário da Entrevista *</Label>
                <Input
                  id="interviewTime"
                  name="interviewTime"
                  type="time"
                  value={formData.interviewTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Upload de Currículo */}
            <div className="space-y-2">
              <Label>Currículo (PDF - máx. 5MB)</Label>
              {!selectedFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Apenas arquivos PDF são aceitos (máx. 5MB)
                  </p>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-4"
                  />
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Cadastrando..." : "Cadastrar Candidato"}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateForm;