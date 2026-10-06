# CabinSentinel Mobile

App di động (Expo / React Native) của CabinSentinel, tách từ repo nhóm P-068 (bản đã commit).
Chỉ giám sát, không điều khiển xe; dữ liệu mô phỏng phải được gắn nhãn "Mô phỏng".

Backend và model không nằm trong repo này: chạy trên Hugging Face Space, app gọi qua API.

```bash
npm install
npm run start        # Expo dev server
npm run typecheck
```

Build thử bản cài: xem các script `eas:*` trong `apps/mobile/package.json` (cần tài khoản Expo, bạn tự đăng nhập).

## Bản web (Cabin Noir)

Giao diện kiểu Apple (vật liệu kính mờ, danh sách nhóm, sheet) dùng chung API với app SwiftUI:
đăng nhập OTP, trạng thái xe, xử lý sự cố (xem, xác nhận kiểm tra), đưa đón, lịch sử.

- Mặc định chạy dữ liệu **Mô phỏng** (có nhãn). Vào Tài khoản, chọn "Máy chủ thật", nhập địa chỉ máy chủ rồi đăng nhập.
- Dữ liệu thiếu hoặc cũ không bao giờ hiển thị là an toàn; sự cố chỉ đóng khi máy chủ xác nhận không còn thấy người.
- Máy chủ phải bật CORS cho địa chỉ web (biến `CORS_ORIGINS` của backend).

```bash
npm run build:web --workspace @cabinsentinel/mobile
```
