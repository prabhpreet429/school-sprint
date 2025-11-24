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
    
    // Get optional classId parameter
    const queryClassId = req.query.classId ? String(req.query.classId) : null;
    const classId = queryClassId ? parseInt(queryClassId, 10) : null;

    // Build where clause
    const whereClause: any = {
      schoolId: schoolId,
    };

    // Add classId filter if provided
    if (classId && !isNaN(classId)) {
      whereClause.classId = classId;
    }

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
        studentParents: {
          select: {
            relationship: true,
            parent: {
              select: {
                id: true,
                username: true,
                name: true,
                surname: true,
                addressLine1: true,
                state: true,
                pinCode: true,
                country: true,
                phone: true,
                email: true,
              },
            },
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

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /students/1?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number.",
      });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        studentParents: {
          select: {
            relationship: true,
            parent: {
              select: {
                id: true,
                username: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
                addressLine1: true,
                state: true,
                pinCode: true,
                country: true,
              },
            },
          },
        },
        attendances: {
          select: {
            id: true,
            date: true,
            present: true,
            lesson: {
              select: {
                id: true,
                name: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 10,
        },
        results: {
          select: {
            id: true,
            score: true,
            exam: {
              select: {
                id: true,
                title: true,
                lesson: {
                  select: {
                    id: true,
                    name: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            assignment: {
              select: {
                id: true,
                title: true,
                lesson: {
                  select: {
                    id: true,
                    name: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            id: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            attendances: true,
            results: true,
            studentParents: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve student.",
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
      addressLine1,
      state,
      pinCode,
      country,
      bloodType,
      sex,
      schoolId,
      parents, // Array of parent objects with relationship
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
      country,
      bloodType,
      sex,
      schoolId,
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

    // Validate schoolId, classId, gradeId are numbers
    const numericFields = { schoolId, classId, gradeId };
    for (const [field, value] of Object.entries(numericFields)) {
      if (isNaN(Number(value))) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid number`,
        });
      }
    }

    // Validate parents array
    if (!parents || !Array.isArray(parents) || parents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one parent must be provided",
      });
    }

    // Validate parent relationships and prepare parent data
    const validRelationships = ["FATHER", "MOTHER", "GUARDIAN"];
    const parentConnections: Array<{ parentId: number; relationship: string }> = [];

    for (const parentData of parents) {
      if (!parentData.relationship || !validRelationships.includes(parentData.relationship)) {
        return res.status(400).json({
          success: false,
          message: `Parent relationship must be one of: ${validRelationships.join(", ")}`,
        });
      }
      if (!parentData.username || !parentData.name || !parentData.surname || !parentData.country || !parentData.phone) {
        return res.status(400).json({
          success: false,
          message: `Parent (${parentData.relationship}) missing required fields: username, name, surname, country, phone`,
        });
      }

      // Check if parent already exists (by username in this school)
      let existingParent = await prisma.parent.findFirst({
        where: {
          username: parentData.username,
          schoolId: Number(schoolId),
        },
      });

      // If not found by username, check by email (if provided)
      if (!existingParent && parentData.email) {
        existingParent = await prisma.parent.findFirst({
          where: {
            email: parentData.email,
            schoolId: Number(schoolId),
          },
        });
      }

      // If not found by email, check by phone
      if (!existingParent) {
        existingParent = await prisma.parent.findFirst({
          where: {
            phone: parentData.phone,
            schoolId: Number(schoolId),
          },
        });
      }

      let parentId: number;

      if (existingParent) {
        // Use existing parent
        parentId = existingParent.id;
      } else {
        // Create new parent
        const newParent = await prisma.parent.create({
          data: {
            username: parentData.username,
            name: parentData.name,
            surname: parentData.surname,
            addressLine1: parentData.addressLine1 || null,
            state: parentData.state || null,
            pinCode: parentData.pinCode || null,
            country: parentData.country,
            phone: parentData.phone,
            email: parentData.email || null,
            schoolId: Number(schoolId),
          },
        });
        parentId = newParent.id;
      }

      parentConnections.push({
        parentId,
        relationship: parentData.relationship,
      });
    }

    // Validate birthday is a valid date
    // Parse date string as local date to avoid timezone issues
    // If format is YYYY-MM-DD, parse it as local midnight
    const birthdayDate = birthday.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? (() => {
          const [year, month, day] = birthday.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(birthday);
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
        addressLine1: addressLine1 || null,
        state: state || null,
        pinCode: pinCode || null,
        country,
        bloodType,
        sex: sex as UserSex,
        schoolId: Number(schoolId),
        classId: Number(classId),
        gradeId: Number(gradeId),
        studentParents: {
          create: parentConnections.map((conn) => ({
            parentId: conn.parentId,
            relationship: conn.relationship as any,
          })),
        },
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
        studentParents: {
          select: {
            relationship: true,
            parent: {
              select: {
                id: true,
                username: true,
                name: true,
                surname: true,
                addressLine1: true,
                state: true,
                pinCode: true,
                country: true,
                phone: true,
                email: true,
              },
            },
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

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      username,
      name,
      surname,
      addressLine1,
      state,
      pinCode,
      country,
      bloodType,
      sex,
      parents,
      classId,
      gradeId,
      birthday,
      email,
      phone,
      img,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate required fields
    const requiredFields = {
      username,
      name,
      surname,
      country,
      bloodType,
      sex,
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

    // Check if username is already taken by another student in the same school
    if (username !== existingStudent.username) {
      const existingUsername = await prisma.student.findFirst({
        where: {
          username,
          schoolId: existingStudent.schoolId,
          id: { not: studentId },
        },
      });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already exists for this school",
        });
      }
    }

    // Check if email is already taken by another student in the same school (if provided)
    if (email && email !== existingStudent.email) {
      const existingEmail = await prisma.student.findFirst({
        where: {
          email,
          schoolId: existingStudent.schoolId,
          id: { not: studentId },
        },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists for this school",
        });
      }
    }

    // Check if phone is already taken by another student in the same school (if provided)
    if (phone && phone !== existingStudent.phone) {
      const existingPhone = await prisma.student.findFirst({
        where: {
          phone,
          schoolId: existingStudent.schoolId,
          id: { not: studentId },
        },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone already exists for this school",
        });
      }
    }

    // Validate classId and gradeId exist and belong to the school
    const classExists = await prisma.class.findUnique({
      where: { id: Number(classId) },
    });
    if (!classExists || classExists.schoolId !== existingStudent.schoolId) {
      return res.status(400).json({
        success: false,
        message: "Invalid classId or class does not belong to this school",
      });
    }

    const gradeExists = await prisma.grade.findUnique({
      where: { id: Number(gradeId) },
    });
    if (!gradeExists || gradeExists.schoolId !== existingStudent.schoolId) {
      return res.status(400).json({
        success: false,
        message: "Invalid gradeId or grade does not belong to this school",
      });
    }

    // Handle parents update
    let parentUpdateData: any = {};
    if (parents && Array.isArray(parents) && parents.length > 0) {
      // Delete existing student-parent relationships
      await prisma.studentParent.deleteMany({
        where: { studentId },
      });

      // Process parents similar to create
      const parentConnections = [];
      for (const parentData of parents) {
        const { username, name, surname, addressLine1, state, pinCode, country, phone, email, relationship } = parentData;

        // Check if parent already exists
        let parent = await prisma.parent.findFirst({
          where: {
            OR: [
              { username, schoolId: existingStudent.schoolId },
              ...(email ? [{ email, schoolId: existingStudent.schoolId }] : []),
              ...(phone ? [{ phone, schoolId: existingStudent.schoolId }] : []),
            ],
          },
        });

        if (!parent) {
          // Create new parent
          parent = await prisma.parent.create({
            data: {
              username,
              name,
              surname,
              addressLine1: addressLine1 || null,
              state: state || null,
              pinCode: pinCode || null,
              country,
              phone,
              email: email || null,
              schoolId: existingStudent.schoolId,
            },
          });
        }

        parentConnections.push({
          parentId: parent.id,
          relationship,
        });
      }

      parentUpdateData = {
        studentParents: {
          create: parentConnections,
        },
      };
    }

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        username,
        name,
        surname,
        addressLine1: addressLine1 || null,
        state: state || null,
        pinCode: pinCode || null,
        country,
        bloodType,
        sex,
        classId: Number(classId),
        gradeId: Number(gradeId),
        birthday: new Date(birthday),
        email: email || null,
        phone: phone || null,
        img: img || null,
        ...parentUpdateData,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
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
        studentParents: {
          include: {
            parent: {
              select: {
                id: true,
                username: true,
                name: true,
                surname: true,
                addressLine1: true,
                state: true,
                pinCode: true,
                country: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete the student (cascade will handle related records)
    await prisma.student.delete({
      where: { id: studentId },
    });

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
