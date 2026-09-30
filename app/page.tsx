import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-16">
      <h1 className="text-2xl font-medium tracking-tight">Zomato Lite is alive.</h1>
      <p className="mt-12">
        <Link
          href="/restaurant/1"
          className="text-sm text-accent underline underline-offset-4"
        >
          Ludhiana Burrito
        </Link>
      </p>
    </main>
  );
}
