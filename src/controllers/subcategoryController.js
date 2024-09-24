import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for UUID validation
const uuidSchema = z.string().uuid("Invalid UUID format");

// Schema for creating a subcategory
const createSubcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  categoryId: uuidSchema, // Category ID must be a valid UUID
});

// Create a new subcategory
export const createSubcategory = async (req, res) => {
  try {
    // Parse and validate request body
    const parsedData = createSubcategorySchema.parse(req.body);

    // Check if the subcategory already exists within the same category (case-insensitive)
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        name: {
          equals: parsedData.name,
          mode: "insensitive",
        },
        categoryId: parsedData.categoryId,
      },
    });

    if (existingSubcategory) {
      return res.status(409).json({
        message: "Subcategory with this name already exists in this category",
      });
    }

    // Create the new subcategory
    const subcategory = await prisma.subcategory.create({
      data: parsedData,
    });

    // Return the created subcategory as a response
    res.json(subcategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    } else {
      res
        .status(500)
        .json({ message: "Internal server error", details: error.message });
    }
  }
};

// Get all subcategories with their category details
export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: {
          select: {
            id: true, // Select the category ID
            name: true, // Select the category name
          },
        },
      },
    });
    res.json(subcategories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Delete a subcategory by ID
export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the subcategory ID
    const validId = uuidSchema.safeParse(id);

    if (!validId.success) {
      return res
        .status(400)
        .json({ message: "Valid Subcategory ID is required" });
    }

    // Delete the subcategory
    await prisma.subcategory.delete({
      where: { id: validId.data },
    });

    res.json({ message: "Subcategory deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Get subcategories by category ID with category details
export const getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Validate the category ID
    const validCategoryId = uuidSchema.safeParse(categoryId);

    if (!validCategoryId.success) {
      return res.status(400).json({ message: "Valid Category ID is required" });
    }

    // Retrieve subcategories for the specified category with category details
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: validCategoryId.data },
      include: {
        category: {
          select: {
            id: true, // Select the category ID
            name: true, // Select the category name
          },
        },
      },
    });

    res.json(subcategories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};
