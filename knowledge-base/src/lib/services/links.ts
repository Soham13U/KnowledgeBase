import {prisma} from "@/lib/db/prisma"

export async function createLink(userKey: string, fromId: number, toId: number)
{
    if(fromId === toId)
    {
        throw new Error("Self link not allowed");
    }
    const [fromNote,toNote] = await Promise.all([
        prisma.note.findFirst({ where: { userKey, id: fromId }, select: { id: true } }),
    prisma.note.findFirst({ where: { userKey, id: toId }, select: { id: true } }),
    ]);

    if(!fromNote || !toNote)
    {
        throw new Error("note not found");
    }

    return prisma.noteLink.create({
    data: {
      userKey,
      fromNoteId: fromId,
      toNoteId: toId,
    },
  });
}

export async function deleteLink(userKey: string, fromId: number, toId: number)
{
    const res = await prisma.noteLink.deleteMany({
        where:{
            userKey,
            fromNoteId: fromId,
            toNoteId: toId,
        },
    });

    return {deleted: res.count};
}