import { Role } from "../helpers/constants";


interface Payload {
    _id: string;
    roles?: Role;
    profilePicture?: string | null;
    fullName?: string;
}

export default Payload;
