"use client";

import { useState, useId, useEffect } from "react";
import css from "./NoteForm.module.css";
import * as Yup from "yup";
import type { NoteTag, Note } from "../../types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useNoteDraftStore } from "@/lib/store/noteStore";

interface FormErrors {
  title?: string;
  content?: string;
  tag?: string;
}

type FormField = "title" | "content" | "tag";

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title is too long")
    .required("Title is required"),
  content: Yup.string().max(500, "Content is too long"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag")
    .required("Tag is required"),
});

type NoteFormValues = {
  title: string;
  content: string;
  tag: NoteTag;
};

export default function NoteForm() {
  const [values, setValues] = useState<NoteFormValues>({
    title: "",
    content: "",
    tag: "Todo",
  });

  const router = useRouter();

  const { draft, setDraft, clearDraft } = useNoteDraftStore();

  const [errors, setErrors] = useState<FormErrors>({});

  const fieldId = useId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!draft) return;

    setValues({
      title: draft.title ?? "",
      content: draft.content ?? "",
      tag: draft.tag ?? "Todo",
    });
  }, [draft]);

  const mutation = useMutation({
    mutationFn: (newNote: Note) => createNote(newNote),
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleSubmit = async (formData: FormData) => {
    try {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();
      const title = (formData.get("title") as string) ?? "";
      const content = (formData.get("content") as string) ?? "";
      const tag = (formData.get("tag") as NoteTag) ?? "Todo";

      await validationSchema.validate(
        { title, content, tag },
        { abortEarly: false }
      );

      mutation.mutate({
        id,
        title,
        content,
        tag,
        createdAt,
        updatedAt,
      });

      router.back();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: FormErrors = {};
        error.inner.forEach((error) => {
          if (error.path) {
            const field = error.path as FormField;
            newErrors[field] = error.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const validateField = async (name: string, value: string) => {
    try {
      await validationSchema.validateAt(name, { ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [name]: err.message }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
    setDraft({
      ...draft,
      [name]: value,
    });
  };

  const handleCancel = () => {
    router.back();
  };
  return (
    <form className={css.form} action={handleSubmit}>
      <div className={css.formGroup}>
        <label className={css.label} htmlFor={`${fieldId}-title`}>
          Title
        </label>
        <input
          value={values.title}
          onChange={handleChange}
          className={css.input}
          type="text"
          name="title"
          id={`${fieldId}-title`}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label className={css.label} htmlFor={`${fieldId}-content`}>
          Content
        </label>
        <textarea
          value={values.content}
          onChange={handleChange}
          className={css.textarea}
          rows={8}
          name="content"
          id={`${fieldId}-content`}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label className={css.label} htmlFor={`${fieldId}-tag`}>
          Tag
        </label>
        <select
          name="tag"
          id={`${fieldId}-tag`}
          className={css.select}
          onChange={handleChange}
          value={values.tag}
        >
          <option value="" disabled>
            Select tag
          </option>
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={
            mutation.isPending ||
            Object.values(errors).some(Boolean) ||
            !values.title ||
            !values.tag
          }
        >
          Create note
        </button>
      </div>
    </form>
  );
}
