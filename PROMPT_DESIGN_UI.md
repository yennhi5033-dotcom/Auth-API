# Prompt Generator UI/UX Design - Hệ thống Xác thực (Auth & RBAC)

Tài liệu tập hợp các Prompt chuẩn chỉnh (hỗ trợ tiếng Việt và tiếng Anh) dùng để đưa vào các công cụ AI tạo UI (v0 by Vercel, Bolt.new, Lovable, Claude Artifacts, ChatGPT, Midjourney, Figma AI...) nhằm sinh giao diện thiết kế hoàn chỉnh cho dự án Auth API.

---

## 1. Master Prompt (Toàn bộ hệ thống - Khuyên dùng cho v0.dev / Bolt.new / Lovable)

Sao chép toàn bộ đoạn prompt dưới đây vào **v0.dev**, **Bolt.new** hoặc **Claude 3.7**:

```markdown
Create a modern, sleek, high-conversion Authentication & User Management Dashboard web application in React (Tailwind CSS, Lucide React, Framer Motion) designed for a fullstack Node.js/Express Auth API.

### Design System & Theme:
- **Style:** Clean, minimalist, modern SaaS design (inspired by Linear, Supabase, and Stripe).
- **Color Palette:**
  - Primary: Deep Indigo / Violet (`#6366F1` or `#4F46E5`)
  - Accent / Success: Emerald Green (`#10B981`)
  - Danger / Error: Rose / Crimson (`#EF4444`)
  - Background: Slate / Zinc neutral palette with glassmorphism touches (`bg-slate-50` light / `bg-zinc-900` dark mode toggle support).
- **Typography:** Inter or Geist sans, crisp hierarchy, subtle borders (`border-zinc-200 / border-zinc-800`).

---

### Pages & Features to Build:

1. **Authentication Layout (Tabs or Switchable Views):**
   - **Login Screen:**
     - Email and password input fields with floating labels, icons, and show/hide password toggle.
     - "Remember me" checkbox & "Forgot password?" link.
     - Prominent "Sign in with Google" button with official Google SVG logo and hover animations.
     - Form validation states (error alerts, helper text, loading spinner on submit button).
     - Switch link to Register page.
   - **Register Screen:**
     - Full Name, Email, Password, Confirm Password.
     - Dynamic password strength meter (progress bar with 4 levels: Weak, Fair, Good, Strong).
     - Role Selector pill badges (`User` by default, or `Admin` for demo preview).
     - "Sign up with Google" alternative button.
     - Checkbox agreeing to Terms & Privacy.

2. **User Profile & Account Settings (`/me` & `/change-password`):**
   - **Profile Card:**
     - User Avatar (with fallback initials or Google profile picture), Name, Email badge, Role badge (`User` or `Admin`).
     - "Auth Provider" tag: Badge showing `local` (Email/Password) or `google` (Google OAuth).
     - Account metadata: Created Date, Last Updated.
   - **Change Password Section:**
     - Old Password, New Password, Confirm New Password inputs with show/hide eye toggle.
     - Visual feedback on matching passwords & minimum length requirements.
     - Save Changes button with loading state.
   - **Logout Action:**
     - Clean dropdown menu or quick logout button with confirm modal.

3. **Admin Dashboard Preview (`/admin/dashboard` - RBAC Protected):**
   - If user has `role: "admin"`:
     - Show an elegant analytics summary (Total users, Active sessions, OAuth vs Local registrations ratio).
     - Mock Data Table listing registered users (Name, Email, Role, Auth Type, Created Date, Actions: Edit/Delete).
     - Role badge pill styling: `admin` in purple/indigo, `user` in blue/gray.
   - If user has `role: "user"`:
     - Show an attractive 403 Forbidden / Access Denied banner with an explanation and "Request Admin Access" or "Back to Home" button.

4. **API Testing & Feedback Notifications (Toast / Toastify / Sonner):**
   - Visual Toast alerts for:
     - "Login successful! Welcome back, [User Name]"
     - "Password changed successfully"
     - "Unauthorized: Session expired. Please log in again."
     - "Conflict: Email already registered."

---

### Tech Stack Details:
- Framework: React 18+ (Vite) / Next.js Tailwind CSS
- Icons: `lucide-react`
- Animation: `framer-motion` for smooth page tab transitions and modal popups.
- Responsive: Fully mobile-first, tablet, and desktop adaptive.
```

---

## 2. Prompt từng màn hình chi tiết (Modular Prompts)

### 2.1. Màn hình Đăng nhập & Đăng ký (Auth Modal / Card)

**Mục tiêu:** Tạo form Login/Register chuyển tab mượt mà kèm nút Google Sign-In nổi bật.

```markdown
Design a responsive Authentication card component in Tailwind CSS and React:
- Centered card on a clean subtle gradient background with blur shadows.
- Tab switch between "Login" and "Sign Up".
- Input fields:
  - Email (with Mail icon)
  - Password (with Lock icon and show/hide eye toggle)
  - Full Name (on Sign Up tab, with User icon)
- Nổi bật nút "Continue with Google" với icon SVG Google màu chuẩn, viền mềm mại.
- Loading state: Button disable + spinner animation khi đang gửi request.
- Thông báo lỗi: Alert box màu đỏ nhạt khi Backend trả về mã 400, 401, 409.
- Thông báo thành công: Toast xanh lá khi đăng nhập/đăng ký thành công.
```

---

### 2.2. Màn hình Profile User & Đổi mật khẩu

**Mục tiêu:** Hiển thị thông tin sau khi đăng nhập (`/api/auth/me`) và form đổi mật khẩu.

```markdown
Design a modern User Profile & Settings page in React with Tailwind CSS:
- Header: User Avatar (hỗ trợ ảnh Google OAuth hoặc Avatar mặc định), Tên người dùng, Email, Role badge (Admin màu tím, User màu xanh biển), Auth Provider badge (Google / Local).
- Information Section:
  - User ID (có nút Copy to Clipboard).
  - Ngày tham gia (Created At) & Cập nhật cuối (Updated At).
- Change Password Section (Chỉ hiển thị nếu Auth Type là 'local'):
  - Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
  - Thanh tiến trình độ mạnh mật khẩu (Password Strength Meter).
  - Nút "Cập nhật mật khẩu".
- Nút "Đăng xuất" ở góc trên với icon LogOut màu đỏ cảnh báo.
```

---

### 2.3. Màn hình Phân quyền Quản trị (Admin Dashboard & RBAC Guard)

**Mục tiêu:** Giao diện cho Admin (`/api/auth/admin/dashboard`) và màn hình chặn 403 Forbidden nếu là `user`.

```markdown
Design an Admin RBAC Management Dashboard component with two conditional states:
1. Admin View (User Role = 'admin'):
   - KPI Cards: Tổng User, Số tài khoản Google Login, Số tài khoản Local, Lượt truy cập.
   - User List Table: Cột Avatar, Tên, Email, Phân quyền (Badge Admin/User), Loại tài khoản (Google/Local), Ngày tạo, Thao tác.
   - Bộ lọc (Filter by Role: All, Admin, User) và ô Search theo tên/email.
2. Restricted View (User Role = 'user'):
   - Empty state / 403 Forbidden Card với hình minh họa ổ khóa bảo mật.
   - Dòng thông báo: "Bạn không có quyền truy cập khu vực quản trị viên".
   - Nút "Quay lại trang cá nhân".
```

---

## 3. Prompt cho Midjourney / Dribbble / UI Image Generation

Dùng để tạo cảm hứng thị giác (Moodboard) hoặc ảnh demo giao diện:

```text
/imagine prompt: Clean and modern SaaS authentication and user profile web application UI design, dashboard with dark and light mode, Linear and Supabase aesthetic, Google sign-in integration, minimalist typography, subtle violet gradients, cards with smooth rounded corners, UI/UX, Dribbble, Figma mockup, high resolution, 8k --ar 16:9 --v 6.0
```

---

## 4. Danh sách các Component cần có cho Frontend

| Component | Đường dẫn đề xuất | Chức năng |
| :--- | :--- | :--- |
| `LoginForm` | `src/components/auth/LoginForm.jsx` | Form đăng nhập email/mật khẩu |
| `RegisterForm` | `src/components/auth/RegisterForm.jsx` | Form tạo tài khoản mới |
| `GoogleButton` | `src/components/auth/GoogleLoginButton.jsx` | Nút đăng nhập Google Firebase |
| `ProfileCard` | `src/components/profile/ProfileCard.jsx` | Card hiển thị thông tin User |
| `ChangePasswordModal` | `src/components/profile/ChangePasswordModal.jsx` | Modal / Form đổi mật khẩu |
| `AdminDashboard` | `src/components/admin/AdminDashboard.jsx` | Giao diện thống kê cho Admin |
| `ForbiddenView` | `src/components/common/ForbiddenView.jsx` | Trang báo lỗi 403 khi thiếu quyền |
