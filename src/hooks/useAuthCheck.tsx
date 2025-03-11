
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthCheck = () => {
  useEffect(() => {
    // Check if the user is logged in when the component mounts
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      console.log("Current user:", data.user);
    };
    
    checkUser();
  }, []);
};
