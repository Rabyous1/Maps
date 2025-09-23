import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAlert } from "@/context/AlertContext";
import { addInterview, deleteInterview, getAllInterviews, getInterviewById, getListInterviewsCandidate, updateInterview } from "../services/videoChat.services";

export const useAllInterviews = ({ page = 1, pageSize = 20 } = {}) => {
  return useQuery(
    ["interviews", page, pageSize],
    () => getAllInterviews({ page, pageSize }),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );
};

export const useAddInterview = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: (body) => addInterview(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries("interviews");
      openAlert(data?.message || "Interview created successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Failed to create interview", "error");
    },
  });
};

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: (id) => deleteInterview(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries("interviews");
      openAlert(data?.message || "Interview deleted successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Failed to delete interview", "error");
    },
  });
};
export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ id, ...body }) => updateInterview(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries("interviews");
      openAlert(data?.message || "Interview updated successfully!", "success");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Failed to update interview", "error");
    },
  });
};
export const useGetInterviewById = (id, options = {}) => {
  return useQuery({
    queryKey: ["interview", id],
    queryFn: () => getInterviewById(id),
    enabled: !!id,
    ...options,
  });
};
export const useListInterviewsCandidate = ({ pageNumber = 1, pageSize = 5 } = {}) => {
  return useQuery(
    ["interviewsCandidate", pageNumber, pageSize],
    () => getListInterviewsCandidate({ pageNumber, pageSize }),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );
};