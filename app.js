const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const db = require('./db')
const checkToken = require('./middleware')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/storage', express.static('storage'))

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'storage/') },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)) }
})
const upload = multer({ storage: storage })

app.post('/register', async (req, res) => {
  upload.single('profile_image')(req, res, async (err) => {
    try {
      const name = req.body.name
      const email = req.body.email
      const password = req.body.password
      const profile_image = req.file ? req.file.filename : null

      console.log('name:', name)
      console.log('email:', email)
      console.log('password:', password)

      const hashedPassword = await bcrypt.hash(password, 10)
      await db.query(
        'INSERT INTO users (name, email, password, profile_image) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, profile_image]
      )
      res.send({ success: true, message: 'User registered!' })
    } catch (e) {
      res.status(500).send({ error: e.message })
    }
  })
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) return res.status(404).send({ error: 'User not found' })
    const isMatch = await bcrypt.compare(password, users[0].password)
    if (!isMatch) return res.status(401).send({ error: 'Wrong password' })
    const token = jwt.sign({ id: users[0].id, email: users[0].email }, process.env.JWT_SECRET, { expiresIn: '1d' })
    res.send({ success: true, token: token })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

app.get('/profile', checkToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, profile_image, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    res.send({ success: true, data: users[0] })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

app.put('/update', checkToken, async (req, res) => {
  upload.single('profile_image')(req, res, async (err) => {
    try {
      const { name, email } = req.body
      const profile_image = req.file ? req.file.filename : null
      if (profile_image) {
        await db.query(
          'UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?',
          [name, email, profile_image, req.user.id]
        )
      } else {
        await db.query(
          'UPDATE users SET name = ?, email = ? WHERE id = ?',
          [name, email, req.user.id]
        )
      }
      res.send({ success: true, message: 'User updated!' })
    } catch (e) {
      res.status(500).send({ error: e.message })
    }
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port ' + (process.env.PORT || 3000))
})