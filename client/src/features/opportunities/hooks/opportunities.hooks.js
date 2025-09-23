import { useMutation, useQuery, useQueryClient } from 'react-query';
import { addOpportunityToFavorites, archiveOpportunity, createOpportunity, deleteOpportunity, getFavoriteOpportunities, getMyOpportunities, getOpportunityById, removeOpportunityFromFavorites, updateOpportunity } from '../services/opportunities.services';
import { useAlert } from '@/context/AlertContext';

export function useMyOpportunities(params, options = {}) {
  return useQuery(
    ['my-opportunities', params],
    () => getMyOpportunities(params),
    {
      keepPreviousData: true,
      staleTime:        1000 * 60 * 5,
      ...options,            
    }
  );
}

export function useOpportunityById(id) {
  return useQuery(
    ['opportunity', id],
    () => getOpportunityById(id),
    {
      enabled: !!id, 
      staleTime: 1000 * 60 * 5,
    }
  );
}
export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();
    const { openAlert } = useAlert();
  

  return useMutation({
    mutationFn: (opportunityId) => deleteOpportunity(opportunityId),
    onSuccess: (data) => {
      queryClient.invalidateQueries("my-opportunities");
      console.log(data.response);
      openAlert("Opportunity deleted successfully!", "success");

    },
    onError: (err) => {
      console.log(err);
      let message = "Failed to delete opportunity";

  if (err?.response?.data) {
    if (typeof err.response.data === "string") {
      message = err.response.data;
    } else if (typeof err.response.data === "object" && err.response.data.message) {
      message = err.response.data.message;
    } else {
      message = JSON.stringify(err.response.data);
    }
  } else if (err?.message) {
    message = err.message;
  }

  openAlert(message, "error");
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ id, values }) => updateOpportunity(id, values),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries("my-opportunities");
      queryClient.invalidateQueries(['opportunity', id]);
      openAlert("Opportunity updated successfully!", "success");

    },
    onError: (err) => {
      console.log(err);
      let message = "Failed to update opportunity";

  if (err?.response?.data) {
    if (typeof err.response.data === "string") {
      message = err.response.data;
    } else if (typeof err.response.data === "object" && err.response.data.message) {
      message = err.response.data.message;
    } else {
      message = JSON.stringify(err.response.data);
    }
  } else if (err?.message) {
    message = err.message;
  }

  openAlert(message, "error");
      
    },
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: (values) => createOpportunity(values),
    onSuccess: () => {
      queryClient.invalidateQueries("my-opportunities");
      openAlert("Opportunity created successfully!", "success");

    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: (id) => addOpportunityToFavorites(id),
    onSuccess: () => {
      queryClient.invalidateQueries("my-opportunities");
      queryClient.invalidateQueries("favorites");
      openAlert("Opportunity added in favorites successfully!", "success");

    },
    onError: (err) => {
      console.error('Failed to add to favorites:', err);
    },
  });
};
export const useFavoriteOpportunities = (params = {}, options = {}) => {
  return useQuery(
    ['favorites', params],
    () => getFavoriteOpportunities(params),
    {
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
      ...options,
    }
  );
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation(removeOpportunityFromFavorites, {
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      openAlert("Opportunity is removed from favorites!");

    },
  });
};

export const useArchiveOpportunity = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ id, isArchived }) => archiveOpportunity(id, isArchived),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries("my-opportunities");
      queryClient.invalidateQueries(["opportunity", id]);
      openAlert("Opportunity is updated!");
    },
    onError: (err) => {
      console.error('Failed to archive opportunity:', err);
    },
  });
};