import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Booking = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('booking-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["services"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: bookedSlots } = useQuery({
    queryKey: ["booked-slots", formData.appointmentDate],
    queryFn: async () => {
      if (!formData.appointmentDate) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("appointment_date", formData.appointmentDate)
        .in("status", ["pending", "confirmed"]);
      if (error) throw error;
      // Normalize time to HH:MM since DB returns HH:MM:SS
      return (data || []).map((item: { appointment_time: string }) =>
        typeof item.appointment_time === "string"
          ? item.appointment_time.slice(0, 5)
          : (item as any).appointment_time
      );
    },
    enabled: !!formData.appointmentDate,
  });

  const createAppointment = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Prevent double booking: check if slot is already taken (pending/confirmed)
      const { data: conflict, error: conflictError } = await supabase
        .from("appointments")
        .select("id")
        .eq("appointment_date", data.appointmentDate)
        .eq("appointment_time", data.appointmentTime)
        .in("status", ["pending", "confirmed"])
        .limit(1);

      if (conflictError) throw conflictError;
      if (conflict && conflict.length > 0) {
        throw new Error("HORARIO_OCUPADO");
      }

      const { error } = await supabase.from("appointments").insert({
        client_name: data.clientName,
        client_phone: data.clientPhone,
        service_id: data.serviceId,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        notes: data.notes,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      // Refresh only the selected date cache
      queryClient.invalidateQueries({ queryKey: ["booked-slots", variables.appointmentDate] });
      setBookingSuccess(true);
      toast.success("Agendamento realizado com sucesso!");
    },
    onError: (error: any) => {
      if (error?.message === "HORARIO_OCUPADO" || String(error?.message).toLowerCase().includes("duplicate")) {
        toast.error("Esse horário já está reservado para essa data. Escolha outro horário.");
      } else {
        toast.error("Erro ao realizar agendamento. Tente novamente.");
      }
    },
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientPhone || !formData.serviceId || 
        !formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    createAppointment.mutate(formData);
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
      <div className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <Card className="max-w-2xl mx-auto text-center shadow-elegant">
            <CardHeader className="space-y-3 sm:space-y-4">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-serif px-4">Agendamento Confirmado!</CardTitle>
              <CardDescription className="text-base sm:text-lg px-4">
                Seu horário foi reservado com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="p-4 sm:p-6 bg-muted rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-semibold break-words">{formData.clientName}</p>
                
                <p className="text-sm text-muted-foreground mt-4">Telefone</p>
                <p className="font-semibold">{formData.clientPhone}</p>
                
                <p className="text-sm text-muted-foreground mt-4">Data e Horário</p>
                <p className="font-semibold">
                  {new Date(formData.appointmentDate + "T00:00:00").toLocaleDateString("pt-BR")} às {formData.appointmentTime}
                </p>
              </div>
              
              <p className="text-muted-foreground text-sm sm:text-base px-2">
                Entraremos em contato em breve para confirmar seu agendamento.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button onClick={() => setBookingSuccess(false)} variant="outline" className="w-full sm:w-auto">
                  Fazer Outro Agendamento
                </Button>
                <Button asChild className="w-full sm:w-auto bg-gradient-hero">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>

            <Card className="shadow-elegant">
              <CardHeader className="space-y-2 sm:space-y-3">
                <CardTitle className="text-2xl sm:text-3xl font-serif">Agendar Horário</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Preencha os dados abaixo para realizar seu agendamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Seu nome"
                      className="text-sm sm:text-base h-10 sm:h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm sm:text-base">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="text-sm sm:text-base h-10 sm:h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-sm sm:text-base">Serviço *</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                    >
                      <SelectTrigger className="text-sm sm:text-base h-10 sm:h-11">
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id} className="text-sm sm:text-base">
                            {service.name}
                            {service.price && ` - R$ ${Number(service.price).toFixed(2)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm sm:text-base">Data *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm sm:text-base h-10 sm:h-11",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-popover" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              if (date) {
                                const formatted = format(date, "yyyy-MM-dd");
                                setFormData({ ...formData, appointmentDate: formatted });
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            locale={ptBR}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horário *
                      </Label>
                      {!formData.appointmentDate && (
                        <p className="text-sm text-muted-foreground">Selecione uma data primeiro</p>
                      )}
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                        {timeSlots.map((time) => {
                          const isBooked = bookedSlots?.includes(time);
                          const isSelected = formData.appointmentTime === time;
                          return (
                            <Button
                              key={time}
                              type="button"
                              variant={isSelected && !isBooked ? "default" : "outline"}
                              disabled={!formData.appointmentDate || isBooked}
                              onClick={() => setFormData({ ...formData, appointmentTime: time })}
                              className={cn(
                                "h-auto py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200",
                                isSelected && !isBooked && "bg-gradient-hero shadow-elegant scale-105",
                                isBooked && "bg-unavailable border-unavailable-border text-unavailable-foreground cursor-not-allowed opacity-60 hover:bg-unavailable",
                                !isBooked && !isSelected && "hover:border-primary hover:shadow-md hover:scale-105"
                              )}
                            >
                              <span className="font-semibold text-sm sm:text-base">{time}</span>
                              {isBooked && (
                                <span className="text-xs">Indisponível</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm sm:text-base">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Alguma observação especial?"
                      rows={3}
                      className="text-sm sm:text-base resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero hover:opacity-90 shadow-elegant text-sm sm:text-base py-5 sm:py-6"
                    disabled={createAppointment.isPending}
                  >
                    {createAppointment.isPending ? "Agendando..." : "Confirmar Agendamento"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
