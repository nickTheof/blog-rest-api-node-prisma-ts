import bcrypt from 'bcrypt';
import config from "../config/config";

class SecUtil {
    private constructor() {}

    static async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
        return bcrypt.hash(password, salt)
    }

    static async verifyPassword(plainPassword: string, hashedPassword: string) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

export default SecUtil;
