import { useMutation, useQuery, useQueryClient } from "react-query";
import { getAccount, updateAccount, updatePassword,completeAccount, revealFiscalNumber } from "../services/account.services";
import { useAlert } from "@/context/AlertContext";

// export const useAccount = () => {
//   const queryClient = useQueryClient();
//   const { openAlert } = useAlert();

//   return useMutation({
//     mutationFn: () => {
//       return getAccount();
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries("account");
//       openAlert(data?.message || "Fetched account successfully!", "success");
//     },
//     onError: (err) => {
//       openAlert(err?.response?.data?.message || "Something went wrong", "error");
//     },
//   });
// };
export const useAccount = () => {
  const { openAlert } = useAlert();

  return useQuery(
    "account",
    async () => {
      return await getAccount();
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: (err) => {
        openAlert(
          err?.response?.data?.message || err.message || "Something went wrong",
          "error"
        );
      },
    }
  );
};
export const useRevealFiscal = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ password }) => revealFiscalNumber(password),
    onError: (err) => {
      const message =
    err?.response?.data?.message ||
    err?.response?.data ||          
    err?.message ||                
    "Failed to reveal fiscal number";

  openAlert(message, "error");
    },
    onSuccess: (fiscalNumber, variables) => {
      queryClient.setQueryData("account", (old) => ({
        ...old,
        fiscalNumber,
      }));
      openAlert("Fiscal number revealed successfully!", "success");
    },
  });
};
// export const useUpdateAccount = () => {
//   const queryClient = useQueryClient();
//   const { openAlert } = useAlert();

//   return useMutation({
//     mutationFn: ({ values }) => updateAccount(values),
//     onMutate: async ({ values }) => {
//       await queryClient.cancelQueries("account");
//       const previousAccount = queryClient.getQueryData("account");
//       queryClient.setQueryData("account", old => ({
//         ...old,
//         ...values,
//       }));
//       return { previousAccount };
//     },
//     onError: (err, _vars, context) => {
//       if (context?.previousAccount) {
//         queryClient.setQueryData("account", context.previousAccount);
//       }
//       openAlert(err?.response?.data?.message || "Something went wrong", "error");
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries("account");
//       queryClient.invalidateQueries(['currentUser']);
//       openAlert(data?.message || "Account updated successfully!", "success");
//     },
//   });
// };

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({

    mutationFn: ({ sectionKey, values }) => updateAccount({ section: sectionKey, ...values }),

    onMutate: async ({ sectionKey, values }) => {
      await queryClient.cancelQueries("account");
      const previousAccount = queryClient.getQueryData("account");

      queryClient.setQueryData("account", (old = {}) => {
        if (!sectionKey) {
          return { ...old, ...values };
        }
        return {
          ...old,
          [sectionKey]: {
            ...(old?.[sectionKey] || {}),
            ...values,
          },
        };
      });

      return { previousAccount };
    },

    onError: (err, _vars, context) => {
      if (context?.previousAccount) {
        queryClient.setQueryData("account", context.previousAccount);
      }
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries("account");
      queryClient.invalidateQueries(["currentUser"]);
      openAlert(data?.message || "Account updated successfully!", "success");
    },
  });
};

export const useCompleteAccount = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ values }) => completeAccount(values),
    onMutate: async ({ values }) => {
      await queryClient.cancelQueries("account");
      const previousAccount = queryClient.getQueryData("account");
      queryClient.setQueryData("account", old => ({
        ...old,
        ...values,
      }));
      return { previousAccount };
    },
    onError: (err, _vars, context) => {
      if (context?.previousAccount) {
        queryClient.setQueryData("account", context.previousAccount);
      }
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("account");
      openAlert(data?.message || "Account completed successfully!", "success");
    },
  });
};




