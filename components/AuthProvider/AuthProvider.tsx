"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession, getMe } from "@/lib/api/clientApi";
import { usePathname, useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import cssLoader from "@/components/Loader/Loader.module.css";

type Props = {
  children: React.ReactNode;
};

const privateRoutes = ["/profile", "/notes"];

export default function AuthProvider({ children }: Props) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated
  );
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const isAuthenticated = await checkSession();
      if (isAuthenticated) {
        const user = await getMe();
        if (user) setUser(user);
      } else {
        clearIsAuthenticated();
        if (isPrivateRoute) {
          router.replace("/profile/login");
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [pathname, setUser, clearIsAuthenticated, router, isPrivateRoute]);

  if (loading) {
    return (
      <div className={cssLoader.backdrop}>
        <ClipLoader />
      </div>
    );
  }

  if (isPrivateRoute && !isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
