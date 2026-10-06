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
