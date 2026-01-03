import css from "../components/Home/Home.module.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist on Note Hub.",
  openGraph: {
    title: `Page Not Found`,
    description: "The page you are looking for does not exist on Note Hub.",
    siteName: "Note Hub",
    images: [
      {
        url: "/images/not-found.png",
        width: 1200,
        height: 630,
        alt: "Note Hub",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <div className={css.container}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>

      <Link href="/">Go back home</Link>
    </div>
  );
}
