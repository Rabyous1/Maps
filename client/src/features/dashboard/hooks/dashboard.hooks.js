import { useQuery } from "react-query";
import { getDashboardData } from "../services/dashboard.services";

export function useDashboard(params, options = {}) {
  return useQuery(
    ["dashboard", params],
    () => getDashboardData(params),
    {
      staleTime: 1000 * 60 * 5,
      ...options,
    }
  );
}