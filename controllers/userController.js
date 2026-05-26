const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
require('dotenv').config()

async function register(req, res) {
  try {
    const { name, email, password } = req.body
    const profile_image = req.file ? req.file.filename : null
    const hashedPassword = await bcrypt.hash(password, 10)
    await userModel.createUser(name, email, hashedPassword, profile_image)
    res.send({ success: true, message: 'User registered!' })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await userModel.getUserByEmail(email)
    if (!user) return res.status(404).send({ error: 'User not found' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).send({ error: 'Wrong password' })
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    res.send({ success: true, token: token })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

async function profile(req, res) {
  try {
    const user = await userModel.getUserById(req.user.id)
    res.send({ success: true, data: user })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

async function update(req, res) {
  try {
    const { name, email } = req.body
    const profile_image = req.file ? req.file.filename : null
    await userModel.updateUser(req.user.id, name, email, profile_image)
    res.send({ success: true, message: 'User updated!' })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

module.exports = { register, login, profile, update }