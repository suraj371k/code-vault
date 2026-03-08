import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createSnippets = async (req: Request, res: Response) => {
  try {
    const userId = await (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const { title, code, category, language } = req.body;

    if (!title || !code) {
      return res
        .status(400)
        .json({ success: false, message: "missing required fields" });
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        category,
        language,
        summary: req.body.summary || "",
        created_at: new Date(),
        author: {
          connect: { id: userId },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "snippet created successfully!",
      data: snippet,
    });
  } catch (error) {
    console.log(`error in create snippets controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getSnippetsByUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "not authorize" });
    }

    const snippets = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        snippets: true,
      },
    });

    return res.status(200).json({success: true , message: "snippets fetched successfully" , data: snippets})
  } catch (error) {
    console.log(`error in get snipptes controller ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
