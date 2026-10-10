
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firestore";

export interface ResumeHistoryRecord {
  id: string;
  userId: string;
  resumeFileName: string;
  analysis: unknown;
  aiFeedback: string;
  jobDescription: string;
  jobMatch: unknown;
  createdAt?: unknown;
}

export async function saveResumeHistory(
  record: Omit<ResumeHistoryRecord, "id" | "createdAt">,
): Promise<void> {
  await addDoc(collection(db, "resumeHistory"), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

export async function getResumeHistory(
  userId: string,
): Promise<ResumeHistoryRecord[]> {
  const historyQuery = query(
    collection(db, "resumeHistory"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(historyQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<ResumeHistoryRecord, "id">),
  }));
}
