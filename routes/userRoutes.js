const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const userController = require('../controllers/userController')
const checkToken = require('../middleware/authMiddleware')

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

// Routes
router.post('/register', upload.single('profile_image'), userController.register)
router.post('/login', userController.login)
router.get('/profile', checkToken, userController.profile)
router.put('/update', checkToken, upload.single('profile_image'), userController.update)

module.exports = router