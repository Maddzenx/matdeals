
import { toast } from "@/components/ui/use-toast";

export const showNoIcaProductsWarning = () => {
  console.warn("No ICA products found in database. Check if scraping was successful.");
  toast({
    title: "Inga ICA-produkter",
    description: "Kunde inte hitta några ICA-produkter i databasen. Försök uppdatera genom att trycka på uppdateringsknappen.",
    variant: "destructive"
  });
};

export const showFetchErrorNotification = (error: any) => {
  console.error('Error fetching products from Supabase:', error);
  
  toast({
    title: "Fel vid laddning av produkter",
    description: "Kunde inte ladda produkter från Supabase. Försök igen senare.",
    variant: "destructive"
  });
};
