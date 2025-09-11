const express = require('express')
const http = require('http')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { sequelize } = require('./models')
const { API_PREFIX } = require('./utils')


// const artistController = require('./controllers/artist')
// const albumController = require('./controllers/album')
// const playlistController = require('./controllers/playlist')
// const userController = require('./controllers/user')

const app = express()
const server = http.createServer(app)

app.set('trust proxy', true)

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // frontend
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(`${API_PREFIX}/uploads/avatars`, express.static(path.join(__dirname, 'uploads', 'avatars')))

// API routes
// app.use(`${API_PREFIX}/songs`, songController)
// app.use(`${API_PREFIX}/artists`, artistController)
// app.use(`${API_PREFIX}/albums`, albumController)
// app.use(`${API_PREFIX}/playlists`, playlistController)
// app.use(`${API_PREFIX}/users`, userController)

// Start server
async function startServer () {
  try {
    await sequelize.sync()
    console.log('✅ Database synchronized successfully')

    server.listen(process.env.PORT || 4000, () => {
      console.log(`🎶 Music Server is running at http://localhost:${process.env.PORT || 4000}`)
    })
  } catch (error) {
    console.error('❌ Error starting server:', error)
  }
}

startServer()
