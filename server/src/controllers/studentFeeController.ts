import { PrismaClient, FeeStatus } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getStudentFees = async (req: Request, res: Response) => {
  try {
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    const studentId = req.query.studentId ? String(req.query.studentId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter."
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    const whereClause: any = {
      schoolId: schoolId,
    };

    if (studentId) {
      const parsedStudentId = parseInt(studentId, 10);
      if (!isNaN(parsedStudentId)) {
        whereClause.studentId = parsedStudentId;
      }
    }

    const studentFees = await prisma.studentFee.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
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
        },
        fee: {
          select: {
            id: true,
            name: true,
            frequency: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    res.status(200).json({ success: true, data: studentFees });
  } catch (error) {
    console.error("Error fetching student fees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve student fees.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createStudentFee = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      feeId,
      amount,
      dueDate,
      schoolId,
      academicYear,
      term,
      notes,
    } = req.body;

    if (!studentId || !feeId || amount === undefined || !dueDate || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentId, feeId, amount, dueDate, schoolId",
      });
    }

    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format",
      });
    }

    // Check if fee exists
    const fee = await prisma.fee.findUnique({
      where: { id: Number(feeId) },
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentFee = await prisma.studentFee.create({
      data: {
        studentId: Number(studentId),
        feeId: Number(feeId),
        amount: Number(amount),
        dueDate: dueDateObj,
        schoolId: Number(schoolId),
        academicYear: academicYear || null,
        term: term || null,
        notes: notes || null,
        status: "PENDING",
        paidAmount: 0,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
          },
        },
        fee: {
          select: {
            id: true,
            name: true,
            frequency: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Student fee created successfully",
      data: studentFee,
    });
  } catch (error) {
    console.error("Error creating student fee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create student fee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Bulk assign fees to students based on grade
export const assignFeesByGrade = async (req: Request, res: Response) => {
  try {
    const {
      gradeId,
      schoolId,
      academicYear,
      term,
      dueDate,
    } = req.body;

    if (!gradeId || !schoolId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: gradeId, schoolId, dueDate",
      });
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format",
      });
    }

    // Get all active fees for this grade
    const fees = await prisma.fee.findMany({
      where: {
        schoolId: Number(schoolId),
        gradeId: Number(gradeId),
        isActive: true,
      },
    });

    if (fees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active fees found for this grade",
      });
    }

    // Get all students in this grade
    const students = await prisma.student.findMany({
      where: {
        schoolId: Number(schoolId),
        gradeId: Number(gradeId),
      },
      select: {
        id: true,
      },
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in this grade",
      });
    }

    // Create student fees for all students
    const studentFeesData = [];
    for (const student of students) {
      for (const fee of fees) {
        studentFeesData.push({
          studentId: student.id,
          feeId: fee.id,
          amount: fee.amount,
          dueDate: dueDateObj,
          schoolId: Number(schoolId),
          academicYear: academicYear || null,
          term: term || null,
          status: FeeStatus.PENDING,
          paidAmount: 0,
        });
      }
    }

    // Use createMany for better performance
    const result = await prisma.studentFee.createMany({
      data: studentFeesData,
      skipDuplicates: true, // Skip if student already has this fee
    });

    res.status(201).json({
      success: true,
      message: `Assigned ${result.count} fees to ${students.length} students`,
      data: {
        studentsCount: students.length,
        feesCount: fees.length,
        assignedCount: result.count,
      },
    });
  } catch (error) {
    console.error("Error assigning fees by grade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign fees",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateStudentFee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      amount,
      dueDate,
      status,
      academicYear,
      term,
      notes,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student fee ID is required",
      });
    }

    const studentFeeId = parseInt(id, 10);
    if (isNaN(studentFeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student fee ID",
      });
    }

    const existingStudentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
    });

    if (!existingStudentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    const updateData: any = {};
    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid positive number",
        });
      }
      updateData.amount = Number(amount);
    }
    if (dueDate !== undefined) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format",
        });
      }
      updateData.dueDate = dueDateObj;
    }
    if (status !== undefined) updateData.status = status;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (term !== undefined) updateData.term = term;
    if (notes !== undefined) updateData.notes = notes;

    // Auto-update status based on paid amount
    if (updateData.amount !== undefined || existingStudentFee.paidAmount !== undefined) {
      const finalAmount = updateData.amount !== undefined ? updateData.amount : existingStudentFee.amount;
      const paidAmount = existingStudentFee.paidAmount;
      
      if (paidAmount >= finalAmount) {
        updateData.status = "PAID";
      } else if (paidAmount > 0) {
        updateData.status = "PARTIAL";
      } else {
        // Check if overdue
        const dueDateCheck = updateData.dueDate ? new Date(updateData.dueDate) : existingStudentFee.dueDate;
        if (new Date() > dueDateCheck) {
          updateData.status = "OVERDUE";
        } else {
          updateData.status = "PENDING";
        }
      }
    }

    const updatedStudentFee = await prisma.studentFee.update({
      where: { id: studentFeeId },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
          },
        },
        fee: {
          select: {
            id: true,
            name: true,
            frequency: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Student fee updated successfully",
      data: updatedStudentFee,
    });
  } catch (error) {
    console.error("Error updating student fee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student fee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteStudentFee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student fee ID is required",
      });
    }

    const studentFeeId = parseInt(id, 10);
    if (isNaN(studentFeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student fee ID",
      });
    }

    const existingStudentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
    });

    if (!existingStudentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    await prisma.studentFee.delete({
      where: { id: studentFeeId },
    });

    res.status(200).json({
      success: true,
      message: "Student fee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student fee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student fee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

