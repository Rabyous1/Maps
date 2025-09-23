import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getMyApplications = (params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.getMyApplications}`;
    // console.log('Request URL:', url);
    // console.log('Request Params:', params);

    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
    console.log(response.data);

          resolve(response.data);
        } else {
          reject(new Error('No data in response'));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
  export const deleteApplication = (id) => {
    return new Promise(async (resolve, reject) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.deleteApplication}/${id}`;
  
      axiosGetJson
        .delete(url)
        .then((response) => {
          if (response?.data) {
            console.log(response.data);
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