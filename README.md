Ứng dụng Quản Lý Người Nổi Tiếng - Web App (Node.js + MongoDB)

Đây là một ứng dụng web cho phép quản lý thông tin người nổi tiếng. Dự án được xây dựng bằng Node.js, sử dụng Express cho backend, MongoDB làm cơ sở dữ liệu và HTML/CSS/JS cho phần giao diện người dùng.

Ứng dụng có phân quyền cơ bản, chức năng thêm - sửa - xóa dữ liệu, hỗ trợ upload ảnh và quản lý dữ liệu hiệu quả qua API.
Các chức năng chính

Xác thực người dùng
Đăng ký tài khoản mới
Đăng nhập với phân quyền (admin / user)
Phân quyền sử dụng chức năng (chỉ admin mới được thêm/sửa/xóa)
Quản lý người nổi tiếng
Thêm / sửa / xóa người nổi tiếng
Xem chi tiết thông tin từng người nổi tiếng
Upload ảnh đại diện
Gắn tag hoặc mô tả nổi bật
Quản lý hình ảnh
Lưu trữ và hiển thị ảnh từ uploads/
Tự động xử lý đường dẫn ảnh
Gom ảnh về một thư mục thống nhất nếu cần
Quản lý chuyên mục / phân loại
Tạo nhóm người nổi tiếng theo ngành nghề (ca sĩ, diễn viên, cầu thủ…)
Lọc danh sách theo loại
❤Quản lý danh sách yêu thích (chức năng nâng cao)
Người dùng có thể thêm người nổi tiếng vào danh sách yêu thích riêng
Mỗi người dùng có danh sách khác nhau
🛠️ Công nghệ sử dụng

Node.js, Express
MongoDB + Mongoose
HTML, CSS, JavaScript
Multer (upload ảnh)
JWT (phân quyền)
Git, GitHub
Cấu trúc thư mục chính

.
├── public/             # HTML giao diện người dùng
├── routes/             # Các route Express
├── models/             # Schema MongoDB
├── uploads/            # Ảnh upload
├── middleware/         # Xác thực JWT
├── server.js           # Điểm vào ứng dụng
└── README.md           # Tệp giới thiệu (bạn đang đọc đây)
