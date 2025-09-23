import { useMutation, useQueryClient } from "react-query";
import {
  chooseRole,
  disableTwoFactor,
  forgotpassword,
  getTwoFactorStatus,
  login,
  logout,
  register,
  resetpassword,
  verifyOtp, // <-- import ajouté ici
} from "../services/auth.services";
import { useAlert } from "@/context/AlertContext";
import { useAppRouter } from "@/helpers/redirections";


export const useLogin = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      queryClient.invalidateQueries(["currentUser"]);
      queryClient.invalidateQueries("account");
    },
    onError: (err) => {
      console.log(err);
      let message = "Failed to login";

  if (err?.response?.data) {
    if (typeof err.response.data === "string") {
      message = err.response.data;
    } else if (typeof err.response.data === "object" && err.response.data.message) {
      message = err.response.data.message;
    } else {
      message = JSON.stringify(err.response.data);
    }
  } else if (err?.message) {
    message = err.message;
  }

        openAlert(message, "error");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries("user");
    },
    onError: (err) => {
      console.error("Logout error", err);
      openAlert(err?.response?.data?.message || "Logout failed", "error");
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();
  const { pushChooseRole } = useAppRouter();
  const loginMutation = useLogin();

  return useMutation({
    mutationFn: async (values) => {
      // Appel à register
      const registerData = await register(values);

      // Appel à login automatiquement
      const loginData = await login({
        email: values.email,
        password: values.password,
      });

      return loginData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("user");
      queryClient.invalidateQueries("currentUser");
      queryClient.invalidateQueries("account");
      openAlert("Compte créé et connecté avec succès !", "success");
      pushChooseRole();
    },
    onError: (err) => {
      console.error("Signup error", err);
      openAlert(
        err?.response?.data?.message || "Erreur lors de l'inscription",
        "error"
      );
    },
  });
};


export const useForgotPassword = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: forgotpassword,
    onSuccess: (data) => {
      queryClient.invalidateQueries("forgotpassword");
      openAlert(data?.message || "Mail sent successfully!", "success");
    },
    onError: (err) => {
      console.log(err?.response?.data?.message);
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: resetpassword,
    onSuccess: (data) => {
      queryClient.invalidateQueries("resetpassword");
      openAlert(data?.message || "Password reset successfully!", "success");
    },
    onError: (err) => {
      console.log(err?.response?.data?.message);
      openAlert(err?.response?.data?.message || "Something went wrong", "error");
    },
  });
};

export const useChooseRole = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: chooseRole,
    onSuccess: (data) => {
      queryClient.invalidateQueries("user");
      queryClient.invalidateQueries("currentUser");
      queryClient.invalidateQueries("account");
      openAlert(data?.message || "Role updated successfully!", "success");
    },
    onError: (error) => {
      console.error("Choose role error", error);
      openAlert(error?.response?.data?.message || "Failed to update role.", "error");
    },
  });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      queryClient.invalidateQueries("user");
      queryClient.invalidateQueries("currentUser");
      openAlert(data?.message || "OTP vérifié avec succès !", "success");
    },
    onError: (error) => {
      console.error("OTP verification error", error);
      openAlert(error?.response?.data?.message || "Échec de la vérification du code", "error");
    },
  });
};




export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: (data) => {
      openAlert(data?.message || "2FA disabled successfully!", "success");
      queryClient.invalidateQueries("twoFactorStatus");
    },
    onError: (err) => {
      openAlert(err?.response?.data?.message || "Failed to disable 2FA", "error");
    },
  });
};

