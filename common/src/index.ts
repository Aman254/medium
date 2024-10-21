import z from "zod";

export const signupInput = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createBlogInput = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateBlogInput = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
});

export type SignupInput = z.infer<typeof signupInput>;
export type LoginInput = z.infer<typeof loginInput>;
export type CreateBlogInput = z.infer<typeof createBlogInput>;
export type updateBlogInput = z.infer<typeof createBlogInput>;
