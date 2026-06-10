import { useEffect } from "react";
import { toast } from "sonner";

type ActionToastState = {
  ok: boolean;
  message: string;
};

export function useActionToast<TState extends ActionToastState>(state: TState, getMessage?: (state: TState) => string) {
  useEffect(() => {
    if (!state.message) return;

    const message = getMessage ? getMessage(state) : state.message;

    if (state.ok) {
      toast.success(message);
      return;
    }

    toast.error(message);
  }, [state, getMessage]);
}
