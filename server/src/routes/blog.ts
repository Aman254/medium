import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();
blogRouter.use("/*", async (c, next) => {
  const authHeader: string = c.req.header("authorization") || "";

  try {
    // Verify JWT token
    const user = await verify(authHeader, c.env.JWT_SECRET);

    if (user && typeof user === "object" && "id" in user) {
      c.set("userId", user.id as string); // Set userId in context
      await next(); // Proceed to the next middleware/route
    } else {
      // If user is not found or token is invalid
      c.status(403);
      return c.json({
        message: "You are not logged in",
      });
    }
  } catch (e) {
    // Handle token verification errors
    c.status(403);
    return c.json({
      message: "You are not logged in",
    });
  }
});

/** Blog Route */
blogRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const authorId = c.get("userId") as string; // Ensure userId is a string
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Create blog post with Prisma
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });

    // Return the created blog post ID
    return c.json({
      id: blog.id,
    });
  } catch (err) {
    console.error("Error creating blog:", err);

    // Return an error response
    return c.json({ error: "Failed to create blog post" }, 500);
  }
});

/**Blog Route */
blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const blog = await prisma.blog.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    id: blog.id,
  });
});

/**Blog Route */
blogRouter.get("/get/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const blog = await prisma.blog.findFirst({
    where: {
      id: Number(id),
    },
  });

  return c.json({
    blog,
  });
});

/**Blog Route */
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.blog.findMany();

  return c.json({ blogs });
});
