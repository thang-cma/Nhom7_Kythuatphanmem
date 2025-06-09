const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = Date.now() + ext;
      cb(null, filename);
    }
  });
  const upload = multer({ storage });
const JWT_SECRET = 'mysecret123';


  // Middleware xác thực token
  function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Bạn chưa đăng nhập' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Token không hợp lệ' });
    }
  }

  // Cấu hình Express
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // ✅ THÊM DÒNG NÀY

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use(express.static(path.join(__dirname, 'public'))); // phục vụ frontend

  // Kết nối MongoDB
  mongoose.connect('mongodb://127.0.0.1:27017/celebs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Mongoose models
 const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Celeb' }]
}));


  const Celeb = mongoose.model('Celeb', {
    name: String,
    image: String,
    description: String,
    profession: String
  });

  // Tạo admin mặc định
  (async () => {
    const exist = await User.findOne({ username: 'admin' });
    if (!exist) {
      const hashed = await bcrypt.hash('123456', 10);
      await new User({ username: 'admin', password: hashed, role: 'admin' }).save();
      console.log('✅ Đã tạo tài khoản admin / 123456');
    }
  })();


  // Đăng nhập
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Sai tài khoản' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });

  const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  });

  // API lấy danh sách người nổi tiếng
  app.get('/api/celebs', async (req, res) => {
    const celebs = await Celeb.find();
    res.json(celebs);
  });

  // Thêm người nổi tiếng (cần đăng nhập)
app.post('/api/celebs', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  const { name, profession, description } = req.body;
  console.log('Dữ liệu nhận được:', req.body);


  if (!name || !profession || !req.file) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  const imagePath = `/uploads/${req.file.filename}`;

const celeb = new Celeb({
  name,
  profession,
  description,
  image: imagePath
});

  await celeb.save();
  res.status(201).json(celeb);
});

  // Xoá người nổi tiếng (cần đăng nhập)
  app.delete('/api/celebs/:id', authMiddleware, adminOnly, async (req, res) => {

    await Celeb.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá' });
  });

  // Upload ảnh với multer


  app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Không có file' });
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });
  app.post('/api/auth/register', authMiddleware, adminOnly, async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Thiếu thông tin' });
    }

    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ error: 'Tài khoản đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed, role }).save();
    res.json({ message: `Tạo ${role} thành công` });
  });

  // Redirect "/" về index.html nếu cần
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Khởi động server
  app.listen(3000, () => {
    console.log('✅ Server đang chạy ở http://localhost:3000');
  });
  app.put('/api/celebs/:id', authMiddleware, adminOnly, async (req, res) => {

    try {
      const updated = await Celeb.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Lỗi khi cập nhật' });
    }
  });
  function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới được thực hiện thao tác này' });
    }
    next();
  }
  // Đăng ký tài khoản công khai (role luôn là user)
  app.post('/api/auth/register-public', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  // Kiểm tra mật khẩu phải có chữ và số
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số.' });
  }

  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ error: 'Tài khoản đã tồn tại' });

  const hashed = await bcrypt.hash(password, 10);
  await new User({ username, password: hashed, role: 'user' }).save();

  res.json({ message: 'Đăng ký thành công' });
});


// Lấy danh sách yêu thích của user hiện tại
app.get('/api/users/favorites', authMiddleware, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate('favorites');
  res.json(user.favorites);
});

// Thêm hoặc gỡ yêu thích
app.post('/api/users/favorites/:celebId', authMiddleware, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const celebId = req.params.celebId;
  const index = user.favorites.indexOf(celebId);

  if (index > -1) {
    user.favorites.splice(index, 1); // Gỡ yêu thích
  } else {
    user.favorites.push(celebId); // Thêm yêu thích
  }

  await user.save();
  res.json({ favorites: user.favorites });
});
