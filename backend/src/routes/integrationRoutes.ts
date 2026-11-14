import { Router } from 'express';
import { integrationController } from '../controllers/integrationController';

const router = Router();

// Base integration CRUD
router.get('/', integrationController.getIntegrations);
router.post('/', integrationController.updateIntegration);

// Jira endpoints (Step 11)
router.get('/jira/projects', integrationController.getJiraProjects);
router.get('/jira/issuetypes', integrationController.getJiraIssueTypes);
router.post('/jira/test', integrationController.testJira);

// Trello endpoints (Step 12)
router.get('/trello/boards', integrationController.getTrelloBoards);
router.get('/trello/lists', integrationController.getTrelloLists);
router.post('/trello/test', integrationController.testTrello);

export default router;
