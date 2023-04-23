import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useModalStore } from "~/stores/modalStore";

const useEnsurePremium = () => {
  const { data: session } = useSession();
  const modalStore = useModalStore();

  const ensurePremium = () => {
    if (!session?.user.premium) {
      toast.error("You must be a premium user to access this.");
      modalStore.setActiveModal("upsell");
      return false;
    }
    return true;
  };

  return { ensurePremium };
};

export default useEnsurePremium;
