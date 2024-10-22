import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for UUID validation
const uuidSchema = z.string().uuid("Invalid UUID format");

// Helper function to parse the date
const parseDate = (dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date;
};

// Schema for creating and updating an event
const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.union([
    z.number().int().positive("Date must be a valid timestamp"),
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date string format",
    }),
  ]),
  venue: z.string().min(1, "Venue is required"),
  imageUrl: z.string().url().nullable().optional(), // Allows null, empty, or valid URL
  categoryId: uuidSchema, // Mandatory and must be a valid UUID
  subcategoryId: uuidSchema, // Mandatory and must be a valid UUID
  contactPhone: z.string().min(8, "Contact phone is required").optional(),
  contactEmail: z.string().email("Invalid email format").optional(),
});

// Helper function to include related category and subcategory
const includeCategoryAndSubcategory = {
  category: true,
  subcategory: true,
};

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

    // Parse the date to a Date object
    const eventDate = typeof parsedData.date === "number" 
      ? new Date(parsedData.date)
      : parseDate(parsedData.date);

    // Create the event
    const event = await prisma.event.create({
      data: {
        ...parsedData,
        date: eventDate,
      },
      include: includeCategoryAndSubcategory, // Include related data
    });

    // Return the created event with category and subcategory
    res.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation Error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal server error", details: error.message });
    }
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: includeCategoryAndSubcategory, // Include related data
      orderBy: { createdAt: "desc" },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", details: error.message });
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
      include: includeCategoryAndSubcategory, // Include related data
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", details: error.message });
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

    // Parse the date to a Date object
    const eventDate = typeof parsedData.date === "number" 
      ? new Date(parsedData.date)
      : parseDate(parsedData.date);

    // Update the event
    const event = await prisma.event.update({
      where: { id: validId.data },
      data: {
        ...parsedData,
        date: eventDate,
      },
      include: includeCategoryAndSubcategory, // Include related data
    });

    res.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation Error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal server error", details: error.message });
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
    res.status(500).json({ message: "Internal server error", details: error.message });
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
      include: includeCategoryAndSubcategory, // Include related data
      orderBy: { createdAt: "desc" },
    });

    res.json(events);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation Error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal server error", details: error.message });
    }
  }
};
