import {prisma} from "@/lib/db/prisma"

export type InsightsRange = 7 | 30;
export async function getInsights(userKey: string, rangeDays: InsightsRange)
{
    const start = new Date(Date.now() - rangeDays*24*60*60*1000);

     const [createdCount, updatedCount, grouped] = await Promise.all([
    prisma.note.count({
      where: {
        userKey,
        createdAt: { gte: start },
      },
    }),
    prisma.note.count({
      where: {
        userKey,
        updatedAt: { gte: start },
      },
    }),
    prisma.noteTag.groupBy({
      by: ["tagId"],
      where: { userKey },
      _count: { tagId: true },
      orderBy: { _count: { tagId: "desc" } },
      take: 10,
    }),
  ]);

  const tagIds = grouped.map((g) => g.tagId);

  const tags = tagIds.length
    ? await prisma.tag.findMany({
        where: { userKey, id: { in: tagIds } },
        select: { id: true, name: true },
      })
    : [];

  const tagNameById = new Map(tags.map((t) => [t.id, t.name] as const));

  const topTags = grouped.map((g) => ({
    tagId: g.tagId,
    name: tagNameById.get(g.tagId) ?? "(unknown)",
    count: g._count.tagId,
  }));

  return {
    rangeDays,
    start: start.toISOString(),
    createdCount,
    updatedCount,
    topTags,
  };

}