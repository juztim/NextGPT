import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const useEnsurePremium = () => {
  const { data: session } = useSession();

  const ensurePremium = () => {
    if (!session?.user.premium) {
      toast.error("You must be a premium user to access this.");
      return false;
    }
    return true;
  };

  return { ensurePremium };
};

export default useEnsurePremium;
