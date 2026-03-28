import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUniqueSlug } from "./organization.controller.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "user already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultOrganizationName = `${name}'s Organization`;

    const slug = await generateUniqueSlug(defaultOrganizationName);

    // create new user + default organization
    const newUser = await prisma.$transaction(async (tx) => {
      const createUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true
        },
      });

      await tx.organization.create({
        data: {
          name: defaultOrganizationName,
          slug,
          members: {
            create: {
              userId: createUser.id,
              role: "OWNER",
            },
          },
        },
      });
      return createUser;
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "5d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(201)
      .json({ success: true, message: "signup successfully", data: newUser });
  } catch (error) {
    console.log("error in signup controller: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "5d",
      },
    );

    //set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error(`error in login controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(`error in logout controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const profile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "not authorize" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(`error in profile controller ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
