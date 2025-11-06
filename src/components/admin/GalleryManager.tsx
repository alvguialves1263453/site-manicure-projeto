import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Camera, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const GalleryManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
  });

  useEffect(() => {
    const channel = supabase
      .channel('gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
          queryClient.invalidateQueries({ queryKey: ["gallery"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: gallery, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addImage = useMutation({
    mutationFn: async () => {
      if (!formData.image) throw new Error("Selecione uma imagem");

      setUploading(true);
      const imageUrl = await uploadImage(formData.image);

      const { error } = await supabase.from("gallery").insert({
        image_url: imageUrl,
        title: formData.title,
        description: formData.description,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Imagem adicionada à galeria!");
      setFormData({ title: "", description: "", image: null });
      setIsDialogOpen(false);
      setUploading(false);
    },
    onError: () => {
      setUploading(false);
      toast.error("Erro ao adicionar imagem");
    },
  });

  const deleteImage = useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
      // Delete from storage
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("gallery").remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Imagem excluída!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addImage.mutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Galeria</CardTitle>
          <CardDescription>Adicione ou remova fotos da galeria</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero">
              <Plus className="mr-2 h-4 w-4" />
              Nova Foto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Foto à Galeria</DialogTitle>
              <DialogDescription>
                Faça upload de uma nova foto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label>Selecione a Imagem *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      id="camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image: e.target.files?.[0] || null,
                        })
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-2"
                      onClick={() => document.getElementById("camera")?.click()}
                    >
                      <Camera className="h-8 w-8" />
                      <span className="text-sm">Tirar Foto</span>
                    </Button>
                  </div>
                  <div>
                    <Input
                      id="gallery"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image: e.target.files?.[0] || null,
                        })
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-2"
                      onClick={() => document.getElementById("gallery")?.click()}
                    >
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Escolher da Galeria</span>
                    </Button>
                  </div>
                </div>
                {formData.image && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {formData.image.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Unhas decoradas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({ title: "", description: "", image: null });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-hero" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Enviando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : !gallery || gallery.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma foto na galeria
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="relative group">
                <AspectRatio ratio={1}>
                  <img
                    src={item.image_url}
                    alt={item.title || "Galeria"}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        deleteImage.mutate({ id: item.id, imageUrl: item.image_url })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </AspectRatio>
                {item.title && (
                  <p className="mt-2 text-sm font-medium">{item.title}</p>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GalleryManager;
