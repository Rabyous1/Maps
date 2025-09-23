import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAlert } from "@/context/AlertContext";
import { addUser, deleteUser, getAllUsers, getCurrentUser, getFrequentUsers, getMessagedUsers, getUserById, recoverUser, updateUser } from "../services/users.services";

export const useAllUsers = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ page, pageSize }) => {
      return getAllUsers({ page, pageSize });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("users");
      openAlert(data?.message || "Fetched account successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },
  });
};

// export const useMessagedUsers = ({
//   page = 1,
//   pageSize = 20,
//   search = '',
// } = {}) => {
//    console.log('[useMessagedUsers] params ->', { page, pageSize, search });
//   return useQuery(
//     ['messagedusers', page, pageSize, search],
//     () => getMessagedUsers({  
//       page,
//       pageSize,
//       ...(search ? { search } : {} ),
      
//     }),
    
//     {
//       keepPreviousData: true,
//       staleTime: 1000 * 60, 
//     }
//   );
// };
export const useMessagedUsers = ({
  page = 1,
  pageSize = 20,
  search = '',
} = {}) => {
  console.log('[useMessagedUsers] params ->', { page, pageSize, search });

  return useQuery(
    ['messagedusers', page, pageSize, search],
    () =>
      getMessagedUsers({
        pageNumber: page,
        pageSize,
        ...(search ? { search } : {}),
      }),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );
};




export const useFrequentUsers = () => {
  return useQuery(
    ['frequentUsers'],
    () => getFrequentUsers(),
    {
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      keepPreviousData: true,
    }
  );
};
export const useAddser = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();
  return useMutation({
    mutationFn: (body) => addUser(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries("users"); 
      openAlert(data?.message || "User added successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },
  });
};
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: (userId) => deleteUser(userId), 
    onSuccess: (data) => {
      queryClient.invalidateQueries("users");  
      openAlert(data?.message || "User deleted successfully!", "success");  
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Failed to delete user.", "error");  
    },
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ id, values }) => updateUser(id, values),
    onSuccess: (data) => {
      queryClient.invalidateQueries("users");
      openAlert(data?.message || "User updated successfully!", "success");
    },
   onError: (err) => {
  const fallbackMessage = "Failed to update user.";

  const errorMessage =
    err?.response?.data?.message || //normal error
    (Array.isArray(err?.response?.data) ? `Error: ${err.response.data[0]}.` : null) ||
    err?.message || //axios error
    fallbackMessage;

  openAlert(errorMessage, "error");
}

  });
};

export const useUserById = (id) => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: () => getUserById(id), 
    onSuccess: (data) => {
      queryClient.invalidateQueries("account");
      openAlert(data?.message || "Fetched account successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
    staleTime: parseInt(process.env.NEXT_PUBLIC_STALE_TIME),
    retry: false,
  });
};
export const useRecoverUser = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: (userId) => recoverUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries("users"); 
      openAlert(data?.message || "User recovered successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Failed to recover user.", "error");
    },
  });
};