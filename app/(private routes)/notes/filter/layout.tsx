import css from "@/components/LayoutNotes/LayoutNotes.module.css";
import { Metadata } from "next";

type LayoutNotesProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Notes",
  description: "Note Hub - organize, manage, and share your notes easily.",
};

export default function LayoutNotes({ children, sidebar }: LayoutNotesProps) {
  return (
    <section className={css.container}>
      <aside className={css.sidebar}>{sidebar}</aside>
      <div className={css.notesWrapper}>{children}</div>
    </section>
  );
}
