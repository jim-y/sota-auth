import { Request, Response, NextFunction } from 'express';

export function sessionCheck(req: Request, res: Response, next: NextFunction) {
  if (req.session.user != null) {
    return next();
  }

  if (req.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    const params = new URLSearchParams({});
    res.redirect(req.originalUrl);
  } else {
    res.sendStatus(401);
  }
}
