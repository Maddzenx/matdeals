
import { useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

export const useProductNotifications = () => {
  const showNoProductsWarning = useCallback(() => {
    toast({
      title: "Inga produkter hittades",
      description: "Klicka på uppdatera för att hämta nya erbjudanden.",
      variant: "destructive"
    });
  }, []);

  const showFetchErrorNotification = useCallback((err: unknown) => {
    toast({
      title: "Fel vid hämtning av produkter",
      description: err instanceof Error ? err.message : 'Ett okänt fel inträffade',
      variant: "destructive"
    });
  }, []);

  return {
    showNoProductsWarning,
    showFetchErrorNotification
  };
};
