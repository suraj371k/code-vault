import { Router } from 'express'
import { login, signup } from '../controllers/auth.controller.js';

const router = Router()

router.use('/signup' , signup)
router.use('/login' , login)

export default router;