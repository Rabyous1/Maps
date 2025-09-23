import { axiosGetJson } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";

export const login = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.signin}`, body, {
        withCredentials: true,
      })
      .then((valid) => {
        console.log("successfulLogin");
        if (valid?.data) {
          resolve(valid.data);
        }
      })
      .catch((err) => {
        // if (err && err.response && err.response.data) {
        //   if (err.response.status === 401) console.log("incorrectPassword");
        //   if (err.response.status === 404) console.log("emailNotFound");
        //   if (err.response.status === 403) {
        //     if (err.response.data.message.includes("activate your account"))
        //       console.log("accountNotActivated");
        //     else console.log(err.response.data.message);
        //   }
        //   if (err.response.status === 500) console.log("Internal Server Error");
        // }
        console.error("Login error:", err);
        reject(err);
      });
  });
};

export const logout = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.logout}`, body)
      .then((response) => {
        if (response?.data) {
          console.log("Successful logout", response.data);
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch((err) => {
        console.error("Logout error:", err);
        reject(err); 
      });
  });
};

export const register = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.signup}`, body)
      .then((response) => {
        if (response?.data) {
          console.log("Successful signup", response.data);
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch((err) => {
        console.error("Registration error:", err);
        reject(err); 
      });
  });
};

export const forgotpassword = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.forgotpassword}`, body, {
        withCredentials: true,
      })
      .then((valid) => {
        if (valid?.data) {
          console.log("API Response Data: ", valid.data); 
          resolve(valid.data);
        }
      })
      .catch((err) => {
        console.error("Forgot password error:", err);
        reject(err); 
      });
  });
};

export const resetpassword = (body) => {
  return new Promise(async (resolve, reject) => {
    const { resetToken, ...passwordData } = body; 
    axiosGetJson
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.resetpassword}?token=${resetToken}`, 
        passwordData, 
        { withCredentials: true }
      )
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        }
      })
      .catch((err) => {
        console.error("Reset password error:", err);
        reject(err);
      });
  });
};

export const chooseRole = (role) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .patch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.chooseRole}`, 
        { role },
        { withCredentials: true }
      )
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

// ✅ NOUVELLE ROUTE : verifyOtp
export const verifyOtp = (body) => {
  return new Promise(async (resolve, reject) => {
    axiosGetJson
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.verifyOtp}`, body)
      .then((response) => {
        if (response?.data) {
          resolve(response.data);
        } else {
          reject(new Error("No data in response"));
        }
      })
      .catch((err) => {
        console.error("OTP verification error:", err);
        reject(err);
      });
  });
};



export const disableTwoFactor = () => {
  return axiosGetJson
    .post(`${process.env.NEXT_PUBLIC_API_URL}${API_URLS.auth.disable2FA}`, {}, {
      withCredentials: true,
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Disable 2FA error", err);
      throw err;
    });
};


