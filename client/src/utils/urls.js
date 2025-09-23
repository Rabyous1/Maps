import { Files } from "lucide-react";

export const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

export const API_URLS = {
  auth: {
    signin: `/auth/signin`,
    signup: `/auth/signup`,
    logout: `/auth/logout`,
    signinmicrosoft: `/auth/microsoft`,
    signinlinkedin: `/auth/linkedin`,
    signingoogle: `/auth/google`,
    forgotpassword: `/auth/forgot-password`,
    resetpassword : `/auth/reset-password`,
    confirmpassword : `/confirm-account/:token`,
    chooseRole: `/auth/choose-role`,
    verifyOtp:"/auth/2fa/verify",
    disable2FA: "/auth/2fa/disable",
    status: "/auth/2fa/status",
  },
  account: {
    getAccount: `/account`,
    updateAccount: `/account`,
    generateTwoFactorSetup: `/auth/2fa/setup`,
    confirmTwoFactor: `/auth/2fa/confirm`,
    revealFiscal: `/account/reveal-fiscal`,
  },
  users: {
    getCurrentUser:`/users/current`,
    getAllUsers:`/users`,
    getMessagedUsers:`/users/messaged-users`,
    getUserById:`/users`,
    addUser:`/users`,
    updateUser:`/users`,
    deleteUser:`/users`,
    recoverUser:`/users`,
    getTopFrequentUsers:`/users/frequent-users` 
  },
  settings:{
    deleteAccount: `/account`,
    updatePassword: `/account/password`,
    completeAccount: `/account/complete`,
  },
  opportunities:{
    getMyOpportunities: `/opportunities/myopp`,
    deleteOpportunity : `/opportunities`,
    updateOpportunity : `/opportunities`,
    getById : `/opportunities`,
    create: `/opportunities/newopp`,
    favorite: `/opportunities`,
    favorites: `/opportunities/favorites`,
    archive : `/opportunities`,
  },
  applications:{
    getMyApplications: `/applications/myapplications`,
    deleteApplication: `/applications`,
    getAllApplications: `/applications`,
    getCandidatesList: `/applications`,
    updateInterestStatus:  `/applications`,
    updateApplicationStatus:  `/applications`,
  },
  dashboard:{
    getDashboard: `/dashboard`
  },
  notifications:{
    getAll: `/notifications`
  },
  files: {
    getMyfiles: `/files/my/files`,
},
interviews: {
  getAllInterviews: '/interviews',
  addInterview: '/interviews',
  deleteInterview: '/interviews',
  updateInterview: '/interviews',
  getInterview: '/interviews',
  getListInterviewsCandidate: '/interviews/candidate/list'
}
};
