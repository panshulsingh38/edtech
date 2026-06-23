'use server';

import { prisma } from '@/lib/db';

export async function getTestById(testId: string) {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: true }
  });

  if (!test) return null;

  // Format it back into the QuestionSet shape expected by the frontend
  return {
    testTitle: test.title,
    questions: test.questions.map(q => ({
      id: q.id,
      type: q.type as 'mcq' | 'true_false' | 'short_answer',
      questionText: q.questionText,
      options: q.options ? JSON.parse(q.options) : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }))
  };
}

// MULTIPLAYER LOBBY ACTIONS

export async function createLobby(testId: string) {
  const lobby = await prisma.lobby.create({
    data: { testId, status: 'waiting' }
  });
  return lobby.id;
}

export async function joinLobby(lobbyId: string, playerName: string) {
  const player = await prisma.lobbyPlayer.create({
    data: { lobbyId, name: playerName }
  });
  return player.id;
}

export async function updatePlayerProgress(playerId: string, progress: number, score: number) {
  await prisma.lobbyPlayer.update({
    where: { id: playerId },
    data: { progress, score }
  });
}

export async function startLobby(lobbyId: string) {
  await prisma.lobby.update({
    where: { id: lobbyId },
    data: { status: 'playing' }
  });
}

export async function getLobbyState(lobbyId: string) {
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { players: true, test: { include: { questions: true } } }
  });
  return lobby;
}
