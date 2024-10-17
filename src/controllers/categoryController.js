import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

// Create a new category
export const createCategory = async (req, res) => {
  try {
    // Validate the request body
    const parsedData = createCategorySchema.parse(req.body);

    // Check if the category already exists (case insensitive)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: parsedData.name,
          mode: "insensitive",
        },
      },
    });

    // If category exists, return a conflict status
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Category with this name already exists" });
    }

    // Create the new category
    const category = await prisma.category.create({
      data: parsedData,
    });

    // Return the created category as a response
    res.json(category);
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    } else {
      // Handle any other errors
      res
        .status(500)
        .json({ message: "Internal server error", details: error.message });
    }
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    // Retrieve all categories
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    // Handle any errors
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the UUID format
    const uuidSchema = z.string().uuid("Invalid UUID format");
    const validId = uuidSchema.safeParse(id);

    // If UUID is invalid, return a bad request status
    if (!validId.success) {
      return res.status(400).json({ message: "Valid Category ID is required" });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: validId.data },
    });

    // Return a success message
    res.json({ message: "Category deleted" });
  } catch (error) {
    // Handle any errors
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};
