import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MessageCircle, Trash2, Phone, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AppointmentsManager = () => {
  const queryClient = useQueryClient();
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          services (name, duration_minutes)
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Status atualizado com sucesso!");
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Agendamento excluído!");
    },
  });

  const sendWhatsApp = (phone: string, name: string, date: string, time: string) => {
    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
    const message = `Olá ${name}! Confirmando seu agendamento para ${formattedDate} às ${time}. Aguardamos você! 💅`;
    const url = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmado", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Finalizado", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    };

    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Agendamentos</CardTitle>
        <CardDescription>
          Visualize e gerencie todos os agendamentos das clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum agendamento encontrado
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment: any) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.client_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {appointment.client_phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.services?.name || "N/A"}
                        <div className="text-xs text-muted-foreground">
                          {appointment.services?.duration_minutes}min
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.appointment_date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{appointment.appointment_time}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {appointment.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                sendWhatsApp(
                                  appointment.client_phone,
                                  appointment.client_name,
                                  appointment.appointment_date,
                                  appointment.appointment_time
                                )
                              }
                              title="Enviar mensagem no WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {appointment.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: appointment.id,
                                  status: "completed",
                                })
                              }
                              title="Finalizar atendimento"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {appointment.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: appointment.id,
                                  status: "cancelled",
                                })
                              }
                              title="Cancelar"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAppointment.mutate(appointment.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Collapsible View */}
            <div className="md:hidden space-y-3">
              {/* Overlay */}
              {openItems.length > 0 && (
                <div
                  className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
                  onClick={() => setOpenItems([])}
                />
              )}

              {appointments.map((appointment: any) => {
                const isOpen = openItems.includes(appointment.id);
                return (
                  <Collapsible
                    key={appointment.id}
                    open={isOpen}
                    onOpenChange={() => toggleItem(appointment.id)}
                  >
                    <div
                      className={`relative border rounded-lg transition-all duration-200 ${
                        isOpen ? "z-50 shadow-2xl bg-card" : "bg-card/50"
                      }`}
                    >
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-accent/50 rounded-lg transition-colors">
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-base">{appointment.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointment_date + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
                            {appointment.appointment_time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(appointment.status)}
                          <ChevronDown
                            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="animate-accordion-down">
                        <div className="px-4 pb-4 space-y-4 border-t pt-4">
                          {/* Info */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{appointment.client_phone}</span>
                            </div>
                            <div>
                              <p className="font-medium">{appointment.services?.name || "N/A"}</p>
                              <p className="text-muted-foreground">
                                Duração: {appointment.services?.duration_minutes}min
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            {appointment.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  sendWhatsApp(
                                    appointment.client_phone,
                                    appointment.client_name,
                                    appointment.appointment_date,
                                    appointment.appointment_time
                                  )
                                }
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                WhatsApp
                              </Button>
                            )}
                            {appointment.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: appointment.id,
                                    status: "completed",
                                  })
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                Finalizar
                              </Button>
                            )}
                            {appointment.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: appointment.id,
                                    status: "cancelled",
                                  })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                Cancelar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full col-span-2"
                              onClick={() => deleteAppointment.mutate(appointment.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Agendamento
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsManager;
