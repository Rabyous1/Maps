import {axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const getAccount = () => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .get(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.account.getAccount}`)
      .then((response) => {
        if (response?.data) {
          console.log("account2", response.data)
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch((err) => {
        console.error("Get account error:", err);
        reject(err); 
      });
  });
};
export const revealFiscalNumber = (password) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.account.revealFiscal}`, { password }, { withCredentials: true })
      .then((response) => {
        if (response?.data?.fiscalNumber) {
          resolve(response.data.fiscalNumber);
        } else {
          reject(new Error(response?.data?.message || "Failed to reveal fiscal number"));
        }
      })
      .catch((err) => {
        console.error("Reveal fiscal number error:", err);
        reject(err);
      });
  });
};
export const updateAccount = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .put(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.account.updateAccount}`, body)
      .then((response) => {
        if (response?.data) {
          if (response.data.updated) {
            resolve(response.data);
          } else {
            reject(new Error("No changes were made."));
          }
        } else {
          reject(new Error("No data in response."));
        }
      })
      .catch((err) => {
        console.error("Update account error:", err);
        reject(err); 
      });
  });
};

export const completeAccount = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .patch(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.settings.completeAccount}`, body)
      .then((response) => {
        if (response?.data) {
          if (response.data.updated) {
            resolve(response.data);
          } else {
            reject(new Error("No changes were made."));
          }
        } else {
          reject(new Error("No data in response."));
        }
      })
      .catch((err) => {
        console.error("Complete account error:", err);
        reject(err); 
      });
  });
};


