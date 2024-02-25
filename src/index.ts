import  express  from "express";
import cors from "cors"
import router from "./routes/authRoutes";

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cors())


app.use('/api/auth', router)


app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})