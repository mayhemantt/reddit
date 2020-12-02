"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
exports.isAuth = ({ context }, next) => {
    if (!context.req.session.userID) {
        throw new Error("not authenticated");
    }
    return next();
};
//# sourceMappingURL=isAuth.js.map