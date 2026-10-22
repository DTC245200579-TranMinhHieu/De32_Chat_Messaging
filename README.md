# Hệ Thống Chat Nội Bộ (Đề 32)
Môn: Triển khai và Quản trị Hệ thống Phần mềm

## Hướng dẫn khởi chạy
1. Yêu cầu: Đã cài đặt Docker và Docker Compose.
2. Khởi chạy toàn bộ hệ thống bằng 1 câu lệnh:
   ```bash
   docker compose up -d --build

Ứng dụng Chat: http://localhost

pgAdmin (DB GUI): http://localhost/pgadmin

Prometheus: http://localhost:9090

Grafana: http://localhost:3000