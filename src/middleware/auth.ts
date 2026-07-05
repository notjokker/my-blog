import passport from 'passport';
export const authenticate = passport.authenticate('jwt', { session: false });

export const optionalAuth = (req: any, res: any, next: any) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (user) req.user = user;
    next();
  })(req, res, next);
};
