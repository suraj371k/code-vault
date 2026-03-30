
export const getCollections = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);
    if (!organizationId) {
      return res.status(400).json({ success: false, message: "organization id is required" });
    }
    const collections = await prisma.collection.findMany({
      where: { organizationId },
      include: { snippets: { select: { id: true } } },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error(`error in getCollections: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addExistingSnippetToCollection = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);
    const colId = Number(req.params.colId);
    if (!snippetId || !colId) {
      return res.status(400).json({ success: false, message: "snippetId and colId are required" });
    }
    const updated = await prisma.snippet.update({
      where: { id: snippetId },
      data: { collections: { connect: { id: colId } } },
      include: { collections: { select: { id: true, name: true } } },
    });
    return res.status(200).json({ success: true, message: "Added to collection", data: updated });
  } catch (error) {
    console.error(`error in addExistingSnippetToCollection: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const removeFromFav = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);
    if (!snippetId) {
      return res.status(400).json({ success: false, message: "snippet id is required" });
    }
    const updated = await prisma.snippet.update({
      where: { id: snippetId },
      data: { isFav: false },
    });
    return res.status(200).json({ success: true, message: "Removed from favourites", data: updated });
  } catch (error) {
    console.error(`error in removeFromFav: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
