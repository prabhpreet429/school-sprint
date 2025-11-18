import { PrismaClient, UserSex } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getStudents = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /students?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    // Get optional search parameter
    const search = req.query.search ? String(req.query.search) : "";

    // Build where clause
    const whereClause: any = {
      schoolId: schoolId,
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          surname: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          username: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      username,
      name,
      surname,
      address,
      bloodType,
      sex,
      schoolId,
      parentId,
      classId,
      gradeId,
      birthday,
      email,
      phone,
      img,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      username,
      name,
      surname,
      address,
      bloodType,
      sex,
      schoolId,
      parentId,
      classId,
      gradeId,
      birthday,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate sex enum
    if (sex !== UserSex.MALE && sex !== UserSex.FEMALE) {
      return res.status(400).json({
        success: false,
        message: "sex must be either 'MALE' or 'FEMALE'",
      });
    }

    // Validate schoolId, parentId, classId, gradeId are numbers
    const numericFields = { schoolId, parentId, classId, gradeId };
    for (const [field, value] of Object.entries(numericFields)) {
      if (isNaN(Number(value))) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid number`,
        });
      }
    }

    // Validate birthday is a valid date
    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "birthday must be a valid date",
      });
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) },
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check if parent exists
    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
    });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Check if class exists and belongs to the school
    const classRecord = await prisma.class.findUnique({
      where: { id: Number(classId) },
    });
    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }
    if (classRecord.schoolId !== Number(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Class does not belong to the specified school",
      });
    }

    // Check if grade exists and belongs to the school
    const grade = await prisma.grade.findUnique({
      where: { id: Number(gradeId) },
    });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }
    if (grade.schoolId !== Number(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Grade does not belong to the specified school",
      });
    }

    // Check if username is already taken for this school
    const existingUsername = await prisma.student.findFirst({
      where: {
        username,
        schoolId: Number(schoolId),
      },
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists for this school",
      });
    }

    // Check if email is already taken for this school (if provided)
    if (email) {
      const existingEmail = await prisma.student.findFirst({
        where: {
          email,
          schoolId: Number(schoolId),
        },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists for this school",
        });
      }
    }

    // Check if phone is already taken for this school (if provided)
    if (phone) {
      const existingPhone = await prisma.student.findFirst({
        where: {
          phone,
          schoolId: Number(schoolId),
        },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone already exists for this school",
        });
      }
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        username,
        name,
        surname,
        address,
        bloodType,
        sex: sex as UserSex,
        schoolId: Number(schoolId),
        parentId: Number(parentId),
        classId: Number(classId),
        gradeId: Number(gradeId),
        birthday: birthdayDate,
        email: email || null,
        phone: phone || null,
        img: img || null,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
