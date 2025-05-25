const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');
const Celebrity = require('../models/Celebrity'); // giả sử bạn có model này

router.get('/list', requireLogin, async (req, res) => {
  const list = await Celebrity.find();
  res.json(list);
});

router.post('/add', requireAdmin, async (req, res) => {
  const celeb = new Celebrity(req.body);
  await celeb.save();
  res.send('Thêm thành công');
});

router.delete('/delete/:id', requireAdmin, async (req, res) => {
  await Celebrity.findByIdAndDelete(req.params.id);
  res.send('Xóa thành công');
});

router.put('/edit/:id', requireAdmin, async (req, res) => {
  await Celebrity.findByIdAndUpdate(req.params.id, req.body);
  res.send('Sửa thành công');
});

module.exports = router;
