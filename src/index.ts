import  express  from "express";
import cors from "cors"
import router from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cors())


app.use('/api/auth', router)
app.use('/api/secure', authenticateToken, router)


app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})