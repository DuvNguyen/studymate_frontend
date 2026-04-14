# StudyMate - Frontend Web App

StudyMate là giao diện người dùng hiện đại của hệ thống quản lý học tập (LMS), được thiết kế với phong cách **Neo-Brutalist** mạnh mẽ, trực quan và tối ưu cho trải nghiệm người dùng trên mọi thiết bị.

## ✨ Điểm nổi bật

- **Thiết kế Neo-Brutalist**: Sử dụng các khối màu đậm, viền dày và hiệu ứng đổ bóng đặc trưng, mang lại cảm giác cao cấp và hiện đại.
- **Đa vai trò (Role-based UI)**: Giao diện tự động thay đổi dựa trên vai trò người dùng (STUDENT, INSTRUCTOR, STAFF, ADMIN).
- **Trải nghiệm mượt mà**: Tối ưu hóa hiệu năng với Next.js App Router, React Server Components và Tailwind CSS 4.
- **Tính năng nổi bật**:
    - Bộ lọc khóa học linh hoạt theo danh mục đa tầng.
    - Dashboard quản lý riêng biệt cho từng loại người dùng.
    - Quy trình nộp tài liệu KYC cho Giảng viên trực quan (Preview ảnh, xóa linh hoạt).
    - Tích hợp Clerk để quản lý đăng nhập/đăng ký một cách bảo mật.

## 🚀 Công nghệ sử dụng

- **Môi trường**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentication**: [Clerk for Next.js](https://clerk.com/docs/references/nextjs/overview)
- **Data Fetching**: Axios & Custom Hooks
- **Thông báo**: React Hot Toast

## 🏗️ Cấu trúc Project

Mã nguồn được tổ chức theo quy chuẩn Next.js mới nhất:

- `src/app`: Chứa các route, layouts và pages của ứng dụng.
- `src/components`: Thư viện các thành phần UI dùng chung (Button, Card, Navbar...).
- `src/hooks`: Các custom hook xử lý gọi API và logic nghiệp vụ phía client (e.g., `useCurrentUser`, `useCourses`).
- `src/public`: Chứa các tài nguyên tĩnh như ảnh, biểu tượng.
- `middleware.ts`: Bảo vệ các route yêu cầu đăng nhập bằng Clerk Middleware.

## 🛠️ Cài đặt và Chạy Project

### 1. Cấu hình môi trường
Tạo file `.env.local` và điền các khóa cần thiết từ Clerk:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URL của Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 2. Cài đặt dependency
```bash
npm install
```

### 3. Chạy ứng dụng
```bash
npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

## 🎨 Quy trình Phát triển UI

Chúng tôi ưu tiên:
1. **Visual Excellence**: Tránh màu sắc mặc định, sử dụng bảng màu HSL được tinh chỉnh.
2. **Dynamic Design**: Các hiệu ứng hover, micro-animations và interactive elements phong phú.
3. **Typography**: Sử dụng các font hiện đại từ Google Fonts để tăng khả năng đọc.

---

## 📄 License
Project này được phát triển nội bộ cho StudyMate. Mọi hình thức sao chép cần được sự đồng ý của tác giả.
