# PRE-READ — AUTHENTICATION, SESSION & JWT

## 1. Kiến thức cơ bản

### 1.1. Authentication là gì?
Authentication (Xác thực) là quá trình hệ thống kiểm tra xem người dùng có đúng là người mà họ khai báo hay không.

Ví dụ quá trình xác thực:
```text
User nhập:
- Email: abc@gmail.com
- Password: 123456
        ↓
Server kiểm tra
        ↓
Đúng → Xác thực thành công
Sai  → Từ chối
```
**Ví dụ thực tế:** Khi bạn đăng nhập Facebook, hệ thống cần trả lời được câu hỏi: *"Người đang thao tác có thực sự sở hữu tài khoản này không?"*. Đó chính là quá trình Authentication.

### 1.2. Authorization là gì?
Sau khi đã biết user là ai, hệ thống cần tiếp tục trả lời câu hỏi: *"User này được phép làm những gì?"*. Đây gọi là quá trình Authorization (Phân quyền).

Ví dụ sự khác biệt:
```text
Authentication (Xác thực):
→ Xác nhận người này là Nguyễn Văn A.

Authorization (Phân quyền):
→ Nguyễn Văn A có vai trò (role) là "user".
  - Được phép: Xem profile, tạo order.
  - Không được phép: Xóa tài khoản của user khác.
```
**Mẹo ghi nhớ:**
- **Authentication:** Bạn là ai?
- **Authorization:** Bạn được phép làm gì?

### 1.3. Vì sao cần Authentication?
Nếu API không có rào chắn Authentication, luồng hoạt động sẽ như sau:
```text
Client
   ↓
GET /users/10
   ↓
Server
   ↓
Trả thông tin user
```
Khi đó, **bất kỳ ai cũng có thể gọi API**. Điều này cực kỳ nguy hiểm, đặc biệt với các API chứa thông tin nhạy cảm hoặc thay đổi dữ liệu như:
*   `GET /profile`
*   `POST /orders`
*   `PUT /profile`
*   `DELETE /account`

Do đó, Server luôn cần xác định rõ: **Request này đến từ user nào?** Đây chính là bài toán nền tảng mà Session và JWT sẽ giải quyết.

---

## 2. Password và Hash Password

### 2.1. Tuyệt đối không lưu password trực tiếp (Plaintext)
Giả sử User đăng ký tài khoản:
```text
- email: abc@gmail.com
- password: 123456
```
Nguyên tắc tối kỵ là lưu nguyên văn mật khẩu vào Database:
```text
Database
----------------
abc@gmail.com | 123456
```
Lý do: Nếu Database vô tình bị lộ, kẻ tấn công (Attacker) sẽ có ngay tài khoản và mật khẩu thật của toàn bộ người dùng.

### 2.2. Hash Password (Băm mật khẩu)
Giải pháp chuẩn mực là băm (Hash) mật khẩu trước khi lưu:
```text
123456
   ↓
Hash (Băm)
   ↓
$2b$10$xxxxxxxxxxxx
```
Lúc này, Database sẽ chỉ lưu chuỗi đã băm:
```text
email: abc@gmail.com
password: $2b$10$xxxxxxxxxxxx
```
**Điểm mấu chốt:** 
- Hash **không phải là mã hóa (encryption)**. Bạn không thể giải mã (giải ngược) chuỗi Hash về lại mật khẩu ban đầu (`123456`).
- Khi user đăng nhập, Server sẽ đem mật khẩu nhập vào đi Hash một lần nữa, sau đó kiểm tra xem nó có khớp với chuỗi Hash đang lưu trong Database hay không.

---

## 3. Validation (Kiểm duyệt dữ liệu)

Validation là bước kiểm tra tính hợp lệ của dữ liệu đầu vào trước khi hệ thống bắt tay vào xử lý.

Ví dụ User gửi lên dữ liệu đăng nhập:
```json
{
  "email": "abc",
  "password": "123"
}
```
Server cần đặt ra các câu hỏi kiểm duyệt:
- Email có đúng định dạng không? (Chữ "abc" rõ ràng là sai)
- Password có đủ độ dài tối thiểu không?
- Có trường nào bị bỏ trống không?

Nếu dữ liệu không đạt chuẩn, Server từ từ chối ngay lập tức với mã lỗi: `400 Bad Request`.

**Lợi ích của Validation:**
- Ngăn chặn dữ liệu rác, dữ liệu sai định dạng.
- Giảm thiểu lỗi logic (bugs) cho ứng dụng.
- Bảo vệ API khỏi các cuộc tấn công.
- Đảm bảo tính toàn vẹn dữ liệu trước khi lưu vào Database.

---

## 4. Session

Sau khi user đăng nhập (login) thành công, chúng ta gặp một vấn đề lớn: HTTP là giao thức "không trạng thái" (stateless). Nghĩa là ở những request tiếp theo, làm sao Server nhớ được user này vừa mới đăng nhập? 
Một trong những giải pháp lâu đời và phổ biến nhất là dùng **Session**.

### 4.1. Session là gì?
Session là cơ chế mà Server dùng để tự lưu trữ và ghi nhớ trạng thái đăng nhập của user.

Ví dụ, Server sẽ có một danh sách lưu trữ (Session Store):
```text
Session ID       User
-------------------------
abc123           userId = 10
xyz456           userId = 20
```
Trong cơ chế này, Client không cần thiết phải giữ toàn bộ thông tin của mình. Client chỉ cần cầm duy nhất một "chiếc thẻ bài":
```text
sessionId = abc123
```

---

## 5. Session — Đăng ký (Register)

Giả sử user chưa có tài khoản và tiến hành đăng ký:
```http
POST /register
```
```json
{
  "email": "abc@gmail.com",
  "password": "123456"
}
```
Luồng xử lý của Server:
```text
Request
   ↓
Validation (Kiểm duyệt)
   ↓
Kiểm tra email trùng lặp
   ↓
Hash password
   ↓
Lưu vào Database
```
Sau bước này, Database sẽ có bản ghi:
```text
users
id | email          | password
--------------------------------------
10 | abc@gmail.com  | $2b$10$xxxxx
```
*Lưu ý: Đăng ký hoàn tất. Ở bước này Session thường chưa được tạo ra (nếu hệ thống tách biệt rõ luồng Đăng ký và Đăng nhập).*

---

## 6. Session — Đăng nhập (Login)

User tiến hành đăng nhập:
```http
POST /login
```
```json
{
  "email": "abc@gmail.com",
  "password": "123456"
}
```
Các bước Server xử lý:

**Bước 1: Validation**
- Email có hợp lệ không? Password có bị trống không?

**Bước 2: Tìm user trong Database**
```sql
SELECT * FROM users WHERE email = 'abc@gmail.com'
```
Tìm thấy kết quả: `userId = 10`.

**Bước 3: Kiểm tra password**
Server tiến hành kiểm tra:
```text
123456 (User nhập)
   ↓
So sánh với chuỗi password hash trong database
```
Nếu khớp → Xác nhận đăng nhập thành công.

**Bước 4: Tạo Session**
Server khởi tạo một Session ID ngẫu nhiên:
`sessionId = abc123`
Và lưu nó vào hệ thống của Server: `abc123 → userId = 10`.
Hãy hình dung bộ nhớ Server lúc này:
```text
SESSION STORE
sessionId     userId
--------------------
abc123        10
```

**Bước 5: Gửi Session ID về cho Client**
Server gửi mã `abc123` này về cho trình duyệt (Browser), thường là thông qua cơ chế Header Cookie:
```http
Set-Cookie: sessionId=abc123
```
Trình duyệt nhận được và tự động lưu lại:
```text
Cookie
----------------
sessionId=abc123
```

---

## 7. Session — Gọi API sau khi Login

Bây giờ user muốn xem trang cá nhân:
```http
GET /profile
```
Trình duyệt sẽ tự động đính kèm Cookie vào Request:
```text
sessionId=abc123
```
Luồng xử lý của Server diễn ra như sau:
```text
Browser
   │
   │ Cookie: sessionId=abc123
   ↓
Server
   │ (Nhận được abc123)
   ↓
Tìm Session (Trong Session Store)
   │
   ↓
Thấy abc123 tương ứng với userId=10
   │
   ↓
Query Database lấy thông tin User 10
   │
   ↓
Response dữ liệu về cho Client
```

---

## 8. Session — Logout

Khi user muốn đăng xuất:
```http
POST /logout
```
Server thực hiện hành động cực kỳ đơn giản: Xóa Session có mã `abc123` khỏi hệ thống lưu trữ (Session Store). Mối liên kết `abc123 → userId = 10` biến mất.

Những lần sau, nếu Client tiếp tục gửi request kèm `sessionId=abc123`, Server sẽ tìm kiếm:
```text
abc123
   ↓
Không tồn tại
   ↓
Trả về lỗi: 401 Unauthorized
```

**Sức mạnh lớn nhất của Session:**
Server nắm toàn quyền sinh sát. Muốn ép một user đăng xuất (ví dụ do phát hiện đổi mật khẩu hoặc bị hack), Server chỉ cần xóa Session tương ứng trong database/bộ nhớ là xong.

---

## 9. Phân biệt Cookie và Session

Rất nhiều người mới thường nhầm lẫn giữa hai khái niệm này. Thực chất chúng là hai thứ khác biệt nhưng làm việc cùng nhau:

- **Session:** Là cơ chế quản lý trạng thái đăng nhập được đặt **ở phía Server**.
- **Cookie:** Là cơ chế lưu trữ và tự động đính kèm dữ liệu được đặt **ở phía Browser (Trình duyệt)**.

Bạn có thể hình dung:
```text
SERVER (Nơi nắm danh sách)         BROWSER (Nơi giữ vé)
Session Store                      Cookie
----------------                   ----------------
abc123 → userId 10                 sessionId=abc123
```
Cookie chỉ có nhiệm vụ giữ giúp cái mã vạch `sessionId`. Toàn bộ hồ sơ chi tiết của Session đó đều nằm an toàn trên Server.

---

## 10. Ưu và nhược điểm của Session

**Ưu điểm:**
- Dễ dàng quản lý và kiểm soát.
- Có thể "kick" (revoke/logout) một user ngay lập tức.
- Server luôn biết chính xác hiện có bao nhiêu session đang hoạt động.

**Nhược điểm:**
- Tốn bộ nhớ Server vì phải lưu lại tất cả session.
- Khó mở rộng hệ thống (Scalability). Nếu hệ thống lớn có nhiều Server cùng chạy đằng sau một Load Balancer:
```text
Client
   ↓
Load Balancer
   ├── Server A
   ├── Server B
   └── Server C
```
Lúc này, nếu Server A lưu Session của bạn, nhưng request tiếp theo Load Balancer lại đẩy qua Server B, Server B sẽ không nhận ra bạn. Buộc các server phải dùng chung một Session Store (như Redis) hoặc đồng bộ dữ liệu phức tạp.

---

## 11. Sự xuất hiện của JWT

Dù Session giải quyết tốt bài toán Authentication, nhưng đối với các kiến trúc hiện đại, người ta tìm kiếm một cách tiếp cận tối ưu hơn cho hệ thống phân tán:
Thay vì bắt Server phải "nhớ và lưu" từng Session, Server sẽ đóng gói luôn giấy xác thực vào một cái chứng minh thư (Token) và giao nó cho Client tự giữ.

Đó chính là khái niệm về **JWT**.

---

## 12. JWT là gì?

JWT viết tắt của **JSON Web Token**. Luồng hoạt động của nó đảo ngược triết lý của Session:

**Khi đăng nhập:**
```text
User
 ↓
Login
 ↓
Server xác thực
 ↓
Server tạo JWT (Ký tên xác nhận)
 ↓
Client cầm và tự giữ JWT
```
**Khi gọi API:**
```text
Client
 ↓
Gửi kèm JWT
 ↓
Server
 ↓
Verify JWT (Kiểm tra chữ ký)
 ↓
Đúng chữ ký → Cho phép / Sai chữ ký → Từ chối
```

---

## 13. JWT có gì bên trong?

Một chuỗi JWT hoàn chỉnh được chia làm 3 phần, cách nhau bởi dấu chấm (`.`):
```text
HEADER.PAYLOAD.SIGNATURE
```
Ngoại hình thực tế của nó trông như thế này: `xxxxx.yyyyy.zzzzz`

- **Header:** Chứa thông tin về loại token và thuật toán dùng để ký.
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- **Payload:** Chứa thông tin (claims) thực sự cần thiết của user.
```json
{
  "userId": 10,
  "role": "user",
  "exp": 1789000000
}
```
- **Signature (Chữ ký):** Được Server mã hóa bằng một "Secret Key" cực kỳ bảo mật. Chữ ký này dùng để chứng minh Token là do chính Server cấp phát và nội dung bên trong chưa hề bị ai chỉnh sửa trên đường truyền.

---

## 14. JWT — Đăng nhập

User gửi thông tin đăng nhập:
```http
POST /login
```
```json
{
  "email": "abc@gmail.com",
  "password": "123456"
}
```
Server xử lý:
```text
Validation
   ↓
Tìm user trong Database
   ↓
Kiểm tra password
   ↓
Khớp thông tin
   ↓
Tạo JWT
```
Lúc này, Server nhét dữ liệu cần thiết vào JWT Payload:
```json
{
  "userId": 10,
  "role": "user"
}
```
Sau đó đóng chữ ký điện tử và trả nguyên chuỗi JWT đó về cho Client:
```text
Client ← Trả về JWT
```
*Client có thể tùy ý lưu JWT (thường là LocalStorage, SessionStorage, hoặc Cookie).*

---

## 15. JWT — Gọi API

Để lấy thông tin (ví dụ xem profile), Client gọi API và đính kèm JWT vào HTTP Header:
```http
GET /profile
Authorization: Bearer <JWT_CỦA_USER>
```
Quy trình kiểm duyệt của Server:
```text
Nhận JWT
   ↓
Verify Signature (Dùng Secret Key kiểm tra chữ ký)
   ↓
Kiểm tra thời gian (exp) xem đã hết hạn chưa
   ↓
Hợp lệ không?
```
Nếu giả mạo hoặc hết hạn: Trả về lỗi `401 Unauthorized`.
Nếu hợp lệ: Server trích xuất được thông tin từ JWT:
```text
JWT
 ↓
userId = 10
 ↓
Gán: req.user = { userId: 10, role: "user" }
 ↓
Chuyển tiếp cho Controller xử lý
```
Lúc này Controller chỉ việc gọi `req.user.userId` là biết được ai đang request mà **không cần đụng tới Database hay Session Store để tra cứu**.

---

## 16. So sánh Session vs JWT

Sự khác biệt cốt lõi nhất nằm ở nơi chứa thông tin trạng thái:

**SESSION (Lưu ở Server):**
```text
Client
 ↓ (Cầm Session ID)
Session ID
 ↓
Server
 ↓
Tra sổ tìm Session
 ↓
Biết được userId
```
→ Server **bắt buộc phải có bộ nhớ** để lưu cặp `sessionId → userId`.

**JWT (Lưu ở Client):**
```text
Client
 ↓ (Cầm luôn JWT)
JWT
 ↓
Server
 ↓
Verify JWT (Giải mã bằng thuật toán)
 ↓
Biết được userId
```
→ Mọi thông tin User đều nằm ngay trong bản thân cái Token. Server không lưu gì cả.

---

## 17. Ưu và nhược điểm của JWT

**Ưu điểm:**
- Không tốn bộ nhớ Server (stateless), không cần lưu session cho từng request.
- Tối ưu và phù hợp nhất cho các hệ thống RESTful API, Mobile App.
- Dễ dàng mở rộng cho hệ thống siêu lớn (Microservices). Server nào cũng kiểm tra được JWT miễn là có chung Secret Key.
- Token có sẵn một số thông tin (userId, role) giúp giảm bớt việc query Database vô ích.

**Nhược điểm:**
- Token bị lộ (leak) thì Attacker có thể sử dụng tự do.
- Rất khó để thu hồi (revoke/logout) một JWT ngay lập tức trước khi nó hết hạn.
- Payload chỉ được mã hóa Base64 (ai cũng dịch được) nên tuyệt đối **không chứa mật khẩu hay thông tin nhạy cảm**.
- Tăng độ phức tạp trong việc quản lý vòng đời (thời gian hết hạn) của token.

---

## 18. Access Token

Khi nhắc đến JWT trong gọi API, người ta ám chỉ **Access Token** (Token để truy cập).
Ví dụ:
```text
Access Token
     ↓
GET /profile
GET /orders
POST /orders
```
Vì nhược điểm của JWT là "khó thu hồi", nên để giảm rủi ro bảo mật nếu lộ Token, Access Token luôn được thiết kế để có thời gian sống (TTL - Time to Live) rất ngắn.

Ví dụ: `Access Token → Hết hạn sau 15 phút`.

---

## 19. Refresh Token

Nếu Access Token chỉ sống được 15 phút, chẳng lẽ cứ 15 phút user đang thao tác lại bị văng ra đòi nhập lại email/password? Điều này làm nát trải nghiệm người dùng. 
Giải pháp là sinh thêm **Refresh Token** (Token để làm mới).

Luồng hoạt động sẽ như sau:
```text
Login thành công
  ↓
Server cấp cả: Access Token + Refresh Token
```
Ví dụ thời gian sống:
- `Access Token` → 15 phút.
- `Refresh Token` → 7 ngày.

Khi Access Token hết hạn (sau 15 phút):
```text
Access Token bị lỗi 401
        ↓
Client âm thầm gửi Refresh Token lên Server
        ↓
Server kiểm tra Refresh Token trong Database
        ↓
Hợp lệ
        ↓
Server tạo và cấp lại một Access Token mới
```
Nhờ vậy, User cứ tiếp tục xài hệ thống mượt mà, không hề bị yêu cầu đăng nhập lại.

---

## 20. Khi nào dùng Refresh Token?

**Không nhất thiết phải dùng:**
Nếu dự án quá đơn giản, không quan trọng trải nghiệm người dùng liên tục, bạn chỉ cần một cái: `JWT Access Token` (Sống tầm vài tiếng) là đủ.

**Nên cân nhắc dùng khi:**
- Cần User duy trì trạng thái đăng nhập rất lâu (ví dụ Mobile App đăng nhập 1 lần xài cả tháng).
- Không muốn làm phiền User bằng việc bắt login lại liên tục.
- Yêu cầu bảo mật cao: Access Token buộc phải sống thật ngắn (ví dụ 5 phút).
- Hệ thống có flow authentication phức tạp, chuẩn doanh nghiệp.

**Luồng phổ biến nhất hiện nay trong các ứng dụng thực tế:**
```text
Login
 ↓
Nhận Access Token + Refresh Token
 ↓
... Xài bình thường ...
 ↓
Access Token hết hạn (Bị lỗi 401)
 ↓
Đưa Refresh Token ra xin lại
 ↓
Nhận Access Token mới và tiếp tục dùng
```
