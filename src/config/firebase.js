import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let firebaseAuth = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let serviceAccount;

    if (typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string") {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    }

    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
        });

    firebaseAuth = getAuth(app);
    console.log("[Firebase Admin] Khởi tạo thành công cho project:", serviceAccount.project_id);
  } else {
    console.warn("[Firebase Warning] Thiếu biến FIREBASE_SERVICE_ACCOUNT.");
  }
} catch (error) {
  console.error("[Firebase Warning] Khởi tạo không thành công Firebase Admin:", error.message);
}

export default firebaseAuth;
