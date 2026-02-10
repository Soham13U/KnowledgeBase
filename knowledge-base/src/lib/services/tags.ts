import {prisma} from "@/lib/db/prisma"


export async function listTags(userKey: string)
{
    return prisma.tag.findMany({
        where:{
            userKey,
        },
        orderBy: {createdAt: "desc"},
    });
}

export async function createTag(userKey: string, name: string) {
  const normalized = name.trim();

  // pre-check avoids Prisma error-type dependency
  const existing = await prisma.tag.findFirst({
    where: { userKey, name: normalized },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Tag already exists");
  }

  return prisma.tag.create({
    data: { userKey, name: normalized },
  });
}