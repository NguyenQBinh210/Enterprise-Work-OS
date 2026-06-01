# Phan cong du an va tin nhan mau - Nhom A

Nhom A do manager Nguyen Minh Quan phu trach. Moi du an duoc bo tri 4 thanh vien, moi thanh vien trong du an dam nhan mot nhom chuc nang rieng de de theo doi va kiem thu.

## Thanh vien nhom A

| Ma TK | Ho va ten | Vai tro | Chuc vu |
|---|---|---|---|
| MGR01 | Nguyễn Minh Quân | manager | Project Manager |
| A01 | Phạm Gia Huy | member | Frontend Developer |
| A02 | Đỗ Thanh Tùng | member | Backend Developer |
| A03 | Vũ Minh Đức | member | Fullstack Developer |
| A04 | Bùi Quốc Bảo | member | QA Tester |
| A05 | Hoàng Anh Khoa | member | Backend Developer |
| A06 | Nguyễn Thu Hà | member | UI/UX Designer |
| A07 | Trần Mai Linh | member | Business Analyst |
| A08 | Lê Phương Thảo | member | Frontend Developer |
| A09 | Đặng Khánh Vy | member | QA Tester |

## Du an TF-A01 - Xay dung module dang nhap va phan quyen

| Truong thong tin | Noi dung |
|---|---|
| Tiêu đề | Xây dựng module đăng nhập và phân quyền |
| Mô tả | Dự án tập trung xây dựng luồng đăng nhập, đăng xuất, đăng ký tài khoản và kiểm soát quyền truy cập theo vai trò người dùng trong hệ thống TaskFlow. |
| Deadline | 15/06/2026 |

| Thanh vien duoc giao | Vai tro | Tieu de nhiem vu | Mo ta nhiem vu | Deadline | Trang thai |
|---|---|---|---|---|---|
| Nguyễn Minh Quân | Manager | Lập kế hoạch module đăng nhập | Phân chia task, theo dõi tiến độ, kiểm tra luồng đăng nhập và duyệt yêu cầu phân quyền trước khi nghiệm thu. | 10/06/2026 | Đang tiến hành |
| Trần Mai Linh | Business Analyst | Viết đặc tả đăng nhập và phân quyền | Mô tả các trường hợp đăng nhập, đăng ký, đăng xuất, quyền admin/manager/member và điều kiện truy cập từng trang. | 11/06/2026 | Hoàn thành |
| Phạm Gia Huy | Frontend Developer | Xây dựng giao diện đăng nhập | Tạo form đăng nhập, validate email và mật khẩu, hiển thị trạng thái loading, thông báo lỗi khi thông tin không hợp lệ. | 13/06/2026 | Đang tiến hành |
| Đỗ Thanh Tùng | Backend Developer | Kết nối Supabase Auth | Xử lý đăng nhập, đăng xuất, lấy session người dùng và bảo vệ route dashboard bằng dữ liệu Supabase. | 15/06/2026 | Cần làm |

### Tin nhan mau TF-A01

| Nguoi gui | Noi dung |
|---|---|
| Nguyễn Minh Quân | Dự án TF-A01 ưu tiên hoàn thành luồng đăng nhập trước, sau đó mới kiểm tra phân quyền. |
| Trần Mai Linh | Em đã bổ sung yêu cầu: user thường không được truy cập trang admin. |
| Phạm Gia Huy | Form đăng nhập đã validate email rỗng và mật khẩu rỗng. |
| Đỗ Thanh Tùng | Phần Supabase Auth đã chạy được, còn cần xử lý thông báo khi sai mật khẩu. |

## Du an TF-A02 - Quan ly du an va thanh vien

| Truong thong tin | Noi dung |
|---|---|
| Tiêu đề | Quản lý dự án và thành viên |
| Mô tả | Dự án xây dựng chức năng tạo, sửa, xóa dự án, hiển thị danh sách dự án và mời thành viên tham gia dự án theo email hoặc tài khoản người dùng. |
| Deadline | 25/06/2026 |

| Thanh vien duoc giao | Vai tro | Tieu de nhiem vu | Mo ta nhiem vu | Deadline | Trang thai |
|---|---|---|---|---|---|
| Nguyễn Minh Quân | Manager | Kiểm soát tiến độ quản lý dự án | Theo dõi các chức năng tạo dự án, sửa dự án, xóa dự án và quyền thao tác của từng vai trò trong dự án. | 18/06/2026 | Đang tiến hành |
| Nguyễn Thu Hà | UI/UX Designer | Thiết kế giao diện quản lý dự án | Thiết kế danh sách dự án, form tạo dự án, form chỉnh sửa dự án và modal mời thành viên. | 19/06/2026 | Hoàn thành |
| Lê Phương Thảo | Frontend Developer | Xây dựng màn hình dự án | Xây dựng giao diện danh sách dự án, form thêm/sửa dự án và ô tìm kiếm thành viên theo email. | 23/06/2026 | Đang tiến hành |
| Hoàng Anh Khoa | Backend Developer | Xử lý thành viên dự án | Viết logic tạo dự án, cập nhật dự án, mời thành viên bằng email và kiểm tra không mời trùng thành viên. | 25/06/2026 | Cần làm |

### Tin nhan mau TF-A02

| Nguoi gui | Noi dung |
|---|---|
| Nguyễn Minh Quân | Chức năng xóa dự án cần kiểm tra quyền, không để member thường xóa được. |
| Nguyễn Thu Hà | Em đã thiết kế modal mời thành viên với ô tìm kiếm theo email. |
| Lê Phương Thảo | Giao diện danh sách dự án đã hiển thị tên, mô tả và số thành viên. |
| Hoàng Anh Khoa | Backend đã chặn trường hợp mời trùng một thành viên vào cùng dự án. |

## Du an TF-A03 - Quan ly cong viec theo bang Kanban

| Truong thong tin | Noi dung |
|---|---|
| Tiêu đề | Quản lý công việc theo bảng Kanban |
| Mô tả | Dự án triển khai bảng Kanban cho phép tạo task, cập nhật task, kéo thả task giữa các trạng thái và lưu lại vị trí công việc trong từng dự án. |
| Deadline | 05/07/2026 |

| Thanh vien duoc giao | Vai tro | Tieu de nhiem vu | Mo ta nhiem vu | Deadline | Trang thai |
|---|---|---|---|---|---|
| Nguyễn Minh Quân | Manager | Nghiệm thu luồng quản lý task | Kiểm tra các trạng thái Cần làm, Đang tiến hành, Hoàn thành và duyệt quy trình tạo/sửa/xóa task. | 28/06/2026 | Đang tiến hành |
| Vũ Minh Đức | Fullstack Developer | Tích hợp bảng Kanban | Xây dựng bảng Kanban, xử lý kéo thả task giữa các cột và lưu trạng thái, vị trí task sau khi cập nhật. | 02/07/2026 | Đang tiến hành |
| Bùi Quốc Bảo | QA Tester | Kiểm thử tạo và cập nhật task | Lập ca kiểm thử cho tạo task, sửa tiêu đề, sửa mô tả, nhập deadline và validate trường tiêu đề bắt buộc. | 04/07/2026 | Cần làm |
| Đặng Khánh Vy | QA Tester | Kiểm thử kéo thả task | Kiểm tra task đổi trạng thái đúng, số lượng task từng cột cập nhật đúng và dữ liệu vẫn giữ sau khi tải lại trang. | 05/07/2026 | Cần làm |

### Tin nhan mau TF-A03

| Nguoi gui | Noi dung |
|---|---|
| Nguyễn Minh Quân | Hôm nay nhóm tập trung kiểm tra kéo thả task giữa các cột Kanban. |
| Vũ Minh Đức | Em đã nối sự kiện kéo thả với hàm cập nhật trạng thái task. |
| Bùi Quốc Bảo | Em sẽ test thêm trường hợp tạo task nhưng bỏ trống tiêu đề. |
| Đặng Khánh Vy | Em phát hiện task đổi cột đúng nhưng cần kiểm tra lại thứ tự sau khi tải lại trang. |

## Du an TF-A04 - Thong bao va nhat ky hoat dong

| Truong thong tin | Noi dung |
|---|---|
| Tiêu đề | Thông báo và nhật ký hoạt động |
| Mô tả | Dự án xây dựng chức năng tạo thông báo cho người dùng khi có sự kiện quan trọng như được mời vào dự án, được giao task, task thay đổi trạng thái và ghi nhận nhật ký hoạt động. |
| Deadline | 15/07/2026 |

| Thanh vien duoc giao | Vai tro | Tieu de nhiem vu | Mo ta nhiem vu | Deadline | Trang thai |
|---|---|---|---|---|---|
| Nguyễn Minh Quân | Manager | Xác định sự kiện thông báo | Chọn các thao tác cần tạo thông báo như mời thành viên, gán task, cập nhật task và đổi trạng thái công việc. | 08/07/2026 | Hoàn thành |
| Đỗ Thanh Tùng | Backend Developer | Xây dựng hàm tạo thông báo | Viết logic tạo notification cho đúng người nhận khi có sự kiện trong dự án hoặc trong task. | 12/07/2026 | Đang tiến hành |
| Phạm Gia Huy | Frontend Developer | Xây dựng giao diện thông báo | Xây dựng trang danh sách thông báo, badge số lượng thông báo chưa đọc và thao tác đánh dấu đã đọc. | 14/07/2026 | Cần làm |
| Trần Mai Linh | Business Analyst | Đặc tả nghiệp vụ thông báo | Mô tả nội dung thông báo, người nhận, trạng thái đã đọc/chưa đọc và quyền xem thông báo. | 15/07/2026 | Đang tiến hành |

### Tin nhan mau TF-A04

| Nguoi gui | Noi dung |
|---|---|
| Nguyễn Minh Quân | Mọi người liệt kê các thao tác nào cần ghi log để đưa vào báo cáo. |
| Trần Mai Linh | Theo nghiệp vụ, mời thành viên, tạo task và đổi trạng thái task đều cần có thông báo. |
| Đỗ Thanh Tùng | Em đã tạo hàm createNotification, còn cần truyền đúng user nhận thông báo. |
| Phạm Gia Huy | Giao diện badge thông báo chưa đọc đã hiển thị trên thanh header. |

## Tong hop phan bo nhom A

Luu y: Tong thanh vien duy nhat cua nhom A la 10 nguoi. Khong cong don so thanh vien theo tung du an, vi mot thanh vien co the tham gia nhieu du an khac nhau.

| Du an | So thanh vien | Thanh vien |
|---|---:|---|
| TF-A01 | 4 | Nguyễn Minh Quân, Trần Mai Linh, Phạm Gia Huy, Đỗ Thanh Tùng |
| TF-A02 | 4 | Nguyễn Minh Quân, Nguyễn Thu Hà, Lê Phương Thảo, Hoàng Anh Khoa |
| TF-A03 | 4 | Nguyễn Minh Quân, Vũ Minh Đức, Bùi Quốc Bảo, Đặng Khánh Vy |
| TF-A04 | 4 | Nguyễn Minh Quân, Đỗ Thanh Tùng, Phạm Gia Huy, Trần Mai Linh |

| Chi tieu | Gia tri |
|---|---:|
| Tong so tai khoan trong nhom A | 10 |
| So manager | 1 |
| So member | 9 |
| So du an | 4 |
| So thanh vien moi du an | 4 |
