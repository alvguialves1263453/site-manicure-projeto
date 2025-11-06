import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "./ui/aspect-ratio";

const Gallery = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public-gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["gallery"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="galeria" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Galeria</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Nossos <span className="text-primary italic">trabalhos</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Veja alguns dos nossos trabalhos realizados com dedicação e carinho
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <AspectRatio ratio={1}>
                  <div className="w-full h-full bg-muted rounded-lg"></div>
                </AspectRatio>
              </div>
            ))}
          </div>
        ) : galleryItems && galleryItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg shadow-elegant hover:shadow-hover transition-all duration-300"
              >
                <AspectRatio ratio={1}>
                  <img
                    src={item.image_url}
                    alt={item.title || "Trabalho realizado"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 sm:p-4 md:p-6 text-primary-foreground">
                        <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm mt-1 text-primary-foreground/90">{item.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </AspectRatio>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Em breve nossos trabalhos estarão aqui!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
