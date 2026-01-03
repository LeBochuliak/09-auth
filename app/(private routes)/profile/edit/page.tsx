"use client";

import css from "@/components/EditProfilePage/EditProfilePage.module.css";
import Image from "next/image";
import { updateMe } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function EditProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const username = (formData.get("username") as string) ?? "";
    console.log(username);
    await updateMe({ username });

    setUser({
      username,
      email: user?.email as string,
      avatar: user?.avatar as string,
    });
    router.push("/profile");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={user?.avatar as string}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} action={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              name="username"
              id="username"
              type="text"
              className={css.input}
              defaultValue={user?.username}
            />
          </div>

          <p>Email: {user?.email}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton}>
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
