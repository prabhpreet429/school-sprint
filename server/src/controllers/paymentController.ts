import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getPayments = async (req: Request, res: Response) => {
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

    const payments = await prisma.payment.findMany({
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
          },
        },
        feePayments: {
          include: {
            studentFee: {
              include: {
                fee: {
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
        paymentDate: "desc",
      },
    });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payments.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
      schoolId,
      createdBy,
      feeAllocations, // Array of { studentFeeId, amount }
    } = req.body;

    if (!studentId || amount === undefined || !paymentDate || !paymentMethod || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentId, amount, paymentDate, paymentMethod, schoolId",
      });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }

    const paymentDateObj = new Date(paymentDate);
    if (isNaN(paymentDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date format",
      });
    }

    // Validate fee allocations if provided
    if (feeAllocations && Array.isArray(feeAllocations)) {
      const totalAllocated = feeAllocations.reduce((sum: number, alloc: any) => sum + (Number(alloc.amount) || 0), 0);
      if (totalAllocated > Number(amount)) {
        return res.status(400).json({
          success: false,
          message: "Total allocated amount cannot exceed payment amount",
        });
      }

      // Validate all student fees exist and belong to the student
      for (const alloc of feeAllocations) {
        if (!alloc.studentFeeId || alloc.amount === undefined) {
          return res.status(400).json({
            success: false,
            message: "Each fee allocation must have studentFeeId and amount",
          });
        }

        const studentFee = await prisma.studentFee.findUnique({
          where: { id: Number(alloc.studentFeeId) },
        });

        if (!studentFee) {
          return res.status(404).json({
            success: false,
            message: `Student fee ${alloc.studentFeeId} not found`,
          });
        }

        if (studentFee.studentId !== Number(studentId)) {
          return res.status(400).json({
            success: false,
            message: `Student fee ${alloc.studentFeeId} does not belong to this student`,
          });
        }
      }
    }

    // Create payment and fee allocations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          studentId: Number(studentId),
          amount: Number(amount),
          paymentDate: paymentDateObj,
          paymentMethod: paymentMethod,
          referenceNumber: referenceNumber || null,
          notes: notes || null,
          schoolId: Number(schoolId),
          createdBy: createdBy ? Number(createdBy) : null,
        },
      });

      // Create fee allocations and update student fees
      if (feeAllocations && Array.isArray(feeAllocations) && feeAllocations.length > 0) {
        for (const alloc of feeAllocations) {
          const studentFeeId = Number(alloc.studentFeeId);
          const allocatedAmount = Number(alloc.amount);

          // Create fee payment link
          await tx.feePayment.create({
            data: {
              paymentId: payment.id,
              studentFeeId: studentFeeId,
              amount: allocatedAmount,
            },
          });

          // Update student fee paid amount and status
          const studentFee = await tx.studentFee.findUnique({
            where: { id: studentFeeId },
          });

          if (studentFee) {
            const newPaidAmount = studentFee.paidAmount + allocatedAmount;
            let newStatus = studentFee.status;

            if (newPaidAmount >= studentFee.amount) {
              newStatus = "PAID";
            } else if (newPaidAmount > 0) {
              newStatus = "PARTIAL";
            }

            await tx.studentFee.update({
              where: { id: studentFeeId },
              data: {
                paidAmount: newPaidAmount,
                status: newStatus,
              },
            });
          }
        }
      }

      // Fetch payment with relations
      return await tx.payment.findUnique({
        where: { id: payment.id },
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
            },
          },
          feePayments: {
            include: {
              studentFee: {
                include: {
                  fee: {
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
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const updateData: any = {};
    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid positive number",
        });
      }
      updateData.amount = Number(amount);
    }
    if (paymentDate !== undefined) {
      const paymentDateObj = new Date(paymentDate);
      if (isNaN(paymentDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment date format",
        });
      }
      updateData.paymentDate = paymentDateObj;
    }
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber;
    if (notes !== undefined) updateData.notes = notes;

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
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
          },
        },
        feePayments: {
          include: {
            studentFee: {
              include: {
                fee: {
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
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        feePayments: true,
      },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Delete payment and update student fees in a transaction
    await prisma.$transaction(async (tx) => {
      // Update student fees to remove paid amounts
      for (const feePayment of existingPayment.feePayments) {
        const studentFee = await tx.studentFee.findUnique({
          where: { id: feePayment.studentFeeId },
        });

        if (studentFee) {
          const newPaidAmount = Math.max(0, studentFee.paidAmount - feePayment.amount);
          let newStatus = studentFee.status;

          if (newPaidAmount === 0) {
            // Check if overdue
            if (new Date() > studentFee.dueDate) {
              newStatus = "OVERDUE";
            } else {
              newStatus = "PENDING";
            }
          } else if (newPaidAmount < studentFee.amount) {
            newStatus = "PARTIAL";
          }

          await tx.studentFee.update({
            where: { id: feePayment.studentFeeId },
            data: {
              paidAmount: newPaidAmount,
              status: newStatus,
            },
          });
        }
      }

      // Delete fee payments (cascade will handle this, but being explicit)
      await tx.feePayment.deleteMany({
        where: { paymentId: paymentId },
      });

      // Delete payment
      await tx.payment.delete({
        where: { id: paymentId },
      });
    });

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

