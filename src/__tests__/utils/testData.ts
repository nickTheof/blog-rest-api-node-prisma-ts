import {ProfileWithUser} from "../../types/response.types";
import userService from "../../service/user.service";
import profileService from "../../service/profile.service";
import {ProfileUpdateSchema} from "../../types/zod-schemas.types";

export const createProfileWithUser = async(): Promise<ProfileWithUser> => {
    const userCreated = await userService.create({
        email: `test${Date.now()}@test.com`,
        password: "aA@12345",
        role: "USER",
        isActive: true,
    })
    return profileService.create(userCreated.uuid, {
        firstname: "Test",
        lastname: "Test",
        bio: "Test Test Bio",
    })
}

export const updateProfileData: ProfileUpdateSchema = {
    firstname: "Updated Name" + Date.now(),
    lastname: "Updated Lastname" + Date.now(),
    bio: "Updated Bio" + Date.now(),
}

export const invalidProfileData: ProfileUpdateSchema = {
    firstname: "",
    lastname: "",
    bio: "",
}