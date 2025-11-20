import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getFees = async (req: Request, res: Response) => {
  try {
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
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

    const fees = await prisma.fee.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        _count: {
          select: {
            studentFees: true,
          },
        },
      },
      orderBy: [
        { gradeId: "asc" },
        { name: "asc" },
      ],
    });

    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve fees.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createFee = async (req: Request, res: Response) => {
  try {
    const {
      name,
      amount,
      frequency,
      schoolId,
      gradeId,
      isActive,
    } = req.body;

    if (!name || amount === undefined || !frequency || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, amount, frequency, schoolId",
      });
    }

    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }

    const fee = await prisma.fee.create({
      data: {
        name: String(name),
        amount: Number(amount),
        frequency: frequency,
        schoolId: Number(schoolId),
        gradeId: gradeId ? Number(gradeId) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
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
      message: "Fee created successfully",
      data: fee,
    });
  } catch (error) {
    console.error("Error creating fee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create fee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateFee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      frequency,
      gradeId,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Fee ID is required",
      });
    }

    const feeId = parseInt(id, 10);
    if (isNaN(feeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee ID",
      });
    }

    const existingFee = await prisma.fee.findUnique({
      where: { id: feeId },
    });

    if (!existingFee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name);
    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid positive number",
        });
      }
      updateData.amount = Number(amount);
    }
    if (frequency !== undefined) updateData.frequency = frequency;
    if (gradeId !== undefined) updateData.gradeId = gradeId ? Number(gradeId) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updatedFee = await prisma.fee.update({
      where: { id: feeId },
      data: updateData,
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Fee updated successfully",
      data: updatedFee,
    });
  } catch (error) {
    console.error("Error updating fee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update fee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteFee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Fee ID is required",
      });
    }

    const feeId = parseInt(id, 10);
    if (isNaN(feeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee ID",
      });
    }

    const existingFee = await prisma.fee.findUnique({
      where: { id: feeId },
    });

    if (!existingFee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    await prisma.fee.delete({
      where: { id: feeId },
    });

    res.status(200).json({
      success: true,
      message: "Fee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete fee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

