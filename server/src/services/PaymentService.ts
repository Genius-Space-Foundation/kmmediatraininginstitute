import { PaymentRepository } from "../repositories/PaymentRepository";
import { UserRepository } from "../repositories/UserRepository";
import { logger } from "../utils/logger";
import { Payment, CreatePaymentRequest, PaginationParams } from "../types";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";
import { v4 as uuidv4 } from "uuid";

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private userRepository: UserRepository
  ) {}

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    return payment;
  }

  async getPaymentsByStudent(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<Payment[]> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== "student") {
      throw new NotFoundError("Student not found");
    }
    return this.paymentRepository.findByStudentId(studentId, pagination);
  }

  async createPayment(
    paymentData: CreatePaymentRequest,
    studentId: string
  ): Promise<Payment> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role !== "student") {
      throw new NotFoundError("Student not found");
    }

    if (paymentData.amount <= 0) {
      throw new ValidationError("Payment amount must be greater than 0");
    }

    const paymentReference = `PAY_${uuidv4().replace(/-/g, "").toUpperCase()}`;

    const payment = await this.paymentRepository.create({
      registration_id: paymentData.registration_id,
      student_id: studentId,
      amount: paymentData.amount,
      currency: "GHS",
      payment_method: paymentData.payment_method || "paystack",
      payment_reference: paymentReference,
      status: "pending",
    });

    logger.info(`Payment created: ${payment.id} for student: ${studentId}`);
    return payment;
  }

  async updatePaymentStatus(
    reference: string,
    status: "successful" | "failed" | "cancelled",
    gatewayResponse?: any
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findByReference(reference);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status !== "pending") {
      throw new ConflictError("Payment status cannot be changed");
    }

    const updatedPayment = await this.paymentRepository.updateByReference(
      reference,
      { status, gateway_response: gatewayResponse }
    );

    if (!updatedPayment) {
      throw new Error("Failed to update payment status");
    }

    logger.info(`Payment status updated: ${reference} to ${status}`);
    return updatedPayment;
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    return this.paymentRepository.getTotalRevenue(startDate, endDate);
  }
}
