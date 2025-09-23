import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getAllUsers = (params) => {  
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.getAllUsers}`;

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
export const getMessagedUsers = (params) => {  
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.getMessagedUsers}`;
    axiosGetJson
      .get(url, { params })  
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
          console.log(response.data)
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getFrequentUsers = () => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.getTopFrequentUsers}`;
    axiosGetJson
      .get(url)
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

export const addUser = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.addUser}`, body)
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
export const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.deleteUser}/${id}`;

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
export const updateUser = (id, body) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.updateUser}/${id}`;

    axiosGetJson
      .put(url, body)
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
export const getUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.getUserById}/${id}`;

    axiosGetJson
      .get(url)
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

export const getCurrentUser = () => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.getCurrentUser}`;

    axiosGetJson
      .get(url, { withCredentials: true })
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
export const recoverUser = (id) => {
  return new Promise(async (resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.users.recoverUser}/${id}`;

    axiosGetJson
      .patch(url) // PATCH request for recovery
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