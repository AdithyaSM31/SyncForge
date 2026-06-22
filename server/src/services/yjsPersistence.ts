import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loadDocState(roomId: string): Promise<Buffer | null> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { docState: true },
  });
  return room?.docState ? Buffer.from(room.docState) : null;
}

export async function saveDocState(roomId: string, state: Buffer): Promise<void> {
  await prisma.room.update({
    where: { id: roomId },
    data: { docState: state },
  });
}
