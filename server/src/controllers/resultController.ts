import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getResults = async (req: Request, res: Response) => {
  try {
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /results?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    const search = req.query.search ? String(req.query.search) : "";

    const whereClause: any = {
      schoolId: schoolId,
    };

    if (search) {
      whereClause.OR = [
        {
          student: {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          student: {
            surname: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          exam: {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          assignment: {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      ];
    }

    const results = await prisma.result.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve results.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createResult = async (req: Request, res: Response) => {
  try {
    const {
      score,
      schoolId,
      studentId,
      examId,
      assignmentId,
    } = req.body;

    if (!score || !schoolId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: score, schoolId, studentId",
      });
    }

    if (!examId && !assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Either examId or assignmentId must be provided",
      });
    }

    if (examId && assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Cannot provide both examId and assignmentId",
      });
    }

    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
      });
    }

    if (isNaN(Number(studentId))) {
      return res.status(400).json({
        success: false,
        message: "studentId must be a valid number",
      });
    }

    if (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      return res.status(400).json({
        success: false,
        message: "score must be a number between 0 and 100",
      });
    }

    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) },
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    });
    if (!student || student.schoolId !== Number(schoolId)) {
      return res.status(404).json({
        success: false,
        message: "Student not found or does not belong to this school",
      });
    }

    // Check if user is teacher and verify they own the lesson
    const user = (req as any).user;
    if (user && user.role === "teacher") {
      const admin = await prisma.admin.findUnique({
        where: { id: user.id },
        include: { teacher: true },
      });

      if (!admin || !admin.teacherId) {
        return res.status(403).json({
          success: false,
          message: "Teacher account not found",
        });
      }

      if (examId) {
        const exam = await prisma.exam.findUnique({
          where: { id: Number(examId) },
          include: { lesson: true },
        });
        if (!exam || exam.schoolId !== Number(schoolId)) {
          return res.status(404).json({
            success: false,
            message: "Exam not found or does not belong to this school",
          });
        }
        if (exam.lesson.teacherId !== admin.teacherId) {
          return res.status(403).json({
            success: false,
            message: "You can only add results for your own exams",
          });
        }
      }

      if (assignmentId) {
        const assignment = await prisma.assignment.findUnique({
          where: { id: Number(assignmentId) },
          include: { lesson: true },
        });
        if (!assignment || assignment.schoolId !== Number(schoolId)) {
          return res.status(404).json({
            success: false,
            message: "Assignment not found or does not belong to this school",
          });
        }
        if (assignment.lesson.teacherId !== admin.teacherId) {
          return res.status(403).json({
            success: false,
            message: "You can only add results for your own assignments",
          });
        }
      }
    } else {
      // For non-teachers, just validate existence
      if (examId) {
        const exam = await prisma.exam.findUnique({
          where: { id: Number(examId) },
        });
        if (!exam || exam.schoolId !== Number(schoolId)) {
          return res.status(404).json({
            success: false,
            message: "Exam not found or does not belong to this school",
          });
        }
      }

      if (assignmentId) {
        const assignment = await prisma.assignment.findUnique({
          where: { id: Number(assignmentId) },
        });
        if (!assignment || assignment.schoolId !== Number(schoolId)) {
          return res.status(404).json({
            success: false,
            message: "Assignment not found or does not belong to this school",
          });
        }
      }
    }

    const result = await prisma.result.create({
      data: {
        score: Number(score),
        schoolId: Number(schoolId),
        studentId: Number(studentId),
        examId: examId ? Number(examId) : null,
        assignmentId: assignmentId ? Number(assignmentId) : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
    });

    res.status(201).json({
      success: true,
      message: "Result created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create result",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      score,
      studentId,
      examId,
      assignmentId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Result ID is required",
      });
    }

    const resultId = parseInt(id, 10);
    if (isNaN(resultId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (!score || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: score, studentId",
      });
    }

    if (!examId && !assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Either examId or assignmentId must be provided",
      });
    }

    if (examId && assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Cannot provide both examId and assignmentId",
      });
    }

    if (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      return res.status(400).json({
        success: false,
        message: "score must be a number between 0 and 100",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    });
    if (!student || student.schoolId !== existingResult.schoolId) {
      return res.status(404).json({
        success: false,
        message: "Student not found or does not belong to this school",
      });
    }

    if (examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: Number(examId) },
      });
      if (!exam || exam.schoolId !== existingResult.schoolId) {
        return res.status(404).json({
          success: false,
          message: "Exam not found or does not belong to this school",
        });
      }
    }

    if (assignmentId) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: Number(assignmentId) },
      });
      if (!assignment || assignment.schoolId !== existingResult.schoolId) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found or does not belong to this school",
        });
      }
    }

    const updatedResult = await prisma.result.update({
      where: { id: resultId },
      data: {
        score: Number(score),
        studentId: Number(studentId),
        examId: examId ? Number(examId) : null,
        assignmentId: assignmentId ? Number(assignmentId) : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
    });

    res.status(200).json({
      success: true,
      message: "Result updated successfully",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update result",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Result ID is required",
      });
    }

    const resultId = parseInt(id, 10);
    if (isNaN(resultId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    await prisma.result.delete({
      where: { id: resultId },
    });

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete result",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

