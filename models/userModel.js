const db = require('../db')

async function createUser(name, email, password, image) {
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, profile_image) VALUES (?, ?, ?, ?)',
    [name, email, password, image]
  )
  return result.insertId
}

async function getUserByEmail(email) {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )
  return rows[0]
}

async function getUserById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, profile_image, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0]
}

async function updateUser(id, name, email, image) {
  if (image) {
    await db.query(
      'UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?',
      [name, email, image, id]
    )
  } else {
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    )
  }
}

module.exports = { createUser, getUserByEmail, getUserById, updateUser }