import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
  QueryKey,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { appToast } from "@/components/alerts/Toasts";

interface OptimisticUpdate<TData, TVariables> {
  queryKey: QueryKey;
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
}

interface MutationCallbacks<TData, TError, TVariables, TContext> {
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
  toastSuccess?: { title: string; description?: string } | false;
  toastError?: { title: string; description?: string } | false;
  invalidates?: QueryKey[];
  optimisticUpdate?: OptimisticUpdate<TData, TVariables>;
}

type UseMutationReturn<
  TData,
  TError,
  TVariables,
  TContext,
> = UseMutationResult<TData, TError, TVariables, TContext>;

export function useMutationWithToast<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  callbacks?: MutationCallbacks<TData, TError, TVariables, TContext>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationReturn<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...options,
    onMutate: callbacks?.optimisticUpdate
      ? async (variables) => {
          const { queryKey, updateFn } = callbacks.optimisticUpdate!;

          await queryClient.cancelQueries({ queryKey });

          const previousData = queryClient.getQueryData<TData>(queryKey);

          queryClient.setQueryData<TData>(queryKey, (old) =>
            updateFn(old, variables)
          );

          return { previousData } as TContext;
        }
      : options?.onMutate,
    onSuccess: (data, variables, context) => {
      if (callbacks?.toastSuccess !== false && callbacks?.toastSuccess) {
        appToast.success(callbacks.toastSuccess);
      }

      if (callbacks?.invalidates) {
        callbacks.invalidates.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      callbacks?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (callbacks?.optimisticUpdate) {
        const { queryKey } = callbacks.optimisticUpdate;
        const previousData = (context as { previousData: TData })?.previousData;
        if (previousData !== undefined) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }

      if (callbacks?.toastError !== false && callbacks?.toastError) {
        appToast.error(callbacks.toastError);
      }

      callbacks?.onError?.(error, variables, context);
    },
    onSettled: () => {
      if (callbacks?.optimisticUpdate) {
        const { queryKey } = callbacks.optimisticUpdate;
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}