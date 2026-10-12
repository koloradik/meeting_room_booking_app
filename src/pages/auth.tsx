import AuthForm from "@/components/Auth/AuthForm";
import Heading from "@/components/Auth/Heading";
import Tabs from "@/components/Auth/Tabs";
import { auth, db } from "@/lib/firebase";
import axios from "axios";
import { parseCookie } from "cookie";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface FormData {
  name?: string;
  email: string;
  password: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { reset } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError("");

    try {
      let userCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );
      }

      const idToken = await userCredential.user.getIdToken();
      const response = await axios.post("/api/user/auth/login", { idToken });
      if (response.status !== 200)
        throw new Error("Failed to establish server session");

      if (!isLogin) {
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            name: data.name ?? "",
            email: data.email,
            role: "user",
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.error("Firestore write failed:", e);
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      let readableError = "An unexpected error occurred";

      if (
        err.code === "auth/email-already-in-use" ||
        err.message?.includes("EMAIL_EXISTS")
      ) {
        readableError = "This email address is already in use.";
      } else if (err.code === "auth/weak-password") {
        readableError = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        readableError = "The email address is badly formatted.";
      } else {
        readableError = err.message?.replace("Firebase: ", "") || readableError;
      }

      setError(readableError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans antialiased p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
        <Tabs
          isLogin={isLogin}
          setError={setError}
          setIsLogin={(val) => {
            setIsLogin(val);
            reset();
          }}
        />

        <Heading isLogin={isLogin} />

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        <AuthForm isLogin={isLogin} loading={loading} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = parseCookie(context.req.headers.cookie || "");
  const session = cookies.__session;

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
