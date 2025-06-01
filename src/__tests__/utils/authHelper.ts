import userService from "../../service/user.service";
import authService from "../../service/auth.service";
import {Role} from "@prisma/client";
import {User} from "@prisma/client";
import profileService from "../../service/profile.service";

export type UserHelperTestCredentials = {
    user: User;
    token: string;
}

type LoginResponse = {
    status: string;
    data: string;
}

export const registerAndLogUser = async (role: Role = Role.USER) : Promise<UserHelperTestCredentials> => {
    const user: User = await userService.create({
        email: `test${Date.now()}${role}@gmail.com`,
        password: "aA!12345",
        role: role,
        isActive: true
    })

    const loginResponse: LoginResponse = await authService.loginUser({
        email: user.email,
        password: "aA!12345"
    }) as LoginResponse;
    const token: string = loginResponse.data;

    return {user, token}
}

export const registerWithProfileAndLog = async (role: Role = Role.USER) : Promise<UserHelperTestCredentials> => {
    const {user, token} = await registerAndLogUser(role);
    await profileService.create(
        user.uuid,
        {
            firstname: role,
            lastname: role,
            bio: `${role} Test Bio`,
        })
    return {user, token}
}