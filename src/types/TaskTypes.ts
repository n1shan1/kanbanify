import { Id } from "./ColumnTypes";

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
};
