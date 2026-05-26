const express = require('express')
const userRoutes = require('./routes/userRoutes')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/storage', express.static('storage'))

// Routes
app.use('/api', userRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})