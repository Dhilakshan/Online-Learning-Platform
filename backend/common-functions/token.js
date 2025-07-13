const jwt = require('jsonwebtoken');
const GenerateToken = (User) => {
    return jwt.sign(
        {
            id: User.id,
            role: User.role,
            username: User.username,
            email: User.email
        },
        'L3@rn1ng_@ppl1c@t10n',
        {
                expiresIn: "1h"
        });
};

const RefreshToken = (User) => {
    return jwt.sign(
        {
            id: User._id,
            role: User.role,
            username: User.username,
            email: User.email
        },
        'L3@rn1ng_@ppl1c@t10n_refresh',
        {
                expiresIn: "1d"
        });
};

const VerifyToken = (token) => {
    return jwt.verify(token, 'L3@rn1ng_@ppl1c@t10n');
};

module.exports = {
    GenerateToken : GenerateToken,
    VerifyToken: VerifyToken,
    RefreshToken: RefreshToken
}