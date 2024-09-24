import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for UUID validation
const uuidSchema = z.string().uuid("Invalid UUID format");

// Schema for creating and updating an event
const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z
    .number()
    .int()
    .positive("Date must be a valid timestamp")
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid timestamp",
    }),
  venue: z.string().min(1, "Venue is required"),
  imageUrl: z.string().url().optional(),
  categoryId: uuidSchema, // Mandatory and must be a valid UUID
  subcategoryId: uuidSchema, // Mandatory and must be a valid UUID
  contactPhone: z.string().min(1, "Contact phone is required").optional(),
  contactEmail: z.string().email("Invalid email format").optional(),
});

// Create a new event
export const createEvent = async (req, res) => {
  try {
    // Parse and validate request body
    const parsedData = createEventSchema.parse(req.body);

    // Check if the category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parsedData.categoryId },
    });
    if (!categoryExists) {
      return res.status(404).json({
        message: `Category with ID ${parsedData.categoryId} does not exist`,
      });
    }

    // Check if the subcategory exists
    const subcategoryExists = await prisma.subcategory.findUnique({
      where: { id: parsedData.subcategoryId },
    });
    if (!subcategoryExists) {
      return res.status(404).json({
        message: `Subcategory with ID ${parsedData.subcategoryId} does not exist`,
      });
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        ...parsedData,
        date: new Date(parsedData.date),
      },
    });

    // Return the created event
    res.json(event);
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

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        category: true,
        subcategory: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Get an event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the event ID
    const validId = uuidSchema.safeParse(id);
    if (!validId.success) {
      return res.status(400).json({ message: "Valid Event ID is required" });
    }

    // Retrieve the event
    const event = await prisma.event.findUnique({
      where: { id: validId.data },
      include: {
        category: true,
        subcategory: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the event ID
    const validId = uuidSchema.safeParse(id);
    if (!validId.success) {
      return res.status(400).json({ message: "Valid Event ID is required" });
    }

    // Parse and validate request body
    const parsedData = createEventSchema.parse(req.body);

    // Update the event
    const event = await prisma.event.update({
      where: { id: validId.data },
      data: {
        ...parsedData,
        date: new Date(parsedData.date),
      },
    });

    res.json(event);
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

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the event ID
    const validId = uuidSchema.safeParse(id);
    if (!validId.success) {
      return res.status(400).json({ message: "Valid Event ID is required" });
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: validId.data },
    });

    res.json({ message: "Event deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Get events by category and/or subcategory
export const getEventsByCategoryAndSubcategory = async (req, res) => {
  try {
    const schema = z.object({
      categoryId: uuidSchema.optional(),
      subcategoryId: uuidSchema.optional(),
    });

    // Parse and validate query parameters
    const { categoryId, subcategoryId } = schema.parse(req.query);

    // Retrieve events based on category and/or subcategory
    const events = await prisma.event.findMany({
      where: {
        categoryId: categoryId || undefined,
        subcategoryId: subcategoryId || undefined,
      },
      include: {
        category: true,
        subcategory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(events);
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
