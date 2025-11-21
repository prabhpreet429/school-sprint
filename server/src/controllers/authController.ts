import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate JWT token
function generateToken(admin: { id: number; email: string; role: string; schoolId: number }) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      schoolId: admin.schoolId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      schoolId: admin.schoolId,
    });

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        schoolId: admin.schoolId,
        schoolName: admin.school.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Register (Only for admin role - public sign-up)
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, schoolName, schoolAddress, schoolCountry, schoolTimezone, role } = req.body;

    // Only allow admin registration from public sign-up
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin accounts can be created through public registration. Other accounts must be created by an admin.",
      });
    }

    if (!email || !password || !username || !schoolName || !schoolCountry || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, username, school name, and country are required",
      });
    }

    // Check if email already exists
    const existingAdminByEmail = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdminByEmail) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Check if school with this name already exists
    let school = await prisma.school.findFirst({
      where: { 
        name: schoolName,
      },
    });

    // If school doesn't exist, create it
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: schoolName,
          address: schoolAddress || null,
          country: schoolCountry,
          timezone: schoolTimezone || "UTC",
        },
      });
    } else {
      // School exists, check if it already has an admin
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          schoolId: school.id,
          role: "admin",
        },
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: "An admin already exists for this school. Only one admin is allowed per school.",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        username,
        schoolId: school.id,
        role,
      },
      include: { school: true },
    });

    const token = generateToken({
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
      schoolId: newAdmin.schoolId,
    });

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role,
        schoolId: newAdmin.schoolId,
        schoolName: newAdmin.school.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create account for existing person (Admin only)
export const createAccount = async (req: Request, res: Response) => {
  try {
    const { email, password, personType, personId, schoolId } = req.body;

    // Verify requester is admin
    const requester = (req as any).user;
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create accounts",
      });
    }

    if (!email || !password || !personType || !personId || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const existingAdminByEmail = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdminByEmail) {
      return res.status(409).json({
        success: false,
        message: "Account with this email already exists",
      });
    }

    // Verify person exists and belongs to the school
    let person: any = null;
    let role = "";

    if (personType === "teacher") {
      person = await prisma.teacher.findFirst({
        where: {
          id: parseInt(personId),
          schoolId: parseInt(schoolId),
        },
      });
      role = "teacher";
      
      // Check if teacher already has an account
      const existingAccount = await prisma.admin.findUnique({
        where: { teacherId: parseInt(personId) },
      });
      
      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: "This teacher already has an account",
        });
      }
    } else if (personType === "student") {
      person = await prisma.student.findFirst({
        where: {
          id: parseInt(personId),
          schoolId: parseInt(schoolId),
        },
      });
      role = "student";
      
      // Check if student already has an account
      const existingAccount = await prisma.admin.findUnique({
        where: { studentId: parseInt(personId) },
      });
      
      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: "This student already has an account",
        });
      }
    } else if (personType === "parent") {
      return res.status(403).json({
        success: false,
        message: "Parent accounts cannot be created. Parents do not have login access.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid person type. Must be 'teacher' or 'student'",
      });
    }

    if (!person) {
      return res.status(404).json({
        success: false,
        message: `${personType} not found or does not belong to this school`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account linked to person
    const accountData: any = {
      email,
      password: hashedPassword,
      username: person.username,
      schoolId: parseInt(schoolId),
      role,
    };

    if (personType === "teacher") {
      accountData.teacherId = parseInt(personId);
    } else if (personType === "student") {
      accountData.studentId = parseInt(personId);
    }

    const newAccount = await prisma.admin.create({
      data: accountData,
      include: {
        school: true,
        teacher: personType === "teacher" ? true : false,
        student: personType === "student" ? true : false,
      },
    });

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${personType}`,
      account: {
        id: newAccount.id,
        email: newAccount.email,
        username: newAccount.username,
        role: newAccount.role,
        schoolId: newAccount.schoolId,
        personId: parseInt(personId),
        personType,
      },
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify token (middleware helper)
export const verifyToken = (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Get people without accounts (for admin to create accounts)
export const getPeopleWithoutAccounts = async (req: Request, res: Response) => {
  try {
    const requester = (req as any).user;
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this endpoint",
      });
    }

    const { personType, schoolId } = req.query;

    if (!personType || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "personType and schoolId are required",
      });
    }

    const parsedSchoolId = parseInt(schoolId as string);
    const type = personType as string;

    // Get all accounts with linked person IDs
    const accountsWithPeople = await prisma.admin.findMany({
      where: {
        schoolId: parsedSchoolId,
        role: type,
      },
      select: {
        teacherId: true,
        studentId: true,
        parentId: true,
      },
    });

    const linkedIds = accountsWithPeople
      .map((acc) => acc.teacherId || acc.studentId || acc.parentId)
      .filter((id): id is number => id !== null);

    if (type === "teacher") {
      const teachers = await prisma.teacher.findMany({
        where: {
          schoolId: parsedSchoolId,
          id: {
            notIn: linkedIds,
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json({
        success: true,
        data: teachers,
      });
    } else if (type === "student") {
      const students = await prisma.student.findMany({
        where: {
          schoolId: parsedSchoolId,
          id: {
            notIn: linkedIds,
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json({
        success: true,
        data: students,
      });
    } else if (type === "parent") {
      return res.status(403).json({
        success: false,
        message: "Parent accounts are not supported. Parents do not have login access.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid person type. Must be 'teacher' or 'student'",
      });
    }
  } catch (error) {
    console.error("Get people without accounts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if admin exists for a school
export const checkAdminExists = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        schoolId: parseInt(schoolId),
        role: "admin",
      },
    });

    res.status(200).json({
      success: true,
      exists: !!existingAdmin,
    });
  } catch (error) {
    console.error("Check admin exists error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const requester = (req as any).user;
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this endpoint",
      });
    }

    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const parsedSchoolId = parseInt(schoolId as string);
    if (isNaN(parsedSchoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schoolId",
      });
    }

    const users = await prisma.admin.findMany({
      where: {
        schoolId: parsedSchoolId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        schoolId: true,
        teacherId: true,
        studentId: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        schoolId: admin.schoolId,
        schoolName: admin.school.name,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
