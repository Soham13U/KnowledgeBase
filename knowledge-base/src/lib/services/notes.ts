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
  id: number,
  data: UpdateNoteInput
) {
  const tagIdsProvided = Array.isArray(data.tagIds);
  const tagIds = data.tagIds?.length ? data.tagIds : [];

  // Build patch (only set provided fields)
  const patch: { title?: string; content?: string } = {};
  if (typeof data.title === "string") patch.title = data.title;
  if (typeof data.content === "string") patch.content = data.content;

  // If tagIds is provided, verify ownership
  if (tagIdsProvided && tagIds.length > 0) {
    const tags = await prisma.tag.findMany({
      where: { userKey, id: { in: tagIds } },
      select: { id: true },
    });

    if (tags.length !== tagIds.length) {
      throw new Error("Invalid tagIds for this user");
    }
  }

  // Transaction: update note + replace tags (if tagIds provided)
  return prisma.$transaction(async (tx) => {
    // Update note (scoped)
    if (Object.keys(patch).length > 0) {
      const res = await tx.note.updateMany({
        where: { userKey, id },
        data: patch,
      });
      if (res.count === 0) return null;
    } else {
      // even if no patch fields, ensure note exists & is owned before editing tags
      const exists = await tx.note.findFirst({ where: { userKey, id }, select: { id: true } });
      if (!exists) return null;
    }

    // Replace tags only if tagIds was provided (meaning caller intends to set them)
    if (tagIdsProvided) {
      await tx.noteTag.deleteMany({
        where: { userKey, noteId: id },
      });

      if (tagIds.length > 0) {
        await tx.noteTag.createMany({
          data: tagIds.map((tagId) => ({
            userKey,
            noteId: id,
            tagId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Return updated note (optionally include tags)
    return tx.note.findFirst({
      where: { userKey, id },
      include: {
        noteTags: { include: { tag: true } }, // if you use Variant 1
        // tags: true, // if you use Variant 2
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
