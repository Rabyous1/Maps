import { useMutation, useQuery, useQueryClient } from "react-query";
import { getCandidatesList, getCandidatesListRec, getJobsWithApplications, getMyApplications, updateApplicationStatus, updateInterestStatus } from "../services/applications.services";
import { useAlert } from "@/context/AlertContext";

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
export function useCandidatesList(opportunityId, params, options = {}) {
  return useQuery(
    ['candidates-list', opportunityId, params],
    () => getCandidatesList(opportunityId, params),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      ...options,
    }
  );
}
export const useUpdateInterestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, interest }) => updateInterestStatus(applicationId, interest),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries(["candidates-list"]);
    },
    onError: (error) => {
      console.error("Error updating interest status:", error);
    },
  });
};
export const useCandidatesListRec = ({
  page = 1,
  pageSize = 10,
  search = '',
} = {}) => {
  console.log('[useCandidatesList] params ->', { page, pageSize, search });

  return useQuery(
    ['candidates-list', page, pageSize, search],
    () =>
      getCandidatesListRec({
        pageNumber: page,
        pageSize,
        ...(search ? { search } : {}),
      }),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );
};
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ applicationId, status }) => updateApplicationStatus(applicationId, status),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries(["candidates-list"]);
      openAlert("Application status updated successfully", "success");
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update application status";

      openAlert(message, "error");
    },
  });
};
export function useJobsWithApplications(page = 1, pageSize = 5, filters = {}) {
  return useQuery(
    ["jobsWithApps", page, pageSize, filters],
    () =>
      getJobsWithApplications({
        pageNumber: page,
        pageSize,
        ...filters,
      }),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    }
  );
}