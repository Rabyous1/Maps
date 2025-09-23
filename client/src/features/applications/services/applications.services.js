import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getMyApplications = (params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.getAllApplications}`;
    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
            console.log(response.data)
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
// export const getCandidatesList = (opportunityId, params) => {
//   return new Promise(async (resolve, reject) => {
//     const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.getCandidatesList}/${opportunityId}/candidates`;

//     axiosGetJson
//       .get(url, { params })
//       .then((response) => {
//         if (response?.data) {
//           console.log(response.data, "testtttt");
//           resolve(response.data);
//         } else {
//           reject(new Error('No data in response'));
//         }
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };
export const getCandidatesList = (opportunityId, params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.getCandidatesList}/${opportunityId}/candidates`;
    console.log("Fetching candidates from URL:", url); // Log the URL

    axiosGetJson
      .get(url, { params })
      .then((response) => {
        console.log("API Response:", response); // Log the entire response
        if (response?.data) {
          console.log(response.data, "testtttt");
          resolve(response.data);
        } else {
          reject(new Error('No data in response'));
        }
      })
      .catch((err) => {
        console.error("Error fetching candidates:", err); // Log the error
        reject(err);
      });
  });
};

export const updateInterestStatus = (applicationId, interest) => {
  console.log("Updating interest for applicationId:", applicationId, "with value:", interest);
  return new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.updateInterestStatus}/${applicationId}/interest`;

    axiosGetJson
      .put(url, { interest })
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
export const getCandidatesListRec = (params = {}) => {
  console.log('[getCandidatesList] params ->', params);

  return new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.getCandidatesList}/list`;

    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
          console.log('[getCandidatesList] response ->', response.data);
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
export const updateApplicationStatus = (applicationId, status) => {
  return new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.updateApplicationStatus}/${applicationId}/updatestatus`;

    axiosGetJson
      .put(url, { status })
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
export const getJobsWithApplications = (params = {}) => {
  return new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.applications.getAllApplications}`;
    axiosGetJson
      .get(url, { params })
      .then((response) => {
  console.log(response?.data);

        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch(reject);
  });
};
