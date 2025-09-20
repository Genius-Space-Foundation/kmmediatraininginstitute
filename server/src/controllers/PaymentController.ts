import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { PaymentService } from "../services/PaymentService";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { UserRepository } from "../repositories/UserRepository";
import { pool } from "../database/database";
import { PaginationParams } from "../types";

export class PaymentController extends BaseController {
  private paymentService: PaymentService;

  constructor() {
    super();
    const paymentRepository = new PaymentRepository(pool);
    const userRepository = new UserRepository(pool);
    this.paymentService = new PaymentService(paymentRepository, userRepository);
  }

  async getPaymentsByStudent(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { studentId } = req.params;
      const pagination = this.getPaginationParams(req);
      return await this.paymentService.getPaymentsByStudent(
        studentId,
        pagination
      );
    });
  }

  async getMyPayments(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const studentId = req.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      const pagination = this.getPaginationParams(req);
      return await this.paymentService.getPaymentsByStudent(
        studentId,
        pagination
      );
    });
  }

  async getPaymentsByRegistration(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { registrationId } = req.params;
      return await this.paymentService.getPaymentsByRegistration(
        registrationId
      );
    });
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      return await this.paymentService.getPaymentById(id);
    });
  }

  async getPaymentByReference(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { reference } = req.params;
      return await this.paymentService.getPaymentByReference(reference);
    });
  }

  async createPayment(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const studentId = req.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      return await this.paymentService.createPayment(req.body, studentId);
    });
  }

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { reference } = req.params;
      const { status, gateway_response } = req.body;

      return await this.paymentService.updatePaymentStatus(
        reference,
        status,
        gateway_response
      );
    });
  }

  async processPaystackWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      return await this.paymentService.processPaystackWebhook(req.body);
    });
  }

  async getTotalRevenue(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined;
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined;

      const revenue = await this.paymentService.getTotalRevenue(
        startDate,
        endDate
      );
      return { total_revenue: revenue };
    });
  }

  async getMonthlyRevenue(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { year } = req.params;
      return await this.paymentService.getMonthlyRevenue(parseInt(year));
    });
  }

  async getPaymentAnalytics(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined;
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined;

      return await this.paymentService.getPaymentAnalytics(startDate, endDate);
    });
  }

  // Installment methods
  async getInstallmentsByRegistration(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { registrationId } = req.params;
      return await this.paymentService.getInstallmentsByRegistration(
        registrationId
      );
    });
  }

  async getOverdueInstallments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      return await this.paymentService.getOverdueInstallments();
    });
  }

  async createInstallmentPlan(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const {
        registration_id,
        total_amount,
        number_of_installments,
        start_date,
      } = req.body;

      return await this.paymentService.createInstallmentPlan(
        registration_id,
        total_amount,
        number_of_installments,
        new Date(start_date)
      );
    });
  }

  async markInstallmentAsPaid(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { payment_reference } = req.body;

      return await this.paymentService.markInstallmentAsPaid(
        id,
        payment_reference
      );
    });
  }

  private getPaginationParams(req: Request): PaginationParams {
    return {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort: req.query.sort as string,
      order: req.query.order as "asc" | "desc",
    };
  }
}



