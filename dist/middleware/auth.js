"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const passport_1 = __importDefault(require("passport"));
exports.authenticate = passport_1.default.authenticate('jwt', { session: false });
const optionalAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (user)
            req.user = user;
        next();
    })(req, res, next);
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map