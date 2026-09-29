import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "The database is not configured." }, { status: 500 });
  }
  const sql = neon(process.env.DATABASE_URL);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const { restaurantId, rating, comment } = (body ?? {}) as Record<string, unknown>;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 },
    );
  }

  if (typeof comment !== "string" || comment.trim() === "") {
    return Response.json({ error: "Comment must not be empty." }, { status: 400 });
  }

  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return Response.json(
      { error: "Restaurant must be a whole number id." },
      { status: 400 },
    );
  }

  const existing = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (existing.length === 0) {
    return Response.json({ error: "That restaurant does not exist." }, { status: 400 });
  }

  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return Response.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
}
