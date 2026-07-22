import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const JWT_SECRET =
  process.env.SESSION_SECRET ?? "mawibo-dev-secret-please-change-in-production";
const JWT_EXPIRES_IN = "30d";

const AVATAR_COLORS = [
  "#3A7BD5",
  "#6FCF97",
  "#7C5DB8",
  "#E07A5F",
  "#E0A800",
  "#5C97E0",
  "#27AE60",
  "#E03E3E",
];

interface JWTPayload {
  userId: string;
}

interface ServerUser {
  id: string;
  username: string;
  email: string;
  county: string;
  bio: string;
  avatarColor: string;
  joinedAt: number;
}

function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies JWTPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

function toPublic(u: typeof users.$inferSelect): ServerUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    county: u.county,
    bio: u.bio,
    avatarColor: u.avatarColor,
    joinedAt: u.createdAt.getTime(),
  };
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      county = "",
    } = req.body as {
      username: string;
      email: string;
      password: string;
      county?: string;
    };

    if (!username?.trim() || !email?.trim() || !password) {
      res
        .status(400)
        .json({ error: "Username, email, and password are required." });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
      return;
    }

    const emailLower = email.trim().toLowerCase();

    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existingEmail) {
      res
        .status(409)
        .json({ error: "An account with this email already exists." });
      return;
    }

    const [existingUsername] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username.trim()))
      .limit(1);

    if (existingUsername) {
      res.status(409).json({ error: "That username is already taken." });
      return;
    }

    const totalUsers = await db.select({ id: users.id }).from(users);
    const avatarColor =
      AVATAR_COLORS[totalUsers.length % AVATAR_COLORS.length]!;

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username: username.trim(),
        email: emailLower,
        passwordHash,
        county: county.trim(),
        avatarColor,
      })
      .returning();

    if (!newUser) {
      res.status(500).json({ error: "Failed to create account." });
      return;
    }

    const token = signToken(newUser.id);
    res.status(201).json({ user: toPublic(newUser), token });
  } catch (err) {
    req.log.error({ err }, "Register failed");
    res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email?.trim() || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (!found) {
      res.status(401).json({ error: "No account found with that email." });
      return;
    }

    const valid = await bcrypt.compare(password, found.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }

    const token = signToken(found.id);
    res.json({ user: toPublic(found), token });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }

    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!found) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({ user: toPublic(found) });
  } catch (err) {
    req.log.error({ err }, "Auth me failed");
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// PATCH /api/auth/me — update profile fields
router.patch("/me", async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }

    const { bio, county, avatarColor } = req.body as {
      bio?: string;
      county?: string;
      avatarColor?: string;
    };

    const updates: Partial<typeof users.$inferInsert & { updatedAt: Date }> =
      { updatedAt: new Date() };
    if (bio !== undefined) updates.bio = bio;
    if (county !== undefined) updates.county = county;
    if (avatarColor !== undefined) updates.avatarColor = avatarColor;

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, payload.userId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({ user: toPublic(updated) });
  } catch (err) {
    req.log.error({ err }, "Update user failed");
    res.status(500).json({ error: "Failed to update user." });
  }
});

export default router;
