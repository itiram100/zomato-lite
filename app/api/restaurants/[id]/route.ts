import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "The database is not configured." }, { status: 500 });
  }
  const sql = neon(process.env.DATABASE_URL);

  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const summary = await sql`
    SELECT
      r.name,
      r.cuisine,
      r.area,
      ROUND(AVG(rv.rating), 1) AS "averageRating",
      COUNT(rv.id) AS "totalReviews"
    FROM restaurants r
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    WHERE r.id = ${restaurantId}
    GROUP BY r.id, r.name, r.cuisine, r.area
  `;

  if (summary.length === 0) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const row = summary[0];

  const allReviews = await sql`
    SELECT id, rating, comment, created_at AS "createdAt"
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
  `;

  const [latestReview = null, ...olderReviews] = allReviews;

  return Response.json({
    name: row.name,
    cuisine: row.cuisine,
    area: row.area,
    averageRating: row.averageRating === null ? null : Number(row.averageRating),
    totalReviews: Number(row.totalReviews),
    latestReview,
    reviews: olderReviews,
  });
}
