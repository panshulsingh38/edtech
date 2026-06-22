import fs from 'fs';
import path from 'path';
import { QuestionSet } from './ai-engine';

// Use a local JSON file to mock the database
const DB_FILE_PATH = path.join(process.cwd(), 'mock-db.json');

interface DatabaseSchema {
  tests: Array<{
    id: string;
    createdAt: string;
    data: QuestionSet;
  }>;
}

/**
 * Initializes the mock database file if it doesn't exist.
 */
function initDB() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialData: DatabaseSchema = { tests: [] };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

/**
 * Saves a generated test (QuestionSet) into the mock database.
 *
 * @param test The generated QuestionSet object
 * @returns The unique ID of the saved test
 */
export async function saveTestToDB(test: QuestionSet): Promise<string> {
  initDB();
  const dbData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
  const db: DatabaseSchema = JSON.parse(dbData);

  const newTestEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    data: test,
  };

  db.tests.push(newTestEntry);
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');

  return newTestEntry.id;
}

/**
 * Retrieves a test from the mock database by ID.
 *
 * @param id The ID of the test to retrieve
 * @returns The test object or null if not found
 */
export async function getTestFromDB(id: string): Promise<QuestionSet | null> {
  initDB();
  const dbData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
  const db: DatabaseSchema = JSON.parse(dbData);

  const testEntry = db.tests.find(t => t.id === id);
  return testEntry ? testEntry.data : null;
}
