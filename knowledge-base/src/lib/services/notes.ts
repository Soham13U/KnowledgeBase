import {prisma} from "@/lib/db/prisma"

export type CreateNoteInput =
{
    title: string;
    content?: string;
    tagIds?: number[];
}

export type UpdateNoteInput = 
{
    title?: string;
    content?: string;
    tagIds?: number[];
}

export async function createNote(userKey: string, data: CreateNoteInput) {
  const tagIds = data.tagIds?.length ? data.tagIds : undefined;

  // 1) Ownership check: all tagIds must belong to this userKey
  if (tagIds) {
    const tags = await prisma.tag.findMany({
      where: {
        userKey,
        id: { in: tagIds },
      },
      select: { id: true },
    });

    if (tags.length !== tagIds.length) {
      throw new Error("Invalid tagIds for this user");
    }
  }

  // 2) Transaction: create note + join rows together
  return prisma.$transaction(async (tx) => {
    const note = await tx.note.create({
      data: {
        userKey,
        title: data.title,
        content: data.content ?? "",
      },
    });

    if (tagIds) {
      await tx.noteTag.createMany({
        data: tagIds.map((tagId) => ({
          userKey,
          noteId: note.id,
          tagId,
        })),
        // safe even if duplicates sneak in; join PK blocks duplicates anyway
        skipDuplicates: true,
      });
    }

    return note;
  });
}

export async function listNotes(
  userKey: string,
  opts?: { query?: string; tagId?: number }
) {
  const q = opts?.query?.trim();
  const tagId = opts?.tagId;

  return prisma.note.findMany({
    where: {
      userKey,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tagId
        ? {
            noteTags: {
              some: {
                userKey,
                tagId,
              },
            },
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      noteTags: {
        include: { tag: true },
      },
    },
  });
}



export async function getNoteById(userKey: string, id: number) {
  return prisma.note.findFirst({
    where: { userKey, id },
    include: {
      noteTags: {
        include: {
          tag: true,
        },
      },
      outgoingLinks: {
        include: {
          toNote: {
            select: { id: true, title: true, updatedAt: true },
          },
        },
      },
      incomingLinks: {
        include: {
          fromNote: {
            select: { id: true, title: true, updatedAt: true },
          },
        },
      },
    },
  });
}


export async function updateNoteById(
  userKey: string,
  noteId: number,
  data: UpdateNoteInput
) {
  const tagIds =
    data.tagIds && data.tagIds.length
      ? Array.from(new Set(data.tagIds))
      : [];

  // If tagIds provided, validate ownership
  if (data.tagIds) {
    const tags = await prisma.tag.findMany({
      where: { userKey, id: { in: tagIds } },
      select: { id: true },
    });

    if (tags.length !== tagIds.length) {
      throw new Error("Invalid tagIds for this user");
    }
  }

  return prisma.$transaction(async (tx) => {
    // Update note (scoped by userKey)
    const updated = await tx.note.updateMany({
      where: { id: noteId, userKey },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
      },
    });

    if (updated.count === 0) return null;

    // If tagIds was provided, replace join rows
    if (data.tagIds) {
      await tx.noteTag.deleteMany({
        where: { userKey, noteId },
      });

      if (tagIds.length > 0) {
        await tx.noteTag.createMany({
          data: tagIds.map((tagId) => ({
            userKey,
            noteId,
            tagId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Return fresh detail shape (same as your GET /api/notes/[id])
    return tx.note.findFirst({
      where: { id: noteId, userKey },
      include: {
        noteTags: { include: { tag: true } },
        outgoingLinks: { include: { toNote: { select: { id: true, title: true } } } },
        incomingLinks: { include: { fromNote: { select: { id: true, title: true } } } },
      },
    });
  });
}

export async function deleteNoteById(userKey: string, id: number) {
  const result = await prisma.note.deleteMany({
    where: { userKey, id },
  });

  return result.count > 0;
}
