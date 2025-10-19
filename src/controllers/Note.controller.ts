import { Request, Response } from "express";
import Note, { NoteDTO } from "@/models/Note.model";
import { AppError } from "@/utils";
import { log, loggerFor, loggerForContext } from "@/lib/loggers";

type NoteParams = {
  noteId: string;
};

const logger = loggerForContext(loggerFor("notes"), {
  component: "controller",
  entityType: "note",
});

export class NoteController {
  static createNote = async (
    req: Request<{}, {}, Pick<NoteDTO, "content">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { content } = req.body;
      const note = new Note({
        content,
        createdBy: req.user!.id,
        task: req.task.id,
      });
      req.task.notes.push(note.id);
      await Promise.allSettled([req.task.save(), note.save()]);
      log(
        logger,
        "info",
        `User ${req.user?.id} created a note for task ID: ${req.task.id}`,
        {
          entityId: note.id,
          entityType: "note",
          operation: "create",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success(null, 201);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error creating note for task ID: ${req.task.id}`,
        {
          entityType: "note",
          operation: "create",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      const notes = await Note.find({ task: req.task.id });
      log(
        logger,
        "info",
        `User ${req.user?.id} fetched notes for task ID: ${req.task.id}`,
        {
          entityId: req.task.id,
          operation: "list",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success(notes, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error fetching notes for task ID: ${req.task.id}`,
        {
          entityId: req.task.id,
          operation: "list",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static editNote = async (
    req: Request<NoteParams, {}, Pick<NoteDTO, "content">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { noteId } = req.params;
      const { content } = req.body;
      const note = await Note.findById(noteId).populate({
        path: "createdBy",
        select: "_id name email",
      });

      if (
        !note ||
        !note.task.equals(req.task.id) ||
        !req.task.notes.includes(note.id)
      )
        throw new AppError("NOTE_NOT_FOUND");

      if (!note.createdBy.equals(req.user!.id))
        throw new AppError("UNAUTHORIZED_ACTION");

      note.content = content;
      await note.save();

      log(
        logger,
        "info",
        `User ${req.user?.id} edited note ID: ${note.id} for task ID: ${req.task.id}`,
        {
          entityId: note.id,
          operation: "update",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success(note, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error editing note ID: ${req.params.noteId} for task ID: ${req.task.id}`,
        {
          entityId: req.params.noteId,
          operation: "update",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const start = Date.now();
    try {
      const { noteId } = req.params;
      const note = await Note.findById(noteId);

      if (
        !note ||
        !note.task.equals(req.task.id) ||
        !req.task.notes.includes(note.id)
      )
        throw new AppError("NOTE_NOT_FOUND");

      if (!note.createdBy.equals(req.user!.id))
        throw new AppError("UNAUTHORIZED_ACTION");

      req.task.notes = req.task.notes.filter((nId) => !nId.equals(note.id));
      await Promise.allSettled([req.task.save(), note.deleteOne()]);

      log(
        logger,
        "info",
        `User ${req.user?.id} deleted note ID: ${note.id} from task ID: ${req.task.id}`,
        {
          entityId: note.id,
          operation: "delete",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success(null, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error deleting note ID: ${req.params.noteId} from task ID: ${req.task.id}`,
        {
          entityId: req.params.noteId,
          operation: "delete",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
