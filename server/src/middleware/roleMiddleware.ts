import { Request, Response, NextFunction } from "express";

// Middleware to check if user has required role(s)
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(["admin"]);

// Middleware to check if user is admin or teacher
export const requireAdminOrTeacher = requireRole(["admin", "teacher"]);

