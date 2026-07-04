"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const passport_jwt_1 = require("passport-jwt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'dev-secret',
};
function default_1(passport) {
    passport.use(new passport_jwt_1.Strategy(opts, async (jwt_payload, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: jwt_payload.id } });
            if (user)
                return done(null, user);
            return done(null, false);
        }
        catch (err) {
            return done(err, false);
        }
    }));
}
//# sourceMappingURL=passport.js.map