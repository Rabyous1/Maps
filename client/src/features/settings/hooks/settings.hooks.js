import { useAlert } from "@/context/AlertContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { confirmTwoFactor, deleteAccount, generateTwoFactorSetup, updatePassword } from "../services/settings.services";
import { useRouter } from 'next/navigation'; 


export const useUpdatePassword = () => {
    const queryClient = useQueryClient();
    const { openAlert } = useAlert();
    return useMutation({
      mutationFn: (body) => {
        return updatePassword(body); 
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries("password"); 
        openAlert(data?.message || "Registration successful!", "success");
      },
      onError: (err) => {
        console.log(err);
        openAlert(err?.response?.data?.message || "Something went wrong", "error");
      },
    });
  };
  
  export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    const { openAlert } = useAlert();
    const router = useRouter();
  
    return useMutation({
      mutationFn: deleteAccount,
      onSuccess: (data) => {
        queryClient.clear();
        openAlert(data?.message || 'Account deleted.', 'success');
        router.push('/login');
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || 'Account deletion failed';
        console.error('Account deletion error:', msg);
        openAlert(msg, 'error');
      },
    });
  };
  export const useGenerateTwoFactorSetup = () => {
    return useQuery(
      ['twoFactorQRCode'],
      generateTwoFactorSetup,
      {
        staleTime: Infinity,
        cacheTime: 5 * 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
      }
    );
  };
  export const useConfirmTwoFactor = (onSuccessClose) => {
    const queryClient = useQueryClient();
    const { openAlert } = useAlert();
  
    return useMutation(
      (data) => confirmTwoFactor(data),
      {
        onSuccess: (res) => {
          openAlert(res.message || '2FA enabled!', 'success');
          queryClient.invalidateQueries('accountSettings');
          if (typeof onSuccessClose === 'function') onSuccessClose();
        },
        onError: (err) => {
          openAlert(err.response?.data?.message || err.message || 'Invalid code', 'error');
        }
      }
    );
  };
  