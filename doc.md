
3. API là gì?
API là viết tắt của:

Application Programming Interface

Hiểu đơn giản:

API là cách để các phần mềm giao tiếp và trao đổi dữ liệu với nhau.

Ví dụ:

Frontend muốn lấy danh sách user.

Frontend
   │
   │ Request
   ▼
API
   │
   ▼
Backend
   │
   ▼
Database
Sau khi Backend xử lý xong:

Database
   │
   ▼
Backend
   │
   │ Response
   ▼
Frontend
API có thể được hiểu đơn giản là cửa giao tiếp giữa các phần mềm.

3.1. Vì sao cần API?
Một hệ thống có thể có nhiều ứng dụng cùng sử dụng dữ liệu:

Website
Mobile App
Admin Dashboard
        │
        ▼
       API
        │
        ▼
     Backend
        │
        ▼
     Database
Thay vì mỗi ứng dụng tự truy cập trực tiếp vào Database, chúng giao tiếp thông qua Backend/API.

4. HTTP là gì?
Để Client và Server giao tiếp với nhau, chúng cần một bộ quy tắc.

Bộ quy tắc đó gọi là protocol - giao thức.

HTTP (HyperText Transfer Protocol) là giao thức quy định cách Client và Server trao đổi dữ liệu với nhau.

Có thể hình dung:

Client                         Server

  │                              │
  │──── HTTP Request ───────────►│
  │                              │
  │                         xử lý request
  │                              │
  │◄─── HTTP Response ───────────│
  │                              │
Trong các API Web, HTTP là nền tảng mà chúng ta sử dụng để gửi Request và nhận Response.

5. HTTP và HTTPS
HTTP
HTTP truyền dữ liệu mà không có lớp mã hóa TLS bảo vệ đường truyền.

HTTP thường sử dụng port:

80
HTTPS
HTTPS là:

HTTP + TLS
HTTPS mã hóa dữ liệu trên đường truyền giữa Client và Server.

HTTPS thường sử dụng port:

443
Ví dụ:

http://example.com
https://example.com
Cần nhớ
HTTP
→ giao tiếp bằng HTTP
→ không có TLS

HTTPS
→ HTTP + TLS
→ dữ liệu được mã hóa trên đường truyền
Trong bài này không cần đi sâu vào TLS. Chỉ cần hiểu HTTPS an toàn hơn HTTP nhờ cơ chế mã hóa trên đường truyền.

6. Request và Response
Đây là khái niệm quan trọng nhất của bài học.

Khi Client muốn làm gì đó với Server:

Client
   │
   │ Request
   ▼
Server
Server xử lý xong sẽ trả lại:

Server
   │
   │ Response
   ▼
Client
Vì vậy:

Request = yêu cầu gửi đi

Response = kết quả Server trả về

7. HTTP Request gồm những gì?
Một Request thường gồm:

Request
├── Method
├── URL
├── Headers
└── Body
Ví dụ:

POST /users/123?active=true HTTP/1.1

Host: example.com
Authorization: Bearer abc123
Content-Type: application/json

{
  "name": "Nguyen",
  "age": 20
}
Đừng cố học thuộc ngay. Chúng ta sẽ tách từng phần.

8. HTTP Method
Method cho Server biết:

Client muốn thực hiện hành động gì?

Các method thường gặp:

Method	Ý nghĩa
GET	Lấy dữ liệu
POST	Tạo dữ liệu
PUT	Cập nhật/thay thế toàn bộ
PATCH	Cập nhật một phần
DELETE	Xóa dữ liệu
Ví dụ với resource users:

GET    /users
POST   /users
GET    /users/1
PUT    /users/1
PATCH  /users/1
DELETE /users/1
Có thể hiểu:

GET    → lấy
POST   → tạo
PUT    → sửa toàn bộ
PATCH  → sửa một phần
DELETE → xóa
8.1. PUT và PATCH khác nhau thế nào?
Giả sử user hiện tại:

{
  "name": "Nguyen",
  "age": 20,
  "email": "nguyen@gmail.com"
}
Nếu muốn cập nhật toàn bộ user:

PUT /users/1
Có thể gửi:

{
  "name": "Nguyen",
  "age": 21,
  "email": "nguyen@gmail.com"
}
Nếu chỉ muốn thay đổi tuổi:

PATCH /users/1
{
  "age": 21
}
Cách nhớ
PUT
→ thay đổi toàn bộ resource

PATCH
→ thay đổi một phần resource
9. URL và Endpoint
Ví dụ:

GET /users/123
Trong đó:

GET
↓
Method

/users/123
↓
Path
API có các địa chỉ để Client gọi tới, ví dụ:

/users
/users/123
/products
/products/10
/orders
Trong thực tế, ta thường gọi các địa chỉ API mà Client có thể gọi là endpoint.

Ví dụ:

GET /users
là một endpoint dùng để lấy danh sách user.

10. Params, Query, Body, Header
Đây là phần rất quan trọng.

Khi Client gửi Request, dữ liệu có thể được truyền ở nhiều vị trí khác nhau.

Bốn thứ cần phân biệt:

Params
Query
Body
Header
11. Params
Params dùng để xác định một resource cụ thể.

Ví dụ:

GET /users/123
Ở đây:

123
↓
id
↓
Params
Trong Express:

app.get("/users/:id", (req, res) => {
    console.log(req.params.id);
});
Kết quả:

123
Cách nhớ
Params = Tôi muốn thằng nào?

Ví dụ:

/users/123
/products/10
/orders/999
12. Query
Query dùng để truyền điều kiện cho việc lấy dữ liệu.

Thường dùng cho:

Search

Filter

Sort

Pagination

Ví dụ:

GET /users?page=2&limit=10
Trong Express:

req.query.page;
req.query.limit;
Ví dụ khác:

GET /products?category=laptop
Ở đây:

category=laptop
↓
Query
Cách nhớ
Query = Tôi muốn lấy theo điều kiện nào?

13. Body
Body dùng để gửi dữ liệu chính lên Server.

Ví dụ khi tạo user:

POST /users

Content-Type: application/json

{
  "name": "Nguyen",
  "age": 20,
  "email": "nguyen@gmail.com"
}
Trong Express:

req.body;
Cách nhớ
Body = Tôi muốn gửi dữ liệu gì?

14. Header
Header chứa thông tin bổ sung về Request hoặc Response.

Ví dụ:

Content-Type: application/json
Authorization: Bearer abc123
Trong Express:

req.headers;
Lấy Authorization:

req.headers.authorization; 
Cách nhớ
Header = Thông tin đi kèm

15. Phân biệt Params, Query, Body, Header
Xét Request:

POST /users/123?active=true

Authorization: Bearer abc123
Content-Type: application/json

{
  "name": "Nguyen",
  "age": 20
}
Phân tích:

POST
→ Method

/users/123
→ Path

123
→ Params

active=true
→ Query

Authorization
→ Header

Content-Type
→ Header

name, age
→ Body
Bảng ghi nhớ
Thành phần	Dùng để
Params	Xác định resource
Query	Filter, search, pagination...
Body	Dữ liệu chính gửi lên
Header	Thông tin bổ sung
16. HTTP Response
Sau khi Server xử lý Request, Server trả về Response.

Một Response thường gồm:

Response
├── Status Code
├── Headers
└── Body
Ví dụ:

HTTP/1.1 200 OK

Content-Type: application/json

{
  "name": "Nguyen",
  "age": 20
}
Ở đây:

200 OK
→ Status Code

Content-Type
→ Header

{
    ...
}
→ Body
17. HTTP Status Code
Status Code cho Client biết:

Request đã được xử lý như thế nào?

Có thể chia thành:

2xx → Thành công
4xx → Client gửi Request có vấn đề
5xx → Server có vấn đề
Những mã cần nhớ
200 OK
Request thành công.

GET /users
→ 200 OK
201 Created
Tạo dữ liệu thành công.

POST /users
→ 201 Created
400 Bad Request
Request không hợp lệ.

Ví dụ:

Thiếu dữ liệu bắt buộc
Dữ liệu sai format
401 Unauthorized
Chưa xác thực hoặc thông tin xác thực không hợp lệ.

Ví dụ:

Chưa đăng nhập
Token không hợp lệ
403 Forbidden
Đã xác thực nhưng không có quyền.

Ví dụ:

User thường
→ cố truy cập API dành cho Admin
404 Not Found
Không tìm thấy resource.

GET /users/999
nhưng user 999 không tồn tại.

409 Conflict
Dữ liệu bị xung đột.

Ví dụ:

Email đã tồn tại
500 Internal Server Error
Server gặp lỗi.

Ví dụ:

Code lỗi
Database lỗi
Lỗi hệ thống
Cách nhớ
2xx → OK
4xx → Client có vấn đề
5xx → Server có vấn đề
Không cần học thuộc tất cả Status Code.

18. Nhìn lại toàn bộ Request → Response
Bây giờ ghép tất cả kiến thức lại.

Client muốn tạo user:

Client
   │
   │ POST /users
   │
   │ Header:
   │ Content-Type: application/json
   │
   │ Body:
   │ {
   │   "name": "Nguyen",
   │   "age": 20
   │ }
   ▼
Server
   │
   │ xử lý
   │
   ▼
Database
   │
   │ lưu user
   ▼
Server
   │
   │ Response
   │
   │ 201 Created
   │
   │ Body:
   │ {
   │   "id": 1,
   │   "name": "Nguyen"
   │ }
   ▼
Client
Đây là flow quan trọng nhất cần hiểu trước khi bắt đầu code API.

19. RESTful API
REST là một phong cách thiết kế API.

Tư duy cơ bản:

Resource + HTTP Method
Ví dụ resource là:

users
Ta có:

Method	Endpoint	Ý nghĩa
GET	/users	Lấy danh sách
GET	/users/:id	Lấy một user
POST	/users	Tạo user
PUT	/users/:id	Cập nhật toàn bộ
PATCH	/users/:id	Cập nhật một phần
DELETE	/users/:id	Xóa user
20. RESTful và thiết kế không theo REST
Không tốt
GET  /getUsers
GET  /getUserById
POST /createUser
POST /updateUser
POST /deleteUser
Tên endpoint đang mô tả hành động.

RESTful
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
PATCH  /users/:id
DELETE /users/:id
Ở đây:

/users
là resource.

Còn:

GET
POST
PUT
PATCH
DELETE
xác định hành động.

Tư duy cần nhớ
Không cần nhét hành động vào tên endpoint. Hãy dùng HTTP Method để thể hiện hành động.

21. Response Convention
Giả sử API thứ nhất trả:

{
  "name": "Nguyen"
}
API thứ hai trả:

{
  "result": {}
}
API thứ ba trả:

{
  "message": "Success"
}
Nếu mỗi API trả một kiểu khác nhau, Frontend sẽ khó xử lý.

Vì vậy, một project thường thống nhất một response format.

Ví dụ:

Success
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyen"
  },
  "message": "Get user successfully"
}
Error
{
  "success": false,
  "data": null,
  "message": "User not found"
}
Điều quan trọng
success, data, message không phải format bắt buộc của HTTP hay REST.

Đây là:

Quy ước do project/team thống nhất.

Mục đích là để Frontend biết trước Response sẽ có cấu trúc như thế nào.

22. Router trong Express
Khi project còn nhỏ, có thể viết route trực tiếp:

app.get("/users", ...);
app.get("/users/:id", ...);
app.post("/users", ...);

app.get("/products", ...);
app.get("/products/:id", ...);
app.post("/products", ...);
Nhưng khi project lớn lên, một file có thể chứa rất nhiều route.

Vì vậy Express cung cấp:

express.Router()
Router giúp chia API thành từng nhóm.

22.1. User Router
Ví dụ file:

user.route.js
const router = express.Router();

router.get("/", ...);

router.get("/:id", ...);

router.post("/", ...);

export default router;
Trong index.js:

app.use("/users", userRouter);
Kết quả:

router.get("/")
        ↓
GET /users

router.get("/:id")
        ↓
GET /users/:id

router.post("/")
        ↓
POST /users
Cách hiểu
/users
   │
   ├── GET
   ├── POST
   └── /:id
Router giúp gom các API liên quan đến cùng một chức năng vào một nơi.

23. Tổng kết toàn bộ bài
Nếu đã hiểu bài, bạn phải nhìn được flow này:

                    HTTP
                     │
                     ▼
Client ──────── Request ────────► Server
              │
              ├── Method
              ├── URL
              ├── Headers
              └── Body

Server
   │
   │ xử lý
   ▼
Database
   │
   ▼
Server
   │
   │ Response
   ▼

Client
   │
   ├── Status Code
   ├── Headers
   └── Body
Và khi thiết kế API:

Resource
   +
HTTP Method
   ↓
RESTful API
   ↓
Endpoint
   ↓
Express Router
24. 10 điều cần nhớ trước khi vào buổi học
Client là phía gửi Request.

Server là phía nhận Request và xử lý.

API là cách các phần mềm giao tiếp với nhau.

HTTP là giao thức giúp Client và Server trao đổi dữ liệu.

Request là yêu cầu Client gửi đi.

Response là kết quả Server trả về.

Request thường có Method, URL, Headers, Body.

Params, Query, Body và Header có mục đích khác nhau.

RESTful API sử dụng Resource + HTTP Method để thiết kế API.

Router giúp tổ chức các endpoint thành từng nhóm trong Express.

25. Câu hỏi tự kiểm tra
Trước khi vào buổi học, hãy thử tự trả lời:

Câu 1
API là gì?

Câu 2
Client và Server khác nhau như thế nào?

Câu 3
HTTP dùng để làm gì?

Câu 4
Request và Response khác nhau như thế nào?

Câu 5
GET, POST, PUT, PATCH và DELETE dùng để làm gì?

Câu 6
Trong:

GET /users/123?page=2
123 là gì?

page=2 là gì?

Câu 7
Trong:

{
  "name": "Nguyen",
  "age": 20
}
dữ liệu này thường nằm ở đâu trong Request?

Câu 8
401 và 403 khác nhau như thế nào?

Câu 9
Tại sao:

GET /getUsers
thường không được ưu tiên bằng:

GET /users
trong thiết kế RESTful?

Câu 10
Tại sao cần Router trong Express?

26. Kết luận
Sau bài này, bạn chưa cần biết cách viết một API hoàn chỉnh.

Bạn chỉ cần hiểu được:

Client
   ↓
Request
   ↓
API / Server
   ↓
Xử lý
   ↓
Response
   ↓
Client
Sau khi nắm được flow này, các bài tiếp theo như:

Express

CRUD API

Routing

Validation

Authentication

Database

sẽ dễ hiểu hơn rất nhiều.