import { BaseRepository } from "./BaseRepository";
import { User } from "../types";
import { NotFoundError } from "../utils/errors";

export class UserRepository extends BaseRepository {
  async findById(id: number): Promise<User | null> {
    const sql = `
      SELECT id, email, password, "firstName", "lastName", role, phone, address, 
             specialization, bio, experience, "profileImage", "createdAt", "updatedAt"
      FROM users 
      WHERE id = $1
    `;
    return this.queryOne<User>(sql, [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT id, email, password, "firstName", "lastName", role, phone, address, 
             specialization, bio, experience, "profileImage", "createdAt", "updatedAt"
      FROM users 
      WHERE email = $1
    `;
    return this.queryOne<User>(sql, [email]);
  }

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const sql = `
      INSERT INTO users (email, password, "firstName", "lastName", role, phone, address, 
                        specialization, bio, experience)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;

    const result = await this.query<{ id: number }>(sql, [
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.role,
      userData.phone || null,
      userData.address || null,
      userData.specialization || null,
      userData.bio || null,
      userData.experience || null,
    ]);

    const lastID = result[0]?.id;
    if (!lastID) {
      throw new NotFoundError("Failed to create user");
    }

    const user = await this.findById(lastID);
    if (!user) {
      throw new NotFoundError("Failed to create user");
    }

    return user;
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const { clause, params } = this.buildUpdateClause(updateData);

    if (!clause) {
      throw new Error("No valid fields to update");
    }

    const sql = `UPDATE users SET ${clause}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $${
      params.length + 1
    }`;
    const { changes } = await this.execute(sql, [...params, id]);

    if (changes === 0) {
      throw new NotFoundError("User not found");
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateProfile(
    id: number,
    profileData: {
      firstName: string;
      lastName: string;
      phone?: string | null;
      address?: string | null;
      profileImage?: string | null;
    }
  ): Promise<User> {
    const sql = `
      UPDATE users 
      SET "firstName" = $1, "lastName" = $2, phone = $3, address = $4, "profileImage" = $5, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE id = $6
    `;

    const { changes } = await this.execute(sql, [
      profileData.firstName,
      profileData.lastName,
      profileData.phone,
      profileData.address,
      profileData.profileImage,
      id,
    ]);

    if (changes === 0) {
      throw new NotFoundError("User not found");
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async delete(id: number): Promise<void> {
    const sql = "DELETE FROM users WHERE id = $1";
    const { changes } = await this.execute(sql, [id]);

    if (changes === 0) {
      throw new NotFoundError("User not found");
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: Omit<User, "password">[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const total = await this.count("SELECT COUNT(*) as count FROM users");

    // Get users for current page
    const sql = `
      SELECT id, email, "firstName", "lastName", role, phone, address, 
             specialization, bio, experience, "createdAt", "updatedAt"
      FROM users 
      ORDER BY "createdAt" DESC 
      LIMIT $1 OFFSET $2
    `;

    const users = await this.query<Omit<User, "password">>(sql, [
      limit,
      offset,
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByRole(role: string): Promise<User[]> {
    const sql = `
      SELECT id, email, password, "firstName", "lastName", role, phone, address, 
             specialization, bio, experience, "createdAt", "updatedAt"
      FROM users 
      WHERE role = $1
      ORDER BY "createdAt" DESC
    `;
    return this.query<User>(sql, [role]);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count(
      "SELECT COUNT(*) as count FROM users WHERE email = $1",
      [email]
    );
    return count > 0;
  }
}

export const userRepository = new UserRepository();
