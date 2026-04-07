import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addExistingSnippetToCollection,
  addToFav,
  createCollection,
  createSnippets,
  createSnippetToCollection,
  deleteCollection,
  deleteSnippet,
  getAllLanguages,
  getCollections,
  getCollectionSnippets,
  getOrganizationSnippet,
  getSnippetById,
  removeFromFav,
  updateSnippets,
} from "../controllers/snippets.controller.js";

const router = Router();

// ── Snippet CRUD 
router.post("/:organizationId", authMiddleware, createSnippets);
router.get("/organization/:organizationId", authMiddleware, getOrganizationSnippet);
router.get("/:snippetId", authMiddleware, getSnippetById);
router.delete("/:snippetId", authMiddleware, deleteSnippet);
router.patch("/:snippetId", authMiddleware, updateSnippets);

// ── Languages 
router.get("/all/languages", getAllLanguages);

// ── Collections 
// List all collections for an org
router.get("/collections/:organizationId", authMiddleware, getCollections);

// Create a new collection
router.post("/collection/:organizationId", authMiddleware, createCollection);

// Create a brand-new snippet directly inside a collection
router.post("/collection/:colId/:orgId", authMiddleware, createSnippetToCollection);

// Fetch all snippets that belong to a collection
router.get("/collection/:colId", authMiddleware, getCollectionSnippets);

// Add an EXISTING snippet to an existing collection
router.patch("/:snippetId/collection/:colId", authMiddleware, addExistingSnippetToCollection);

// Delete a collection
router.delete("/collection/:colId", authMiddleware, deleteCollection);

// ── Favourites 
router.patch("/:snippetId/fav", authMiddleware, addToFav);
router.patch("/:snippetId/unfav", authMiddleware, removeFromFav);

export default router;
