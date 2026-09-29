"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type Restaurant = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

type State = "loading" | "ready" | "missing" | "error";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={
        filled
          ? "h-3.5 w-3.5 fill-accent"
          : "h-3.5 w-3.5 fill-none stroke-line"
      }
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} filled={value <= rating} />
      ))}
    </span>
  );
}

export default function RestaurantView({ restaurantId }: { restaurantId: string }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    fetch(`/api/restaurants/${restaurantId}`)
      .then((response) => {
        if (response.status === 404) return Promise.reject("missing");
        if (!response.ok) return Promise.reject("error");
        return response.json();
      })
      .then((data: Restaurant) => {
        if (cancelled) return;
        setRestaurant(data);
        setState("ready");
      })
      .catch((reason) => {
        if (cancelled) return;
        setState(reason === "missing" ? "missing" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  if (state === "loading") {
    return <p className="mx-auto w-full max-w-[560px] px-6 py-16 text-sm text-muted">Loading…</p>;
  }

  if (state === "missing") {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-16">
        <h1 className="text-xl font-medium">Restaurant not found</h1>
      </main>
    );
  }

  if (state === "error" || !restaurant) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-16">
        <h1 className="text-xl font-medium">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          This page could not reach the restaurant. Please try again.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-16">
      <header>
        <h1 className="text-2xl font-medium tracking-tight">{restaurant.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      <section className="mt-10 flex items-baseline gap-3">
        <span className="text-6xl font-medium leading-none tabular-nums">
          {restaurant.averageRating}
        </span>
        <span className="text-sm text-muted">
          {restaurant.totalReviews === 1 ? "1 review" : `${restaurant.totalReviews} reviews`}
        </span>
      </section>

      {restaurant.totalReviews === 0 ? (
        <section className="mt-10 rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-foreground">No reviews yet.</p>
          <p className="mt-1 text-sm text-muted">
            Be the first person to review this restaurant.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-10 rounded-lg border border-line bg-white p-5">
            <p className="text-xs font-medium tracking-wide text-accent uppercase">
              Most recent
            </p>
            {restaurant.latestReview && (
              <>
                <div className="mt-3">
                  <Stars rating={restaurant.latestReview.rating} />
                </div>
                <p className="mt-2 text-[15px] leading-relaxed">
                  {restaurant.latestReview.comment}
                </p>
              </>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
              Earlier reviews
            </h2>
            <ul className="mt-4 divide-y divide-line">
              {restaurant.reviews.map((review) => (
                <li key={review.id} className="py-5">
                  <Stars rating={review.rating} />
                  <p className="mt-2 text-[15px] leading-relaxed">{review.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-12">
        <Link
          href={`/review/${restaurantId}`}
          className="text-sm text-accent underline underline-offset-4"
        >
          Write a review
        </Link>
      </p>
    </main>
  );
}
