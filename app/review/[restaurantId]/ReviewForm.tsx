"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={
        filled ? "h-8 w-8 fill-accent" : "h-8 w-8 fill-none stroke-line"
      }
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5z" />
    </svg>
  );
}

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/restaurants/${restaurantId}`)
      .then((response) => (response.ok ? response.json() : Promise.reject("failed")))
      .then((data: { name: string }) => {
        if (!cancelled) setRestaurantName(data.name);
      })
      .catch(() => {
        if (!cancelled) setError("This restaurant could not be loaded.");
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const canSubmit = rating !== null && comment.trim() !== "" && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      if (response.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }

      if (response.status === 400) {
        const data = await response.json();
        setError(data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-16">
      <h1 className="text-2xl font-medium tracking-tight">
        {restaurantName ?? "Loading…"}
      </h1>
      <p className="mt-1 text-sm text-muted">Leave a review</p>

      <form onSubmit={handleSubmit} className="mt-10">
        <fieldset>
          <legend className="text-xs font-medium tracking-wide text-muted uppercase">
            Your rating
          </legend>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                aria-pressed={rating === value}
                className="rounded-md p-1 outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Star filled={rating !== null && value <= rating} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8">
          <label
            htmlFor="comment"
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Your review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you think?"
            className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] leading-relaxed outline-offset-2 focus:border-accent focus-visible:outline-2 focus-visible:outline-accent"
          />
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-8 rounded-lg bg-accent px-4 py-2.5 text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
