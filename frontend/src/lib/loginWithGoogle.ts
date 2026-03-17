import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

export type GoogleLoginResult = {
  idToken: string;
  user: { uid: string; email: string | null; displayName: string | null };
};

/**
 * Firebase Auth popup - tránh lỗi origin_mismatch của GSI.
 * Hoạt động trên ecorent.site vì Firebase cho phép nhiều authorized domains.
 */
export async function loginWithGoogle(): Promise<GoogleLoginResult> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase chưa được cấu hình. Kiểm tra NEXT_PUBLIC_FIREBASE_API_KEY trong .env"
    );
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();

  return {
    idToken: token,
    user: {
      uid: result.user.uid,
      email: result.user.email ?? null,
      displayName: result.user.displayName ?? null,
    },
  };
}
