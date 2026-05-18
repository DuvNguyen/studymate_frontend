# StudyMate Frontend

Frontend web cho StudyMate LMS, xây dựng bằng Next.js App Router, phục vụ trải nghiệm cho học viên, giảng viên, staff và admin.

## Tổng quan kỹ thuật

- Framework: Next.js `16.2.0`
- UI: React `19.2.4`
- Styling: Tailwind CSS `4`
- Auth: Clerk (`@clerk/nextjs`)
- HTTP client: Axios
- Validation client-side: Zod
- Charts: Recharts
- Notifications: React Hot Toast
- Testing: Vitest + Testing Library

## Kiến trúc frontend

- Router theo App Router trong `src/app`
- Nghiệp vụ tách qua custom hooks trong `src/hooks`
- State theo context ở `src/contexts`
- Component tái sử dụng ở `src/components`
- Hằng số API trong `src/constants/api.ts`

## Route chính

Public:

- `/`
- `/courses`
- `/courses/[slug]`
- `/instructors/[id]`
- `/sign-in`
- `/sign-up`

Authenticated:

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/student/courses`
- `/dashboard/student/purchases`
- `/dashboard/student/wishlist`
- `/dashboard/instructor/courses`
- `/dashboard/instructor/courses/[id]/builder`
- `/dashboard/instructor/videos`
- `/dashboard/instructor/discussions`
- `/dashboard/instructor/wallet`
- `/dashboard/instructor/coupons`
- `/dashboard/instructor/kyc`
- `/dashboard/admin/users`
- `/dashboard/admin/courses`
- `/dashboard/admin/courses/[id]`
- `/dashboard/admin/videos`
- `/dashboard/admin/analytics`
- `/dashboard/admin/ledger`
- `/dashboard/admin/payouts`
- `/dashboard/admin/refunds`
- `/dashboard/admin/reconciliation`

Học tập và thanh toán:

- `/courses/[slug]/learn`
- `/courses/[slug]/test/[quizId]`
- `/courses/[slug]/instructor-view`
- `/cart`
- `/checkout/pending`
- `/onboarding`

## Bảo vệ route

Middleware Clerk nằm ở `src/app/middleware.ts`:

- Public route: `/`, `/sign-in(.*)`, `/sign-up(.*)`
- Các route còn lại gọi `auth.protect()`

## Cấu hình ảnh

`next.config.ts` cho phép ảnh từ:

- `res.cloudinary.com`
- `localhost:3001`
- `placehold.co`
- `images.unsplash.com`
- `img.clerk.com`
- `img.vietqr.io`

## Biến môi trường

Tạo `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Các key bắt buộc:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL`
- `NEXT_PUBLIC_API_URL` (ví dụ: `http://localhost:3001/api/v1`)

## Cài đặt và chạy

```bash
npm install
npm run dev
```

App chạy mặc định tại `http://localhost:3000`.

Build production:

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm run test:watch`

## Ghi chú tích hợp backend

- Frontend đang gọi API qua `NEXT_PUBLIC_API_URL`; không hardcode `localhost` trong code mới.
- Backend trả response qua `TransformInterceptor`; với payload phân trang, đọc dữ liệu theo cấu trúc `json.data.data` và `json.data.meta`.
