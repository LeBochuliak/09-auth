import css from "@/components/CreateNote/CreateNote.module.css";
import NoteForm from "@/components/NoteForm/NoteForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Note",
  description: "Form component for creating a new note",
  openGraph: {
    title: `Create Note`,
    description: "Form component for creating a new note",
    url: `https://08-zustand-lenas-projects-10306a6a.vercel.app/notes/action/create`,
    siteName: "Note Hub",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Note Hub",
      },
    ],
  },
};

export default async function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}
