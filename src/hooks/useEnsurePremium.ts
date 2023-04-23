import { useSession } from "next-auth/react";
import { useModalStore } from "~/stores/modalStore";

const useEnsurePremium = () => {
  const { data: session } = useSession();
  const modalStore = useModalStore();

  const ensurePremium = () => {
    if (!session?.user.premium) {
      modalStore.setActiveModal("upsell");
      return false;
    }
    return true;
  };

  return { ensurePremium };
};

export default useEnsurePremium;
