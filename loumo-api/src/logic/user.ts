import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "../../generated/prisma";
import { config } from "../configs";
import { sendMail } from "../services/email";

const prisma = new PrismaClient();

function generateOTP(length = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

export class UserLogic {
  // Register a new user (with account verification OTP)
  async register(
    data: Omit<User, "id"> & {
      addressList?: number[];
    }
  ): Promise<User> {
    const { email, name, password, addressList } = data;
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    // Save OTP and set verified to false

    // sendMail({to:email,subject:"New Account Creation",""})

    return prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        verified: false,
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
        addresses: addressList
          ? {
              connect: addressList.map((roleId) => ({ id: roleId })),
            }
          : {},
      },
    });
  }

  // Verify account with OTP
  async verifyAccount(email: string, otp: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.verified ||
      user.verificationOtp !== otp ||
      !user.verificationOtpExpires ||
      user.verificationOtpExpires < new Date()
    ) {
      return false;
    }
    await prisma.user.update({
      where: { email },
      data: {
        verified: true,
        verificationOtp: null,
        verificationOtpExpires: null,
      },
    });
    return true;
  }

  // Request password recovery (send OTP)
  async requestPasswordRecovery(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return false;
    const otp = generateOTP();
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetOtp: otp,
        passwordResetOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
      },
    });
    // Send OTP via email here (implementation omitted)
    await sendMail({
      to: "kenfackjordanjunior@gmail.com",
      subject: "This is your password",
      html: `<h1>Hello!</h1><p>Your account was created successfully.</p>`,
    });

    return true;
  }

  // Reset password with OTP
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.passwordResetOtp !== otp ||
      !user.passwordResetOtpExpires ||
      user.passwordResetOtpExpires < new Date()
    ) {
      return false;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        passwordResetOtp: null,
        passwordResetOtpExpires: null,
      },
    });
    return true;
  }

  // Authenticate user (login)
  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.verified) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    const token = jwt.sign({ userId: user.id }, config.JWT.SECRET, {
      expiresIn: "1d",
    });
    return { user, token };
  }

  // Get user by ID
  async getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { favorite: true, orders: true },
    });
  }

  // Get user by ID
  async getUserPermissionById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  // Update user
  async updateUser(
    id: number,
    data: Partial<User> & { productIds?: number[] }
  ): Promise<User | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const { productIds, ...userData } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        favorite: productIds
          ? {
              connect: productIds.map((id) => ({ id })),
            }
          : {},
      },
    });
  }

  async assignRole(id: number, roleId: number): Promise<User | null> {
    return prisma.user.update({
      where: { id },
      data: {
        role: {
          connect: {
            id: roleId,
          },
        },
      },
    });
  }

  // Delete user
  async deleteUser(id: number): Promise<User | null> {
    return prisma.user.delete({ where: { id } });
  }

  // List all users with optional query parameters for filtering and pagination
  async listUsers(query?: {
    email?: string;
    name?: string;
    verified?: boolean;
    skip?: number;
    take?: number;
    roleD?: boolean;
    permissionsD?: boolean;
    addressD?: boolean;
    notifD?: boolean;
    logD?: boolean;
    ordersD?: boolean;
  }): Promise<User[]> {
    const {
      email,
      name,
      verified,
      skip,
      take,
      roleD,
      permissionsD,
      addressD,
      notifD,
      logD,
      ordersD,
    } = query || {};
    return prisma.user.findMany({
      where: {
        ...(email && { email: { contains: email } }),
        ...(name && { name: { contains: name } }),
        ...(typeof verified === "boolean" && { verified }),
      },
      skip,
      take,
      include: {
        ...(roleD && {
          role: {
            include: {
              permissions: permissionsD ?? false,
            },
          },
        }),
        ...(addressD && { addresses: true }),
        ...(notifD && { notifications: true }),
        ...(logD && { logs: true }),
        ...(ordersD && { orders: true }),
      },
    });
  }
}
