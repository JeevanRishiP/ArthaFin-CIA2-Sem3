import { Router } from 'express';
import {
  handleChatMessage,
  getChatHistory,
  getUsers,
  clearChatHistory,
  getChatSessions,
  createChatSession,
  getSessionMessages,
  deleteChatSession,
} from '../controllers/chatController';

const router = Router();

// POST /api/chat - Dispatch financial query to Google Gemini API & persist in session
router.post('/', handleChatMessage);

// Multi-Session Chat Routes (like ChatGPT, Claude, Gemini)
router.get('/sessions/:userId', getChatSessions);
router.post('/sessions', createChatSession);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.delete('/sessions/:sessionId', deleteChatSession);

// Backward-compatible history routes
router.get('/history/:userId', getChatHistory);
router.delete('/history/:userId', clearChatHistory);

// User directory
router.get('/users', getUsers);

export default router;
