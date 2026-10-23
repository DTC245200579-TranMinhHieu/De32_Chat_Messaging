# 🚀 HỆ THỐNG CHAT THỜI GIAN THỰC & GIÁM SÁT LOKI / PROMETHEUS (ĐỀ 32)

> **Môn học:** Triển khai và Quản trị Hệ thống Phần mềm  
> **Trường:** Đại học Công nghệ Thông tin & Truyền thông - ĐH Thái Nguyên (ICTU)  
> **Công nghệ:** Node.js, Socket.io, PostgreSQL, Nginx, Prometheus, Grafana, Loki, cAdvisor, Docker Compose.

---

## 🛠️ YÊU CẦU TIÊN QUYẾT
- Đã cài đặt **Docker** & **Docker Compose**.
- Đã cài đặt **Git**.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### 1. Clone repository
```bash
git clone https://github.com/[Tên_User]/De32_Chat_Messaging.git
cd De32_Chat_Messaging
```

### 2. Khởi chạy toàn bộ hệ thống
Khởi chạy 9 container ngầm bằng một lệnh duy nhất:
```bash
docker compose up -d --build
```

### 3. Kiểm tra trạng thái container
```bash
docker compose ps
```

---

## 🌐 DANH SÁCH DỊCH VỤ & CỔNG TRUY CẬP

| Dịch vụ | URL Truy cập | Tài khoản / Ghi chú |
| :--- | :--- | :--- |
| **Ứng dụng Chat** | `http://localhost:8080` | Kết nối qua Nginx Reverse Proxy |
| **Grafana Dashboard** | `http://localhost:3000` | `admin` / `admin` (Xem biểu đồ & LogQL) |
| **pgAdmin 4** | `http://localhost:5050` | `admin@admin.com` / `AdminPassword123!` |
| **Prometheus** | `http://localhost:9090` | Thu thập metrics từ cAdvisor |
| **cAdvisor** | `http://localhost:8080/cadvisor` | Metric exporter |

---

## 📊 TRUY VẤN LOGQL TRÊN GRAFANA LOKI

Vào **Grafana (Port 3000)** -> chọn menu **Explore** -> Chọn Data Source **Loki** và nhập các câu lệnh:

1. **Xem log ứng dụng Chat:**
   ```logql
   {container_name="chat-app"}
   ```
2. **Xem log Nginx Proxy:**
   ```logql
   {container_name="nginx"}
   ```
3. **Lọc log kết nối thành công:**
   ```logql
   {container_name="chat-app"} |= "connect"
   ```

---

## 🛑 DỪNG HỆ THỐNG

Dừng và xóa toàn bộ container:
```bash
docker compose down
```