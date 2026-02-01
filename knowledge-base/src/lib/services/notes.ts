import {prisma} from "@/lib/db/prisma"

export type CreateNoteInput =
{
    title: string;
    content?: string;
}

export type UpdateNoteInput = 
{
    title?: string;
    content?: string;
}

export async function createNote(userKey: string , data: CreateNoteInput)
{
    return prisma.note.create({
        data :{
                userKey,
                title: data.title,
                content: data.content ?? "",
        },
    });
}

export async function listNotes(
  userKey: string,
  opts?: { query?: string }
) {
  const query = opts?.query?.trim();

  return prisma.note.findMany({
    where: {
      userKey,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNoteById(userKey: string, id: number)
{
    return prisma.note.findFirst({
        where:{userKey,id},
    });
}

export async function updateNoteById(userKey: string, id: number, data: UpdateNoteInput)
{
    const result = await prisma.note.updateMany({
        where : {userKey,id},
        data,
    });
    if (result.count === 0) return null;

    return prisma.note.findFirst({where : {userKey,id}});
}

export async function deleteNoteById(userKey: string, id: number) {
  const result = await prisma.note.deleteMany({
    where: { userKey, id },
  });

  return result.count > 0;
}
