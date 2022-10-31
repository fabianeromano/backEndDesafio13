import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

export function getHashedPassword(password) {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

export function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);

}