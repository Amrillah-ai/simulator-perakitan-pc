import { db } from './index.ts';
import { users, examResults } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function saveExamResult(data: {
  userId: number;
  studentName: string;
  studentClass: string;
  scenarioId: string;
  scenarioTitle: string;
  scoreTotal: number;
  scoreSop: number;
  scoreSafety: number;
  scoreAccuracy: number;
  scorePost: number;
  timeSpentSeconds: number;
  grade: string;
  feedback?: string;
}) {
  try {
    const result = await db.insert(examResults)
      .values(data)
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in saveExamResult:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserExamResults(userId: number) {
  try {
    return await db.select().from(examResults).where(eq(examResults.userId, userId)).orderBy(desc(examResults.createdAt));
  } catch (error) {
    console.error('Database query failed in getUserExamResults:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
