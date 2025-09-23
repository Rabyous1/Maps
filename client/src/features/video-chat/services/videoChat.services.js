import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getAllInterviews = (params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.interviews.getAllInterviews}`;
    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};

export const addInterview = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.interviews.addInterview}`, body)
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};

export const deleteInterview = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.interviews.deleteInterview}/${id}`;
    axiosGetJson
      .delete(url)
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};

export const updateInterview = (id, body) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.interviews.updateInterview}/${id}`;
    axiosGetJson
      .patch(url, body)
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};
export const getInterviewById = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.interviews.getInterview}/${id}`;
    axiosGetJson
      .get(url)
      .then((response) => {
        console.log(response.data, "details")
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};

export const getListInterviewsCandidate = (params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.interviews.getListInterviewsCandidate}`;
    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};