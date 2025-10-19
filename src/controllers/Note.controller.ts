import { Request, Response } from "express";
import Note, { NoteDTO } from "@/models/Note.model";
import { AppError } from "@/utils";

type NoteParams = {
  noteId: string;
};

export class NoteController {
  static createNote = async (
    req: Request<{}, {}, Pick<NoteDTO, "content">>,
    res: Response,
  ) => {
    try {
      const { content } = req.body;
      const note = new Note({
        content,
        createdBy: req.user!.id,
        task: req.task.id,
      });
      req.task.notes.push(note.id);
      await Promise.allSettled([req.task.save(), note.save()]);
      res.success(null, 201);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({ task: req.task.id });
      res.success(notes, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static editNote = async (
    req: Request<NoteParams, {}, Pick<NoteDTO, "content">>,
    res: Response,
  ) => {
    try {
      const { noteId } = req.params;
      const { content } = req.body;
      const note = await Note.findById(noteId);

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
      res.success(note, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
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
      res.success(null, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
