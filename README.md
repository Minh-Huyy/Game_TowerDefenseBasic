# 🏰 Advanced Tower Defense (HTML5 Canvas)

Chào mừng bạn đến với **Advanced Tower Defense** - dự án game Thủ thành (Tower Defense) được xây dựng hoàn toàn từ con số 0 bằng HTML5 Canvas, Vanilla JavaScript và CSS. Game mang phong cách đồ họa 2D Pixel/Vector đậm chất Fantasy, kèm theo hàng loạt các cơ chế logic nâng cao (RPG Style) mang lại trải nghiệm đỉnh cao ngay trên trình duyệt mà không cần sử dụng bất kỳ Engine hay Framework bên ngoài nào!

---

## 🌟 Tính Năng Nổi Bật (Features)

*   **Hệ Thống Trụ (Tower Classes):**
    *   🏹 **Basic:** Bắn tỉa đơn mục tiêu nhanh chóng.
    *   💣 **AOE:** Nã pháo diện rộng tàn phá đám đông.
    *   ❄️ **Slow:** Phép thuật băng giá làm chậm chân kẻ thù.
    *   🧪 **Poison:** Độc tố xuyên giáp gây sát thương theo thời gian (DoT).
*   **Chiến thuật Nâng cấp (Exclusive Upgrades):** Mỗi tháp chỉ được chọn **1 con đường duy nhất** để max cấp độ (Range, Damage, hoặc Attack Speed) lên tối đa Level 4. Khóa chặt 2 con đường còn lại để ép người chơi tư duy chiến thuật!
*   **Di dời Tháp (Relocation):** Cơ chế "Xách tháp lên và chạy" bá đạo! Chi phí dời tháp tăng theo thuật toán: Lần 1 và 2 đều tốn `30 Khối vàng`, từ lần thứ 3 sẽ **đội giá tự động x1.5 lần** so với trước đó.
*   **Kẻ Thù Đa Dạng (Smart Enemies):**
    *   *Fast:* Di chuyển cực nhanh.
    *   *Armored:* Giáp dày chịu giảm sát thương vật lý cực tốt (Trúng độc mới xuyên giáp được).
    *   *Boss:* Xuất hiện mỗi 10 Wave, tự động buff hồi HP cho đàn em xung quanh (Healing Aura).
*   **Tương Tác Phép Thuật (Player Spells):** Trang bị 2 bộ kỹ năng cứu cánh cho bạn lúc nguy cấp: Cắm Bẫy chông làm chậm (Spike Trap) và Tha Bom Hạt Nhân (Bomb AOE) với thời gian làm nguội (Cooldown) khác nhau.
*   **Giao Diện Cửa Hàng (Drag & Drop Shop):** Bảng UI 3D giả gỗ (Wood-UI Panel) với tính năng cầm, kéo thả thẻ bài trực tiếp xuống bãi cỏ. Trình duyệt tự nhận diện chống đặt trùng, đặt sai.
*   **Thưởng Tiền Ép Sân (Auto-Wave Bonus):** Timer tự động đếm lùi 20s khi hết wave. Nếu bạn tự tin bóp ngòi bấm "Skip" xuất quân sớm, bạn sẽ được thưởng nóng `+ Tiền` thả bay lơ lửng trên màn hình!

---

## 🛠️ Hướng Dẫn Cài Đặt và Sử Dụng

Khoá học cài đặt siêu tốc: Bạn **không cần** bất kỳ môi trường Node.js hay Server Apache nào!

1. **Tải mã nguồn:**
   Clone repository này về máy tính bằng Git:
   ```bash
   git clone https://github.com/Minh-Huyy/Game_TowerDefenseBasic.git
   ```
   Hoặc bấm nút **Download ZIP** và giải nén.

2. **Khởi chạy Game ngay lập tức:**
   * Tìm đến thư mục bạn vừa giải nén.
   * Kích đúp (Double-click) thẳng vào file `index.html`.
   * Trình duyệt máy tính của bạn (Google Chrome, Microsoft Edge, Firefox, Brave...) sẽ tự động mở lên.

3. **Cách chơi:**
   * **Kéo - Thả (Drag & Drop):** Đưa icon tay cầm ấn giữ vào Thẻ Bài ở cột Menu bên phải màn hình. Kéo thả nó ra những khu vực đồng cỏ (Đường màu Xanh) trên Canvas. (Lưu ý phải Đủ Tiền và Điểm bạn đặt không dính mép Đường Đất màu nâu).
   * **Nâng Cấp / Bán Tháp:** Click thẳng chuột trái vào Tháp đã đặt, bảng nâng cấp bên tay phải sẽ hiện ra chi tiết.
   * **Dùng kỹ năng (Spells):** Click vào nút Spells góc bên trái dưới, sau đó click vị trí trên bản đồ bạn muốn xả bom hoặc đặt đinh. Mẹo: Dùng khi Boss hồi máu xuất hiện rất công hiệu! 

---

Hy vọng bạn sẽ có những phút giây giải trí thư thái với con Web Game mộc mạc mà siêu cuốn này nhé! 💸 *Chúc cày ải trăm Wave không thủng nhà!*