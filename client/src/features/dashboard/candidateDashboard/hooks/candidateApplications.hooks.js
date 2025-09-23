import { useMutation, useQuery, useQueryClient } from "react-query";
import { deleteApplication, getMyApplications } from "../services/candidateApplications.services";

export function useMyApplications(params, options = {}) {
  return useQuery(
    ['my-applications', params],
    () => getMyApplications(params),
    {
      keepPreviousData: true,
      staleTime:        1000 * 60 * 5,
      ...options,            
    }
  );
}
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId) => deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries("my-applications");
    },
    onError: (err) => {
      console.log(err);
    },
  });
};