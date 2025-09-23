import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getMyOpportunities = (params) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.getMyOpportunities}`;
    axiosGetJson
      .get(url, { params })
      .then((response) => {
        if (response?.data) {
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

  export const getOpportunityById = (id) => {
    return new Promise(async (resolve, reject) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.getById}/${id}`;
  
      axiosGetJson
        .get(url)
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
  
  export const deleteOpportunity = (id) => {
    return new Promise(async (resolve, reject) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.deleteOpportunity}/${id}`;
  
      axiosGetJson
        .delete(url)
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

  export const updateOpportunity = (id, body) => {
    return new Promise(async (resolve, reject) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.updateOpportunity}/${id}`;
  
      axiosGetJson
        .put(url,body)
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
  export const createOpportunity = (body) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.create}`;
    axiosGetJson
      .post(url, body, { withCredentials: true })
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
export const addOpportunityToFavorites = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.favorite}/${id}/favorite`;

    axiosGetJson
      .post(url, {}, { withCredentials: true })
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
export const getFavoriteOpportunities = (params = {}) => {  
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.favorites}`;

    axiosGetJson
      .get(url,{ params, withCredentials: true })  
      .then((response) => {
        console.log(response.data)
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
export const removeOpportunityFromFavorites = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.favorite}/${id}/favorite`;

    axiosGetJson
      .delete(url, { withCredentials: true })
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
export const archiveOpportunity = (id,isArchived) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.opportunities.archive}/${id}/archive`;

    axiosGetJson
      .patch(url,{ isArchived },{withCredentials: true })
      .then((response) => {
        if (response?.data) {
          console.log(response.data)
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