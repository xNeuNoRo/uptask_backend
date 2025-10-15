import type { ErrorCode } from "@/utils/errors/handler";

// The module name can be any string,
// but we define some common ones here for convenience
export type ModuleName = "infra" | "auth" | "users" | "tasks" | "project";
type entityList = "user" | "project" | "task";

// Contextual information to include in log entries
export type LogContext = Partial<{
  entityType: entityList;
  entityId: string;
  entityTarget: entityList;
  entityTargetId: string;
  component:
    | "api"
    | "controller"
    | "service"
    | "repo"
    | "db"
    | "cache"
    | "queue"
    | "email"
    | "externalApi";
  operation:
    | "start"
    | "create"
    | "read"
    | "update"
    | "delete"
    | "send"
    | "list"
    | "other";
  durationMs?: number;
  status: "success" | "fail" | "partial";
  errorCode: ErrorCode;
}>;
