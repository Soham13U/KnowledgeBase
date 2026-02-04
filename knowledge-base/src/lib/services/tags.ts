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

export async function createTag(userKey: string, name: string)
{
    return prisma.tag.create({
        data:{
            userKey,
            name,
        }
    });
}