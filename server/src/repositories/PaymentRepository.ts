import { BaseRepository } from "./BaseRepository";
import { Payment, CourseFeeInstallment } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export class PaymentRepository extends BaseRepository {
  async findById(id: string): Promise<Payment | null> {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email as student_email,
             cr.id as registration_id, c.title as course_title
      FROM payments p
      JOIN users u ON p.student_id = u.id
      LEFT JOIN course_registrations cr ON p.registration_id = cr.id
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE p.id = $1
    `;
    return this.queryOne<Payment>(query, [id]);
  }

  async findByStudentId(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<Payment[]> {
    let query = `
      SELECT p.*, cr.id as registration_id, c.title as course_title
      FROM payments p
      LEFT JOIN course_registrations cr ON p.registration_id = cr.id
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE p.student_id = $1
    `;

    const params: any[] = [studentId];

    if (pagination?.sort) {
      query += ` ORDER BY p.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<Payment>(query, params);
  }

  async findByRegistrationId(registrationId: string): Promise<Payment[]> {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email as student_email
      FROM payments p
      JOIN users u ON p.student_id = u.id
      WHERE p.registration_id = $1
      ORDER BY p.created_at DESC
    `;
    return this.query<Payment>(query, [registrationId]);
  }

  async findByReference(reference: string): Promise<Payment | null> {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email as student_email,
             cr.id as registration_id, c.title as course_title
      FROM payments p
      JOIN users u ON p.student_id = u.id
      LEFT JOIN course_registrations cr ON p.registration_id = cr.id
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE p.payment_reference = $1 OR p.paystack_reference = $1
    `;
    return this.queryOne<Payment>(query, [reference]);
  }

  async findSuccessfulPayments(
    studentId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Payment[]> {
    let query = `
      SELECT p.*, cr.id as registration_id, c.title as course_title
      FROM payments p
      LEFT JOIN course_registrations cr ON p.registration_id = cr.id
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE p.status = 'successful'
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (studentId) {
      paramCount++;
      query += ` AND p.student_id = $${paramCount}`;
      params.push(studentId);
    }

    if (startDate) {
      paramCount++;
      query += ` AND p.created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND p.created_at <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY p.created_at DESC`;

    return this.query<Payment>(query, params);
  }

  async create(
    payment: Omit<Payment, "id" | "created_at" | "updated_at">
  ): Promise<Payment> {
    const query = `
      INSERT INTO payments (registration_id, student_id, amount, currency, 
                          payment_method, payment_reference, paystack_reference, 
                          status, gateway_response)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      payment.registration_id,
      payment.student_id,
      payment.amount,
      payment.currency,
      payment.payment_method,
      payment.payment_reference,
      payment.paystack_reference,
      payment.status,
      payment.gateway_response
        ? JSON.stringify(payment.gateway_response)
        : null,
    ];
    return this.queryOne<Payment>(query, params);
  }

  async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE payments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => {
        const value = updates[field as keyof Payment];
        return field === "gateway_response" && value
          ? JSON.stringify(value)
          : value;
      }),
    ];
    return this.queryOne<Payment>(query, params);
  }

  async updateByReference(
    reference: string,
    updates: Partial<Payment>
  ): Promise<Payment | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE payments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1 OR paystack_reference = $1
      RETURNING *
    `;
    const params = [
      reference,
      ...fields.map((field) => {
        const value = updates[field as keyof Payment];
        return field === "gateway_response" && value
          ? JSON.stringify(value)
          : value;
      }),
    ];
    return this.queryOne<Payment>(query, params);
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    let query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE status = 'successful'
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (startDate) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
    }

    const result = await this.queryOne<{ total: string }>(query, params);
    return parseFloat(result.total);
  }

  async getMonthlyRevenue(
    year: number
  ): Promise<Array<{ month: number; revenue: number }>> {
    const query = `
      SELECT EXTRACT(MONTH FROM created_at) as month, 
             COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE status = 'successful' 
        AND EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    const result = await this.query<{ month: number; revenue: string }>(query, [
      year,
    ]);
    return result.map((row) => ({
      month: row.month,
      revenue: parseFloat(row.revenue),
    }));
  }

  // Course Fee Installment methods
  async findInstallmentById(id: string): Promise<CourseFeeInstallment | null> {
    const query = `
      SELECT i.*, cr.student_id, cr.course_id, c.title as course_title,
             u.first_name, u.last_name, u.email as student_email
      FROM course_fee_installments i
      JOIN course_registrations cr ON i.registration_id = cr.id
      JOIN courses c ON cr.course_id = c.id
      JOIN users u ON cr.student_id = u.id
      WHERE i.id = $1
    `;
    return this.queryOne<CourseFeeInstallment>(query, [id]);
  }

  async findInstallmentsByRegistration(
    registrationId: string
  ): Promise<CourseFeeInstallment[]> {
    const query = `
      SELECT i.*, cr.student_id, cr.course_id, c.title as course_title
      FROM course_fee_installments i
      JOIN course_registrations cr ON i.registration_id = cr.id
      JOIN courses c ON cr.course_id = c.id
      WHERE i.registration_id = $1
      ORDER BY i.installment_number ASC
    `;
    return this.query<CourseFeeInstallment>(query, [registrationId]);
  }

  async findOverdueInstallments(): Promise<CourseFeeInstallment[]> {
    const query = `
      SELECT i.*, cr.student_id, cr.course_id, c.title as course_title,
             u.first_name, u.last_name, u.email as student_email
      FROM course_fee_installments i
      JOIN course_registrations cr ON i.registration_id = cr.id
      JOIN courses c ON cr.course_id = c.id
      JOIN users u ON cr.student_id = u.id
      WHERE i.status = 'pending' 
        AND i.due_date < CURRENT_DATE
      ORDER BY i.due_date ASC
    `;
    return this.query<CourseFeeInstallment>(query);
  }

  async createInstallment(
    installment: Omit<CourseFeeInstallment, "id" | "created_at" | "updated_at">
  ): Promise<CourseFeeInstallment> {
    const query = `
      INSERT INTO course_fee_installments (registration_id, installment_number, amount, 
                                         due_date, status, payment_reference)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      installment.registration_id,
      installment.installment_number,
      installment.amount,
      installment.due_date,
      installment.status,
      installment.payment_reference,
    ];
    return this.queryOne<CourseFeeInstallment>(query, params);
  }

  async updateInstallment(
    id: string,
    updates: Partial<CourseFeeInstallment>
  ): Promise<CourseFeeInstallment | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE course_fee_installments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof CourseFeeInstallment]),
    ];
    return this.queryOne<CourseFeeInstallment>(query, params);
  }

  async markInstallmentAsPaid(
    id: string,
    paymentReference: string
  ): Promise<CourseFeeInstallment | null> {
    const query = `
      UPDATE course_fee_installments 
      SET status = 'paid', paid_date = CURRENT_DATE, payment_reference = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    return this.queryOne<CourseFeeInstallment>(query, [id, paymentReference]);
  }

  async createInstallmentPlan(
    registrationId: string,
    totalAmount: number,
    numberOfInstallments: number,
    startDate: Date
  ): Promise<CourseFeeInstallment[]> {
    const installments: CourseFeeInstallment[] = [];
    const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);
    const remainder =
      totalAmount - installmentAmount * (numberOfInstallments - 1);

    for (let i = 1; i <= numberOfInstallments; i++) {
      const amount = i === numberOfInstallments ? remainder : installmentAmount;
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      const installment = await this.createInstallment({
        registration_id: registrationId,
        installment_number: i,
        amount: amount,
        due_date: dueDate,
        status: "pending",
      });

      installments.push(installment);
    }

    return installments;
  }
}



