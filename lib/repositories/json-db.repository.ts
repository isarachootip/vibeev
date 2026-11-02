import fs from "node:fs";
import path from "node:path";
import {
  DatabaseStateSchema,
  type DatabaseState,
} from "../validations/charger.schema";
import { createInitialDatabaseState } from "./seed-data";

export interface ChargerRepository {
  readState(): DatabaseState;
  writeState(state: DatabaseState): void;
}

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "db.json");

export class JsonChargerRepository implements ChargerRepository {
  constructor(private readonly filePath: string = DEFAULT_DB_PATH) {}

  private ensureInitialized(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      const initial = createInitialDatabaseState();
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(initial, null, 2),
        "utf8"
      );
    }
  }

  readState(): DatabaseState {
    this.ensureInitialized();
    const rawContent = fs.readFileSync(this.filePath, "utf8");
    const parsedJson: unknown = JSON.parse(rawContent);
    const validated = DatabaseStateSchema.safeParse(parsedJson);

    if (!validated.success) {
      throw new Error(
        `Corrupted database state in ${this.filePath}: ${validated.error.message}`
      );
    }

    return validated.data;
  }

  writeState(state: DatabaseState): void {
    const validated = DatabaseStateSchema.parse(state);
    this.ensureInitialized();
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(validated, null, 2), "utf8");
    fs.renameSync(tempPath, this.filePath);
  }
}

export const defaultChargerRepository = new JsonChargerRepository();
