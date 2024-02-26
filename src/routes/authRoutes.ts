import express  from "express";
import {loginUser, registerUser, secureRoute} from '../controllers/authController'

const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)

//test
router.get('/route', secureRoute)

export default router