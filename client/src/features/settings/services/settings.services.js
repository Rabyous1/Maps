import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const deleteAccount = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .delete(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.settings.deleteAccount}`, body,
      {
        withCredentials: true,
      })
      .then((valid) => {
        if (valid?.data) {
          resolve(valid.data);
        }
      })
      .catch((err) => {
        reject(err); 
      });
  });
};
export const updatePassword = (body) => {
    return new Promise(async (resolve, reject) => {
      axiosGetJson
        .put(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.settings.updatePassword}`, body)
        .then((response) => {
          if (response?.data) {
            resolve(response.data);
          } else {
            reject(new Error("No data in response"));
          }
        })
        .catch((err) => {
          console.error("Update password  error:", err);
          reject(err); 
        });
    });
  };
  export const generateTwoFactorSetup = () => {
    return new Promise(async (resolve, reject) => {
      axiosGetJson
        .get(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.account.generateTwoFactorSetup}`)
        .then((response) => {
          if (response?.data) {
            console.log(response.data);
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
  export const confirmTwoFactor = (body) => {
    return new Promise((resolve, reject) => {
      axiosGetJson
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.account.confirmTwoFactor}`,
          body,
          { withCredentials: true }
        )
        .then((resp) => {
          if (resp.data) resolve(resp.data);
          else reject(new Error('No data in response'));
        })
        .catch((err) => reject(err));
    });
  };