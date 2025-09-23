import { User } from '../user/interfaces/user.interfaces';

type SignInRequestI = {
  email: string;
  password: string;
};
interface SignUpRequestI {
    fullName: string;
    role: string;
    email: string;
    password: string;
    phone: string;
}
interface SignInResponceI extends User {
    fullName: string;
    email: string;
    password: string;
    phone: string;
}

interface GoogleUserData {
    googleId: string;
    email: string;
    fullName: string;
    profilePicture?: string;
}

export { SignInRequestI, SignInResponceI, SignUpRequestI, GoogleUserData };