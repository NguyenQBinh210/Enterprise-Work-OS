# Đặc tả Use Case hệ thống TaskFlow

## 3.2.1.1. Đặc tả chức năng đăng nhập / đăng ký / đăng xuất

### Use Case: Đăng nhập

| Mục | Nội dung |
|---|---|
| Tên Use Case | Đăng nhập |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã có tài khoản trong hệ thống. Tài khoản chưa bị vô hiệu hóa. |
| Mục đích | Cho phép người dùng truy cập vào hệ thống TaskFlow. |
| Luồng sự kiện chính | 1. Người dùng mở trang đăng nhập. <br> 2. Người dùng nhập email và mật khẩu. <br> 3. Người dùng nhấn nút "Đăng nhập". <br> 4. Hệ thống kiểm tra thông tin đăng nhập. <br> 5. Hệ thống tạo phiên đăng nhập. <br> 6. Hệ thống chuyển người dùng vào trang Dashboard. |
| Luồng sự kiện phụ | Người dùng chọn "Quên mật khẩu", hệ thống chuyển đến chức năng khôi phục hoặc đổi mật khẩu nếu có hỗ trợ. |
| Luồng ngoại lệ | Email hoặc mật khẩu không đúng. Tài khoản không tồn tại. Tài khoản bị vô hiệu hóa. Dữ liệu nhập bị bỏ trống. |
| Hậu điều kiện | Thành công: Người dùng đăng nhập vào hệ thống. Thất bại: Người dùng vẫn ở trang đăng nhập. |

### Use Case: Đăng ký

| Mục | Nội dung |
|---|---|
| Tên Use Case | Đăng ký |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng chưa có tài khoản hoặc email chưa được sử dụng trong hệ thống. |
| Mục đích | Tạo tài khoản mới để sử dụng hệ thống. |
| Luồng sự kiện chính | 1. Người dùng mở trang đăng ký. <br> 2. Người dùng nhập họ tên, email và mật khẩu. <br> 3. Người dùng nhấn nút "Đăng ký". <br> 4. Hệ thống kiểm tra dữ liệu nhập. <br> 5. Hệ thống kiểm tra email đã tồn tại chưa. <br> 6. Hệ thống tạo tài khoản mới. <br> 7. Hệ thống thông báo đăng ký thành công. |
| Luồng sự kiện phụ | Người dùng đã có tài khoản thì chọn chuyển sang trang đăng nhập. |
| Luồng ngoại lệ | Email đã tồn tại. Email sai định dạng. Mật khẩu không hợp lệ. Người dùng nhập thiếu thông tin. |
| Hậu điều kiện | Thành công: Tài khoản mới được tạo. Thất bại: Không có tài khoản mới được tạo. |

### Use Case: Đăng xuất

| Mục | Nội dung |
|---|---|
| Tên Use Case | Đăng xuất |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập vào hệ thống. |
| Mục đích | Kết thúc phiên làm việc hiện tại của người dùng. |
| Luồng sự kiện chính | 1. Người dùng chọn chức năng "Đăng xuất". <br> 2. Hệ thống yêu cầu xác nhận nếu cần. <br> 3. Người dùng xác nhận đăng xuất. <br> 4. Hệ thống hủy phiên đăng nhập. <br> 5. Hệ thống chuyển người dùng về trang đăng nhập. |
| Luồng sự kiện phụ | Người dùng hủy xác nhận đăng xuất, hệ thống giữ nguyên phiên làm việc. |
| Luồng ngoại lệ | Phiên đăng nhập đã hết hạn hoặc không tồn tại. |
| Hậu điều kiện | Thành công: Người dùng thoát khỏi hệ thống. Thất bại: Người dùng vẫn ở trạng thái đăng nhập. |

### Use Case: Đổi mật khẩu

| Mục | Nội dung |
|---|---|
| Tên Use Case | Đổi mật khẩu |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập vào hệ thống. |
| Mục đích | Cho phép người dùng thay đổi mật khẩu tài khoản. |
| Luồng sự kiện chính | 1. Người dùng mở trang tài khoản cá nhân. <br> 2. Người dùng chọn chức năng "Đổi mật khẩu". <br> 3. Người dùng nhập mật khẩu hiện tại và mật khẩu mới. <br> 4. Hệ thống kiểm tra mật khẩu hiện tại. <br> 5. Hệ thống kiểm tra tính hợp lệ của mật khẩu mới. <br> 6. Hệ thống cập nhật mật khẩu mới. <br> 7. Hệ thống thông báo đổi mật khẩu thành công. |
| Luồng sự kiện phụ | Người dùng hủy thao tác đổi mật khẩu, hệ thống không cập nhật dữ liệu. |
| Luồng ngoại lệ | Mật khẩu hiện tại không đúng. Mật khẩu mới không hợp lệ. Mật khẩu xác nhận không khớp. |
| Hậu điều kiện | Thành công: Mật khẩu được cập nhật. Thất bại: Mật khẩu cũ vẫn được giữ nguyên. |

### Use Case: Cập nhật tài khoản

| Mục | Nội dung |
|---|---|
| Tên Use Case | Cập nhật tài khoản |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập vào hệ thống. |
| Mục đích | Cập nhật thông tin cá nhân của người dùng. |
| Luồng sự kiện chính | 1. Người dùng mở trang hồ sơ cá nhân. <br> 2. Hệ thống hiển thị thông tin tài khoản hiện tại. <br> 3. Người dùng chỉnh sửa thông tin cá nhân. <br> 4. Người dùng nhấn "Lưu". <br> 5. Hệ thống kiểm tra dữ liệu. <br> 6. Hệ thống cập nhật thông tin vào CSDL. <br> 7. Hệ thống hiển thị thông tin mới. |
| Luồng sự kiện phụ | Người dùng chọn hủy, hệ thống không lưu thay đổi. |
| Luồng ngoại lệ | Dữ liệu sai định dạng. Ảnh đại diện tải lên thất bại. Cập nhật dữ liệu không thành công. |
| Hậu điều kiện | Thành công: Thông tin tài khoản được cập nhật. Thất bại: Thông tin cũ được giữ nguyên. |

## 3.2.1.2. Đặc tả chức năng quản lý người dùng

### Use Case: Xem danh sách người dùng

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem danh sách người dùng |
| Tác nhân | Admin |
| Tiền điều kiện | Admin đã đăng nhập và có quyền quản trị hệ thống. |
| Mục đích | Xem toàn bộ người dùng trong hệ thống. |
| Luồng sự kiện chính | 1. Admin chọn chức năng quản lý người dùng. <br> 2. Hệ thống gửi yêu cầu lấy danh sách người dùng. <br> 3. CSDL trả về dữ liệu người dùng. <br> 4. Hệ thống hiển thị danh sách người dùng. |
| Luồng sự kiện phụ | Admin có thể lọc danh sách theo vai trò hoặc trạng thái tài khoản. |
| Luồng ngoại lệ | Admin không có quyền truy cập. Hệ thống không tải được dữ liệu. |
| Hậu điều kiện | Danh sách người dùng được hiển thị cho Admin. |

### Use Case: Tìm kiếm người dùng

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tìm kiếm người dùng |
| Tác nhân | Admin |
| Tiền điều kiện | Admin đã đăng nhập và đang ở trang quản lý người dùng. |
| Mục đích | Tìm nhanh người dùng theo tên hoặc email. |
| Luồng sự kiện chính | 1. Admin nhập từ khóa tìm kiếm. <br> 2. Hệ thống kiểm tra từ khóa. <br> 3. Hệ thống truy vấn người dùng phù hợp. <br> 4. Hệ thống hiển thị kết quả tìm kiếm. |
| Luồng sự kiện phụ | Admin xóa từ khóa, hệ thống hiển thị lại danh sách đầy đủ. |
| Luồng ngoại lệ | Không tìm thấy người dùng phù hợp. Từ khóa không hợp lệ. |
| Hậu điều kiện | Kết quả tìm kiếm được hiển thị. |

### Use Case: Sửa người dùng

| Mục | Nội dung |
|---|---|
| Tên Use Case | Sửa người dùng |
| Tác nhân | Admin |
| Tiền điều kiện | Admin đã đăng nhập và người dùng cần sửa tồn tại trong hệ thống. |
| Mục đích | Cập nhật thông tin người dùng khi cần thiết. |
| Luồng sự kiện chính | 1. Admin chọn người dùng cần sửa. <br> 2. Hệ thống hiển thị thông tin người dùng. <br> 3. Admin chỉnh sửa thông tin. <br> 4. Admin nhấn "Lưu". <br> 5. Hệ thống kiểm tra dữ liệu. <br> 6. Hệ thống cập nhật thông tin người dùng. |
| Luồng sự kiện phụ | Admin chọn hủy, hệ thống không lưu thay đổi. |
| Luồng ngoại lệ | Người dùng không tồn tại. Dữ liệu không hợp lệ. Admin không có quyền sửa. |
| Hậu điều kiện | Thành công: Thông tin người dùng được cập nhật. Thất bại: Dữ liệu cũ được giữ nguyên. |

### Use Case: Vô hiệu hóa / kích hoạt tài khoản người dùng

| Mục | Nội dung |
|---|---|
| Tên Use Case | Vô hiệu hóa / kích hoạt tài khoản người dùng |
| Tác nhân | Admin |
| Tiền điều kiện | Admin đã đăng nhập. Người dùng cần xử lý tồn tại trong hệ thống. |
| Mục đích | Ngăn người dùng không còn được phép đăng nhập hoặc cho phép tài khoản hoạt động trở lại. |
| Luồng sự kiện chính | 1. Admin chọn người dùng cần thay đổi trạng thái. <br> 2. Admin chọn chức năng "Vô hiệu hóa" hoặc "Kích hoạt". <br> 3. Hệ thống hiển thị hộp thoại xác nhận. <br> 4. Admin nhấn "Đồng ý". <br> 5. Hệ thống kiểm tra quyền Admin. <br> 6. Hệ thống cập nhật trạng thái tài khoản trong CSDL. <br> 7. Hệ thống cập nhật lại danh sách người dùng. |
| Luồng sự kiện phụ | Admin chọn "Hủy", hệ thống hủy thao tác và giữ nguyên trạng thái tài khoản. |
| Luồng ngoại lệ | Không có quyền thao tác. Người dùng không tồn tại. Cập nhật trạng thái tài khoản thất bại. |
| Hậu điều kiện | Thành công: Trạng thái tài khoản được cập nhật. Thất bại: Tài khoản vẫn giữ nguyên trạng thái cũ. |

### Use Case: Phân quyền người dùng

| Mục | Nội dung |
|---|---|
| Tên Use Case | Phân quyền người dùng |
| Tác nhân | Admin |
| Tiền điều kiện | Admin đã đăng nhập và người dùng cần phân quyền tồn tại. |
| Mục đích | Thay đổi vai trò hệ thống của người dùng. |
| Luồng sự kiện chính | 1. Admin chọn người dùng cần phân quyền. <br> 2. Hệ thống hiển thị vai trò hiện tại. <br> 3. Admin chọn vai trò mới. <br> 4. Hệ thống kiểm tra quyền thao tác. <br> 5. Hệ thống cập nhật vai trò người dùng. <br> 6. Hệ thống hiển thị vai trò mới. |
| Luồng sự kiện phụ | Admin hủy thao tác, hệ thống không thay đổi vai trò. |
| Luồng ngoại lệ | Vai trò không hợp lệ. Admin không có quyền phân quyền. Người dùng không tồn tại. |
| Hậu điều kiện | Thành công: Vai trò người dùng được cập nhật. Thất bại: Vai trò cũ được giữ nguyên. |

## 3.2.1.3. Đặc tả chức năng quản lý tin nhắn

### Use Case: Gửi tin nhắn

| Mục | Nội dung |
|---|---|
| Tên Use Case | Gửi tin nhắn |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập và có hội thoại hợp lệ. |
| Mục đích | Gửi nội dung trao đổi đến người nhận hoặc nhóm dự án. |
| Luồng sự kiện chính | 1. Người dùng mở hội thoại. <br> 2. Người dùng nhập nội dung tin nhắn. <br> 3. Người dùng nhấn "Gửi". <br> 4. Hệ thống kiểm tra nội dung. <br> 5. Hệ thống lưu tin nhắn vào CSDL. <br> 6. Hệ thống đồng bộ tin nhắn real-time đến người nhận. |
| Luồng sự kiện phụ | Người dùng xóa nội dung trước khi gửi, hệ thống không tạo tin nhắn. |
| Luồng ngoại lệ | Nội dung rỗng. Người nhận không tồn tại. Người dùng không có quyền gửi trong hội thoại. |
| Hậu điều kiện | Thành công: Tin nhắn được lưu và hiển thị trong hội thoại. Thất bại: Tin nhắn không được gửi. |

### Use Case: Sửa tin nhắn

| Mục | Nội dung |
|---|---|
| Tên Use Case | Sửa tin nhắn |
| Tác nhân | Người gửi tin nhắn |
| Tiền điều kiện | Người dùng đã đăng nhập. Tin nhắn tồn tại và thuộc về người gửi. |
| Mục đích | Chỉnh sửa nội dung tin nhắn đã gửi. |
| Luồng sự kiện chính | 1. Người dùng chọn tin nhắn cần sửa. <br> 2. Hệ thống hiển thị ô chỉnh sửa. <br> 3. Người dùng nhập nội dung mới. <br> 4. Người dùng nhấn "Lưu". <br> 5. Hệ thống kiểm tra quyền sửa. <br> 6. Hệ thống cập nhật nội dung tin nhắn. <br> 7. Hệ thống đồng bộ thay đổi real-time. |
| Luồng sự kiện phụ | Người dùng chọn hủy, tin nhắn giữ nguyên nội dung cũ. |
| Luồng ngoại lệ | Tin nhắn không tồn tại. Người dùng không phải người gửi. Nội dung mới rỗng. |
| Hậu điều kiện | Thành công: Nội dung tin nhắn được cập nhật. Thất bại: Tin nhắn giữ nguyên. |

### Use Case: Xóa tin nhắn

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xóa hoặc thu hồi tin nhắn |
| Tác nhân | Người gửi tin nhắn |
| Tiền điều kiện | Người dùng đã đăng nhập. Tin nhắn tồn tại và thuộc về người gửi. |
| Mục đích | Xóa hoặc thu hồi tin nhắn không còn phù hợp. |
| Luồng sự kiện chính | 1. Người dùng chọn tin nhắn cần xóa. <br> 2. Hệ thống hiển thị hộp thoại xác nhận. <br> 3. Người dùng nhấn "Đồng ý". <br> 4. Hệ thống kiểm tra quyền xóa. <br> 5. Hệ thống xóa hoặc cập nhật trạng thái thu hồi tin nhắn. <br> 6. Hệ thống cập nhật lại hội thoại. |
| Luồng sự kiện phụ | Người dùng chọn "Hủy", hệ thống hủy thao tác xóa. |
| Luồng ngoại lệ | Tin nhắn không tồn tại. Người dùng không có quyền xóa. Tin nhắn đã bị thu hồi trước đó. |
| Hậu điều kiện | Thành công: Tin nhắn bị xóa hoặc hiển thị trạng thái đã thu hồi. Thất bại: Tin nhắn giữ nguyên. |

### Use Case: Tìm kiếm người dùng / hội thoại

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tìm kiếm người dùng / hội thoại |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập vào hệ thống. |
| Mục đích | Tìm nhanh người dùng hoặc hội thoại để bắt đầu trao đổi tin nhắn. |
| Luồng sự kiện chính | 1. Người dùng mở trang tin nhắn. <br> 2. Người dùng nhập tên hoặc email vào ô tìm kiếm. <br> 3. Hệ thống kiểm tra từ khóa. <br> 4. Hệ thống lọc danh sách người dùng/hội thoại phù hợp. <br> 5. Hệ thống hiển thị kết quả tìm kiếm. |
| Luồng sự kiện phụ | Người dùng xóa từ khóa, hệ thống hiển thị lại danh sách hội thoại ban đầu. |
| Luồng ngoại lệ | Không tìm thấy người dùng hoặc hội thoại phù hợp. Từ khóa không hợp lệ. |
| Hậu điều kiện | Danh sách người dùng/hội thoại phù hợp được hiển thị. |

### Use Case: Gửi file / hình ảnh

| Mục | Nội dung |
|---|---|
| Tên Use Case | Gửi file hoặc hình ảnh |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập và đang mở hội thoại hợp lệ. |
| Mục đích | Chia sẻ tài liệu hoặc hình ảnh trong hội thoại. |
| Luồng sự kiện chính | 1. Người dùng chọn biểu tượng đính kèm. <br> 2. Người dùng chọn file hoặc hình ảnh. <br> 3. Hệ thống kiểm tra định dạng và dung lượng. <br> 4. Hệ thống tải file lên bộ lưu trữ. <br> 5. Hệ thống lưu thông tin file vào CSDL. <br> 6. Hệ thống gửi file vào hội thoại. |
| Luồng sự kiện phụ | Người dùng hủy chọn file, hệ thống không thực hiện tải lên. |
| Luồng ngoại lệ | File quá dung lượng. Định dạng không hợp lệ. Tải file thất bại. |
| Hậu điều kiện | Thành công: File/hình ảnh được gửi trong hội thoại. Thất bại: File không được gửi. |

## 3.2.1.4. Đặc tả chức năng quản lý dự án

### Use Case: Tạo dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tạo dự án |
| Tác nhân | Manager, Admin |
| Tiền điều kiện | Người dùng đã đăng nhập và có quyền tạo dự án. |
| Mục đích | Tạo không gian làm việc mới cho một nhóm hoặc dự án. |
| Luồng sự kiện chính | 1. Người dùng chọn chức năng tạo dự án. <br> 2. Hệ thống hiển thị biểu mẫu tạo dự án. <br> 3. Người dùng nhập tên và mô tả dự án. <br> 4. Người dùng nhấn "Tạo". <br> 5. Hệ thống kiểm tra dữ liệu. <br> 6. Hệ thống tạo dự án trong CSDL. <br> 7. Hệ thống hiển thị dự án mới. |
| Luồng sự kiện phụ | Người dùng chọn hủy, hệ thống không tạo dự án. |
| Luồng ngoại lệ | Tên dự án rỗng. Người dùng không có quyền tạo. Tạo dự án thất bại. |
| Hậu điều kiện | Thành công: Dự án mới được tạo. Thất bại: Không có dự án mới. |

### Use Case: Xem danh sách dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem danh sách dự án |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập. |
| Mục đích | Xem các dự án mà người dùng đang tham gia hoặc quản lý. |
| Luồng sự kiện chính | 1. Người dùng mở trang dự án. <br> 2. Hệ thống truy vấn danh sách dự án theo tài khoản người dùng. <br> 3. CSDL trả về danh sách dự án. <br> 4. Hệ thống hiển thị danh sách dự án. |
| Luồng sự kiện phụ | Người dùng chọn một dự án trong danh sách để xem chi tiết. |
| Luồng ngoại lệ | Người dùng chưa tham gia dự án nào. Lỗi tải dữ liệu. |
| Hậu điều kiện | Danh sách dự án được hiển thị. |

### Use Case: Sửa dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Sửa dự án |
| Tác nhân | Owner, Manager |
| Tiền điều kiện | Người dùng đã đăng nhập, đang mở dự án và có quyền chỉnh sửa. |
| Mục đích | Cập nhật thông tin dự án. |
| Luồng sự kiện chính | 1. Người dùng chọn dự án cần sửa. <br> 2. Hệ thống hiển thị thông tin dự án. <br> 3. Người dùng chỉnh sửa tên hoặc mô tả dự án. <br> 4. Người dùng nhấn "Lưu". <br> 5. Hệ thống kiểm tra quyền và dữ liệu. <br> 6. Hệ thống cập nhật thông tin dự án. |
| Luồng sự kiện phụ | Người dùng chọn hủy, hệ thống không lưu thay đổi. |
| Luồng ngoại lệ | Dự án không tồn tại. Người dùng không có quyền sửa. Tên dự án rỗng. |
| Hậu điều kiện | Thành công: Thông tin dự án được cập nhật. Thất bại: Dữ liệu cũ được giữ nguyên. |

### Use Case: Xóa dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xóa dự án |
| Tác nhân | Owner, Manager |
| Tiền điều kiện | Người dùng đã đăng nhập, dự án tồn tại và người dùng có quyền xóa. |
| Mục đích | Xóa hoặc hủy dự án không còn sử dụng. |
| Luồng sự kiện chính | 1. Người dùng chọn dự án cần xóa. <br> 2. Người dùng nhấn "Xóa dự án". <br> 3. Hệ thống hiển thị hộp thoại xác nhận. <br> 4. Người dùng nhấn "Đồng ý". <br> 5. Hệ thống kiểm tra quyền xóa. <br> 6. Hệ thống xóa dự án và dữ liệu liên quan theo quy tắc CSDL. <br> 7. Hệ thống cập nhật danh sách dự án. |
| Luồng sự kiện phụ | Người dùng chọn "Hủy", hệ thống không xóa dự án. |
| Luồng ngoại lệ | Không có quyền xóa. Dự án không tồn tại. Xóa dữ liệu thất bại. |
| Hậu điều kiện | Thành công: Dự án bị xóa khỏi hệ thống. Thất bại: Dự án vẫn tồn tại. |

### Use Case: Thêm thành viên dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Thêm thành viên dự án |
| Tác nhân | Owner, Manager |
| Tiền điều kiện | Người dùng đã đăng nhập, đang mở dự án và có quyền quản lý thành viên. |
| Mục đích | Thêm người dùng vào dự án để cùng làm việc. |
| Luồng sự kiện chính | 1. Người dùng mở danh sách thành viên dự án. <br> 2. Người dùng tìm kiếm thành viên theo tên hoặc email. <br> 3. Hệ thống hiển thị người dùng phù hợp. <br> 4. Người dùng chọn thành viên cần thêm. <br> 5. Hệ thống kiểm tra thành viên đã thuộc dự án chưa. <br> 6. Hệ thống thêm bản ghi thành viên vào CSDL. <br> 7. Hệ thống cập nhật danh sách thành viên. |
| Luồng sự kiện phụ | Người dùng hủy thao tác thêm, hệ thống không cập nhật dữ liệu. |
| Luồng ngoại lệ | Người dùng không tồn tại. Thành viên đã có trong dự án. Người thao tác không có quyền. |
| Hậu điều kiện | Thành công: Thành viên được thêm vào dự án. Thất bại: Danh sách thành viên không thay đổi. |

### Use Case: Xem danh sách thành viên dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem danh sách thành viên dự án |
| Tác nhân | Thành viên dự án, Owner, Manager |
| Tiền điều kiện | Người dùng đã đăng nhập và đang mở dự án mà mình có quyền truy cập. |
| Mục đích | Xem các thành viên đang tham gia dự án và vai trò của từng người. |
| Luồng sự kiện chính | 1. Người dùng mở dự án. <br> 2. Người dùng chọn chức năng quản lý thành viên. <br> 3. Hệ thống gửi yêu cầu lấy danh sách thành viên. <br> 4. CSDL trả về danh sách thành viên và vai trò. <br> 5. Hệ thống hiển thị danh sách thành viên dự án. |
| Luồng sự kiện phụ | Người dùng nhập từ khóa để lọc nhanh thành viên trong danh sách. |
| Luồng ngoại lệ | Người dùng không thuộc dự án. Lỗi tải danh sách thành viên. |
| Hậu điều kiện | Danh sách thành viên dự án được hiển thị. |

## 3.2.1.5. Đặc tả chức năng quản lý bảng nhiệm vụ

### Use Case: Xem bảng Kanban

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem bảng Kanban |
| Tác nhân | Thành viên dự án |
| Tiền điều kiện | Người dùng đã đăng nhập và thuộc dự án. |
| Mục đích | Xem các công việc trong dự án theo trạng thái xử lý. |
| Luồng sự kiện chính | 1. Người dùng mở dự án. <br> 2. Người dùng chọn bảng nhiệm vụ. <br> 3. Hệ thống truy vấn danh sách công việc. <br> 4. Hệ thống phân nhóm công việc theo trạng thái. <br> 5. Hệ thống hiển thị bảng Kanban. |
| Luồng sự kiện phụ | Người dùng lọc công việc theo người thực hiện, deadline hoặc độ ưu tiên. |
| Luồng ngoại lệ | Người dùng không thuộc dự án. Không có công việc để hiển thị. Lỗi tải dữ liệu. |
| Hậu điều kiện | Bảng Kanban được hiển thị. |

### Use Case: Cập nhật trạng thái công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Cập nhật trạng thái công việc |
| Tác nhân | Thành viên dự án |
| Tiền điều kiện | Người dùng đã đăng nhập, thuộc dự án và công việc tồn tại. |
| Mục đích | Thay đổi trạng thái công việc theo tiến độ thực hiện. |
| Luồng sự kiện chính | 1. Người dùng kéo thả công việc sang cột trạng thái mới. <br> 2. Hệ thống nhận trạng thái mới. <br> 3. Hệ thống kiểm tra quyền cập nhật. <br> 4. Hệ thống cập nhật trạng thái công việc vào CSDL. <br> 5. Hệ thống hiển thị công việc ở cột mới. |
| Luồng sự kiện phụ | Người dùng kéo nhầm rồi đưa công việc về trạng thái cũ, hệ thống cập nhật lại trạng thái. |
| Luồng ngoại lệ | Công việc không tồn tại. Người dùng không có quyền cập nhật. Cập nhật thất bại. |
| Hậu điều kiện | Thành công: Trạng thái công việc được cập nhật. Thất bại: Công việc giữ trạng thái cũ. |

### Use Case: Đồng bộ realtime trạng thái task

| Mục | Nội dung |
|---|---|
| Tên Use Case | Đồng bộ realtime trạng thái task |
| Tác nhân | Hệ thống, thành viên dự án |
| Tiền điều kiện | Có thay đổi trạng thái task và các thành viên đang mở bảng Kanban. |
| Mục đích | Cập nhật thay đổi trạng thái task ngay lập tức cho các thành viên liên quan. |
| Luồng sự kiện chính | 1. Một thành viên cập nhật trạng thái task. <br> 2. Hệ thống lưu thay đổi vào CSDL. <br> 3. Hệ thống phát sự kiện realtime. <br> 4. Các giao diện Kanban đang mở nhận sự kiện. <br> 5. Hệ thống cập nhật vị trí và trạng thái task trên giao diện. |
| Luồng sự kiện phụ | Thành viên tải lại trang, hệ thống lấy trạng thái mới nhất từ CSDL. |
| Luồng ngoại lệ | Mất kết nối realtime. Thành viên không còn quyền xem dự án. |
| Hậu điều kiện | Các thành viên nhìn thấy trạng thái task mới nhất. |

## 3.2.1.6. Đặc tả chức năng quản lý công việc

### Use Case: Tạo công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tạo công việc |
| Tác nhân | Manager, thành viên có quyền |
| Tiền điều kiện | Người dùng đã đăng nhập và đang mở dự án. |
| Mục đích | Tạo công việc mới trong dự án. |
| Luồng sự kiện chính | 1. Người dùng chọn chức năng tạo công việc. <br> 2. Hệ thống hiển thị biểu mẫu tạo công việc. <br> 3. Người dùng nhập tiêu đề, mô tả và deadline nếu có. <br> 4. Người dùng nhấn "Tạo". <br> 5. Hệ thống kiểm tra dữ liệu. <br> 6. Hệ thống tạo công việc trong CSDL. <br> 7. Hệ thống hiển thị công việc mới trên bảng Kanban. |
| Luồng sự kiện phụ | Người dùng hủy tạo công việc, hệ thống đóng biểu mẫu. |
| Luồng ngoại lệ | Tiêu đề rỗng. Deadline không hợp lệ. Người dùng không có quyền tạo. |
| Hậu điều kiện | Thành công: Công việc mới được tạo. Thất bại: Không có công việc mới. |

### Use Case: Sửa công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Sửa công việc |
| Tác nhân | Manager, thành viên có quyền |
| Tiền điều kiện | Người dùng đã đăng nhập, thuộc dự án và công việc tồn tại. |
| Mục đích | Cập nhật thông tin công việc. |
| Luồng sự kiện chính | 1. Người dùng mở chi tiết công việc. <br> 2. Người dùng chọn chỉnh sửa. <br> 3. Người dùng thay đổi tiêu đề hoặc mô tả công việc. <br> 4. Người dùng nhấn "Lưu". <br> 5. Hệ thống kiểm tra dữ liệu và quyền thao tác. <br> 6. Hệ thống cập nhật công việc trong CSDL. <br> 7. Hệ thống hiển thị thông tin mới. |
| Luồng sự kiện phụ | Người dùng hủy chỉnh sửa, hệ thống giữ nguyên dữ liệu cũ. |
| Luồng ngoại lệ | Công việc không tồn tại. Công việc đã bị xóa. Người dùng không có quyền sửa. |
| Hậu điều kiện | Thành công: Công việc được cập nhật. Thất bại: Dữ liệu cũ được giữ nguyên. |

### Use Case: Xóa công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xóa công việc |
| Tác nhân | Manager, thành viên có quyền |
| Tiền điều kiện | Người dùng đã đăng nhập, thuộc dự án và công việc tồn tại. |
| Mục đích | Xóa công việc không còn cần thực hiện. |
| Luồng sự kiện chính | 1. Người dùng mở chi tiết công việc. <br> 2. Người dùng nhấn "Xóa". <br> 3. Hệ thống hiển thị hộp thoại xác nhận. <br> 4. Người dùng nhấn "Đồng ý". <br> 5. Hệ thống kiểm tra quyền xóa. <br> 6. Hệ thống xóa hoặc đánh dấu công việc đã xóa. <br> 7. Hệ thống cập nhật lại bảng công việc. |
| Luồng sự kiện phụ | Người dùng chọn "Hủy", hệ thống không xóa công việc. |
| Luồng ngoại lệ | Không có quyền xóa. Công việc không tồn tại. Xóa thất bại. |
| Hậu điều kiện | Thành công: Công việc không còn hiển thị trên bảng. Thất bại: Công việc vẫn tồn tại. |

### Use Case: Xem chi tiết công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem chi tiết công việc |
| Tác nhân | Thành viên dự án |
| Tiền điều kiện | Người dùng đã đăng nhập, thuộc dự án và công việc tồn tại. |
| Mục đích | Xem đầy đủ thông tin của một công việc. |
| Luồng sự kiện chính | 1. Người dùng chọn một công việc trên bảng. <br> 2. Hệ thống gửi yêu cầu lấy chi tiết công việc. <br> 3. CSDL trả về thông tin công việc. <br> 4. Hệ thống hiển thị tiêu đề, mô tả, trạng thái, deadline, người thực hiện, bình luận và file đính kèm. |
| Luồng sự kiện phụ | Người dùng đóng chi tiết công việc, hệ thống quay lại bảng Kanban. |
| Luồng ngoại lệ | Công việc đã bị xóa. Người dùng không có quyền xem. Lỗi tải dữ liệu. |
| Hậu điều kiện | Thông tin chi tiết công việc được hiển thị. |

### Use Case: Phân công công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Phân công công việc |
| Tác nhân | Manager, thành viên có quyền |
| Tiền điều kiện | Người dùng đã đăng nhập, đang mở công việc và có quyền phân công. |
| Mục đích | Gán thành viên chịu trách nhiệm thực hiện công việc. |
| Luồng sự kiện chính | 1. Người dùng mở chi tiết công việc. <br> 2. Người dùng chọn chức năng phân công. <br> 3. Hệ thống hiển thị danh sách thành viên dự án. <br> 4. Người dùng chọn thành viên cần phân công. <br> 5. Hệ thống kiểm tra thành viên có thuộc dự án không. <br> 6. Hệ thống thêm bản ghi phân công vào CSDL. <br> 7. Hệ thống cập nhật danh sách người thực hiện. |
| Luồng sự kiện phụ | Người dùng hủy thao tác phân công, hệ thống không cập nhật dữ liệu. |
| Luồng ngoại lệ | Thành viên không thuộc dự án. Thành viên đã được phân công trước đó. Người dùng không có quyền phân công. |
| Hậu điều kiện | Thành công: Thành viên được gán vào công việc. Thất bại: Danh sách người thực hiện không thay đổi. |

### Use Case: Đặt deadline khi tạo công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Đặt deadline khi tạo công việc |
| Tác nhân | Manager, thành viên có quyền |
| Tiền điều kiện | Người dùng đã đăng nhập, đang mở bảng Kanban và có quyền tạo công việc. |
| Mục đích | Thiết lập thời hạn hoàn thành ngay khi tạo công việc mới. |
| Luồng sự kiện chính | 1. Người dùng chọn chức năng tạo công việc. <br> 2. Hệ thống hiển thị biểu mẫu tạo công việc. <br> 3. Người dùng nhập tiêu đề công việc. <br> 4. Người dùng chọn ngày hết hạn tại trường deadline. <br> 5. Người dùng nhấn "Tạo". <br> 6. Hệ thống kiểm tra dữ liệu và deadline. <br> 7. Hệ thống lưu công việc kèm deadline vào CSDL. <br> 8. Hệ thống hiển thị công việc mới trên bảng Kanban. |
| Luồng sự kiện phụ | Người dùng không chọn deadline, hệ thống tạo công việc không có hạn chót. |
| Luồng ngoại lệ | Deadline sai định dạng. Người dùng không có quyền tạo công việc. Tiêu đề công việc bị bỏ trống. |
| Hậu điều kiện | Thành công: Công việc mới được tạo kèm deadline nếu người dùng đã chọn. Thất bại: Không có công việc mới được tạo. |

## 3.2.1.7. Đặc tả chức năng tìm kiếm

### Use Case: Tìm kiếm người dùng để nhắn tin

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tìm kiếm người dùng để nhắn tin |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập. |
| Mục đích | Tìm nhanh người dùng hoặc hội thoại để gửi tin nhắn cá nhân. |
| Luồng sự kiện chính | 1. Người dùng mở trang tin nhắn. <br> 2. Người dùng nhập tên hoặc email vào ô tìm kiếm. <br> 3. Hệ thống lọc danh sách người dùng theo từ khóa. <br> 4. Hệ thống hiển thị người dùng phù hợp. <br> 5. Người dùng chọn một người để mở hội thoại. |
| Luồng sự kiện phụ | Người dùng xóa từ khóa, hệ thống hiển thị lại danh sách người dùng ban đầu. |
| Luồng ngoại lệ | Không tìm thấy người dùng phù hợp. |
| Hậu điều kiện | Hội thoại với người dùng được chọn được mở hoặc danh sách kết quả được hiển thị. |

### Use Case: Tìm kiếm thành viên để thêm vào dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tìm kiếm thành viên để thêm vào dự án |
| Tác nhân | Owner, Manager |
| Tiền điều kiện | Người dùng đã đăng nhập, đang mở dự án và có quyền thêm thành viên. |
| Mục đích | Tìm người dùng theo tên hoặc email để mời vào dự án. |
| Luồng sự kiện chính | 1. Người dùng mở cửa sổ quản lý thành viên dự án. <br> 2. Người dùng nhập tên hoặc email vào ô tìm kiếm. <br> 3. Hệ thống kiểm tra từ khóa. <br> 4. Hệ thống truy vấn người dùng phù hợp. <br> 5. Hệ thống loại bỏ những người đã có trong dự án. <br> 6. Hệ thống hiển thị danh sách người dùng có thể thêm. |
| Luồng sự kiện phụ | Người dùng xóa từ khóa, hệ thống ẩn danh sách gợi ý tìm kiếm. |
| Luồng ngoại lệ | Không tìm thấy người dùng phù hợp. Người dùng không có quyền thêm thành viên. |
| Hậu điều kiện | Danh sách người dùng phù hợp được hiển thị để người dùng chọn thêm vào dự án. |

### Use Case: Tìm kiếm thành viên để phân công công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Tìm kiếm thành viên để phân công công việc |
| Tác nhân | Manager, thành viên có quyền |
| Tiền điều kiện | Người dùng đã đăng nhập, đang mở chi tiết công việc và có quyền phân công. |
| Mục đích | Tìm nhanh thành viên trong dự án để gán làm người thực hiện công việc. |
| Luồng sự kiện chính | 1. Người dùng mở chi tiết công việc. <br> 2. Người dùng mở khu vực phân công thành viên. <br> 3. Người dùng nhập từ khóa tìm kiếm. <br> 4. Hệ thống lọc danh sách thành viên dự án theo từ khóa. <br> 5. Hệ thống hiển thị thành viên phù hợp. |
| Luồng sự kiện phụ | Người dùng xóa từ khóa, hệ thống hiển thị lại danh sách thành viên dự án. |
| Luồng ngoại lệ | Không tìm thấy thành viên phù hợp. Người dùng không có quyền phân công công việc. |
| Hậu điều kiện | Danh sách thành viên phù hợp được hiển thị để chọn phân công. |

## 3.2.1.8. Đặc tả chức năng quản lý thông báo

### Use Case: Xem danh sách thông báo

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem danh sách thông báo |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập vào hệ thống. |
| Mục đích | Xem các thông báo liên quan đến tài khoản như tin nhắn mới, công việc hoặc cập nhật dự án. |
| Luồng sự kiện chính | 1. Người dùng chọn biểu tượng thông báo hoặc mở trang thông báo. <br> 2. Hệ thống gửi yêu cầu lấy danh sách thông báo. <br> 3. Hệ thống truy vấn thông báo theo tài khoản người dùng. <br> 4. CSDL trả về danh sách thông báo. <br> 5. Hệ thống hiển thị danh sách thông báo. |
| Luồng sự kiện phụ | Người dùng lọc thông báo theo loại như tin nhắn, công việc hoặc dự án. |
| Luồng ngoại lệ | Không có thông báo. Lỗi tải danh sách thông báo. Người dùng chưa đăng nhập. |
| Hậu điều kiện | Danh sách thông báo được hiển thị cho người dùng. |

### Use Case: Điều hướng đến nội dung từ thông báo

| Mục | Nội dung |
|---|---|
| Tên Use Case | Điều hướng đến nội dung từ thông báo |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập. Thông báo tồn tại trong danh sách thông báo của người dùng. |
| Mục đích | Cho phép người dùng mở nhanh nội dung liên quan đến thông báo. |
| Luồng sự kiện chính | 1. Người dùng chọn một thông báo. <br> 2. Hệ thống kiểm tra thông báo được chọn. <br> 3. Hệ thống cập nhật trạng thái đã đọc cho thông báo. <br> 4. Hệ thống xác định đường dẫn nội dung liên quan. <br> 5. Hệ thống điều hướng người dùng đến trang tương ứng. |
| Luồng sự kiện phụ | Nếu thông báo không có đường dẫn, hệ thống chỉ đánh dấu đã đọc và giữ người dùng ở trang thông báo. |
| Luồng ngoại lệ | Nội dung liên quan không còn tồn tại hoặc đã bị thu hồi. Người dùng không có quyền truy cập nội dung liên quan. |
| Hậu điều kiện | Thành công: Người dùng được chuyển đến nội dung liên quan. Thất bại: Hệ thống hiển thị thông báo lỗi hoặc giữ nguyên trang hiện tại. |

### Use Case: Xóa thông báo

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xóa thông báo |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập. Thông báo cần xóa thuộc về người dùng hiện tại. |
| Mục đích | Xóa thông báo không còn cần theo dõi khỏi danh sách thông báo. |
| Luồng sự kiện chính | 1. Người dùng mở danh sách thông báo. <br> 2. Người dùng chọn nút "Xóa" tại thông báo cần xóa. <br> 3. Hệ thống gửi yêu cầu xóa thông báo. <br> 4. Hệ thống kiểm tra thông báo có thuộc người dùng hiện tại không. <br> 5. Hệ thống xóa thông báo khỏi CSDL. <br> 6. Hệ thống cập nhật lại danh sách thông báo. |
| Luồng sự kiện phụ | Người dùng không chọn xóa, hệ thống giữ nguyên danh sách thông báo. |
| Luồng ngoại lệ | Thông báo không tồn tại. Người dùng không có quyền xóa thông báo. Xóa thông báo thất bại. |
| Hậu điều kiện | Thành công: Thông báo bị xóa khỏi danh sách. Thất bại: Thông báo vẫn còn trong danh sách. |

## 3.2.1.9. Đặc tả chức năng thống kê báo cáo

### Use Case: Xem thống kê dự án

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem thống kê dự án |
| Tác nhân | Manager, Admin, thành viên dự án |
| Tiền điều kiện | Người dùng đã đăng nhập và có quyền xem dự án. |
| Mục đích | Xem số liệu tổng quan về tiến độ và tình trạng của dự án. |
| Luồng sự kiện chính | 1. Người dùng mở chức năng thống kê. <br> 2. Người dùng chọn phạm vi thống kê dự án. <br> 3. Hệ thống kiểm tra quyền truy cập dự án. <br> 4. Hệ thống truy vấn dữ liệu công việc và thành viên. <br> 5. Hệ thống tổng hợp số liệu. <br> 6. Hệ thống hiển thị biểu đồ và báo cáo dự án. |
| Luồng sự kiện phụ | Người dùng thay đổi bộ lọc thời gian hoặc trạng thái công việc, hệ thống cập nhật lại thống kê. |
| Luồng ngoại lệ | Không có quyền xem dự án. Dự án không có dữ liệu thống kê. Truy vấn dữ liệu thất bại. |
| Hậu điều kiện | Báo cáo thống kê dự án được hiển thị. |

### Use Case: Xem thống kê công việc

| Mục | Nội dung |
|---|---|
| Tên Use Case | Xem thống kê công việc |
| Tác nhân | Người dùng |
| Tiền điều kiện | Người dùng đã đăng nhập và có dữ liệu công việc liên quan. |
| Mục đích | Xem số lượng công việc theo trạng thái, deadline và độ ưu tiên. |
| Luồng sự kiện chính | 1. Người dùng chọn thống kê công việc. <br> 2. Hệ thống kiểm tra phạm vi dữ liệu người dùng được xem. <br> 3. Hệ thống truy vấn danh sách công việc. <br> 4. Hệ thống tổng hợp công việc theo trạng thái, deadline và độ ưu tiên. <br> 5. Hệ thống hiển thị số liệu và biểu đồ. |
| Luồng sự kiện phụ | Người dùng lọc công việc theo dự án hoặc thời gian. |
| Luồng ngoại lệ | Không có dữ liệu công việc. Người dùng không có quyền xem một số công việc. |
| Hậu điều kiện | Thống kê công việc được hiển thị. |

### Use Case: Báo cáo hiệu suất thành viên

| Mục | Nội dung |
|---|---|
| Tên Use Case | Báo cáo hiệu suất thành viên |
| Tác nhân | Manager, Admin |
| Tiền điều kiện | Người dùng đã đăng nhập và có quyền xem báo cáo thành viên. |
| Mục đích | Đánh giá mức độ hoàn thành công việc của từng thành viên trong dự án. |
| Luồng sự kiện chính | 1. Người dùng mở chức năng báo cáo hiệu suất. <br> 2. Người dùng chọn dự án hoặc thành viên cần xem. <br> 3. Hệ thống kiểm tra quyền truy cập. <br> 4. Hệ thống truy vấn số lượng công việc được giao, đã hoàn thành, đang thực hiện và quá hạn. <br> 5. Hệ thống tính toán tỷ lệ hoàn thành. <br> 6. Hệ thống hiển thị báo cáo hiệu suất. |
| Luồng sự kiện phụ | Người dùng thay đổi bộ lọc thời gian, hệ thống tính toán lại báo cáo. |
| Luồng ngoại lệ | Thành viên không thuộc dự án. Không có quyền xem báo cáo. Không có dữ liệu công việc. |
| Hậu điều kiện | Báo cáo hiệu suất thành viên được hiển thị. |
