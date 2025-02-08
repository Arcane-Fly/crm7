import * as React from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

type Toast = ToastProps & {
  id: string;
};

type State = {
  toasts: Toast[];
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string): void => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout((): void => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

type Action =
  | {
      type: 'ADD_TOAST';
      toast: Toast;
    }
  | {
      type: 'UPDATE_TOAST';
      toast: Partial<ToastProps>;
      toastId: string;
    }
  | {
      type: 'DISMISS_TOAST';
      toastId?: string;
    }
  | {
      type: 'REMOVE_TOAST';
      toastId?: string;
    };

let memoryState: State = { toasts: [] };

const listeners = new Set<(state: State) => void>();

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (typeof toastId !== "undefined" && toastId !== null) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t } : t
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
}

function genId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useToast(): {
  toasts: Toast[];
  toast: (props: ToastProps) => {
    id: string;
    dismiss: () => void;
    update: (props: ToastProps) => void;
  };
  dismiss: (toastId?: string) => void;
} {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect((): () => void => {
    listeners.add(setState);
    return (): void => {
      listeners.delete(setState);
    };
  }, []);

  const addToast = (toast: Toast): void => {
    dispatch({ type: 'ADD_TOAST', toast });
  };

  const updateToast = (toast: Toast): void => {
    dispatch({ type: 'UPDATE_TOAST', toast });
  };

  const dismiss = (toastId?: string): void => {
    dispatch({ type: 'DISMISS_TOAST', toastId });
  };

  return {
    ...state,
    toast: (props: ToastProps): { id: string; dismiss: () => void; update: (props: ToastProps) => void; } => {
      const id = genId();

      const update = (props: ToastProps): void =>
        dispatch({
          type: 'UPDATE_TOAST',
          toast: props,
          toastId: id,
        });

      const dismiss = (): void => dispatch({ type: 'DISMISS_TOAST', toastId: id });

      addToast({
        ...props,
        id,
      });

      return {
        id,
        dismiss,
        update,
      };
    },
    dismiss,
  };
}

export const toast = (props: ToastProps): { id: string; dismiss: () => void; update: (props: ToastProps) => void; } => {
  const id = genId();

  const update = (props: ToastProps): void =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: props,
      toastId: id,
    });

  const dismiss = (): void => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
    },
  });

  return {
    id,
    dismiss,
    update,
  };
};

export { toast };
