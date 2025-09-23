import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getDashboardData = (params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.dashboard.getDashboard}`;
    console.log("Request URL:", url);
    console.log("Request Params:", params);

    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
