import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const generateSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export async function createRoom(name: string, language: string = 'javascript') {
  const slug = generateSlug();
  return prisma.room.create({
    data: { slug, name, language },
  });
}

export async function getRoomBySlug(slug: string) {
  return prisma.room.findUnique({ where: { slug } });
}

export async function getRoomById(id: string) {
  return prisma.room.findUnique({ where: { id } });
}

export async function updateRoomLanguage(id: string, language: string) {
  return prisma.room.update({
    where: { id },
    data: { language },
  });
}

export async function listRooms() {
  return prisma.room.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      slug: true,
      name: true,
      language: true,
      createdAt: true,
      _count: { select: { sessions: { where: { leftAt: null } } } },
    },
  });
}

export async function deleteRoom(id: string) {
  return prisma.room.delete({ where: { id } });
}

export async function createSession(roomId: string, username: string, cursorColor: string) {
  return prisma.session.create({
    data: { roomId, username, cursorColor },
  });
}

export async function endSession(sessionId: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { leftAt: new Date() },
  });
}
