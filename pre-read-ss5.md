# Buổi 5: Helper, Validation, Xử lý lỗi và 3-Layer Architecture

## Mục tiêu

Sau khi đọc Pre-read này, bạn cần hiểu:
- Vì sao cần Helper?
- Vì sao Server phải Validation dữ liệu?
- Error được xử lý như thế nào?
- Vì sao cần chuẩn hóa Error Response?
- Middleware Validation hoạt động ra sao?
- Controller, Service và Repository có nhiệm vụ gì?
- Một Request đi qua hệ thống như thế nào?

## Nội dung bài học

1. Helper
2. Validation
3. Chuẩn hóa Error Response
4. Custom Error
5. Error Handler Middleware
6. Validation Middleware với Zod
7. Request Flow
8. 3-Layer Architecture
9. Tổng kết

---

## 1. Helper

### Mục này để làm gì?

Trong project, nhiều chức năng nhỏ có thể được sử dụng ở nhiều nơi. Nếu viết lại cùng một logic ở nhiều file (ví dụ: mã hóa mật khẩu, format ngày tháng), code sẽ bị lặp lại và khó bảo trì. 

**Tại sao không viết hàm trực tiếp trong Controller?** 
Vì nếu một Controller hay Service khác cũng cần dùng chức năng đó, bạn lại phải copy-paste đoạn code, vi phạm nguyên tắc DRY (Don't Repeat Yourself).

Helper giúp chúng ta gom những logic tiện ích dùng chung vào một nơi duy nhất để có thể dễ dàng tái sử dụng.

### Trong phần này sẽ học gì?

- Khái niệm Helper là gì?
- Ví dụ sử dụng Helper
- Những điều cần nhớ về Helper

### 1. Khái niệm

Helper (hoặc Utils) là các hàm tiện ích dùng chung, chứa những đoạn code logic nhỏ, lặp đi lặp lại. Giống như một "người giúp việc", khi cần làm một việc lặt vặt độc lập thì bạn gọi ra để dùng.

### 2. Ví dụ

**Ví dụ chưa dùng Helper:**
*File 1:*
```javascript
const date = new Date().toISOString();
```
*File 2:*
```javascript
const date = new Date().toISOString();
```

**Ví dụ đã dùng Helper:**
*Helper:*
```javascript
const formatDate = () => new Date().toISOString();
```
*File 1:* 
```javascript
const date = formatDate();
```

### 3. Cần nhớ

- **Helper** là hàm tiện ích dùng chung giúp tái sử dụng code.
- Dùng để tránh lặp lại code, giúp source code gọn gàng hơn.
- Không nên chứa Business Logic phức tạp bên trong Helper, nó chỉ nên làm một việc cụ thể và trả về kết quả.

---

## 2. Validation

### Mục này để làm gì?

Client gửi dữ liệu lên Server nhưng Server không thể tin tưởng 100% dữ liệu đó là hợp lệ (có thể thiếu email, mật khẩu quá ngắn, hoặc cố tình chứa mã độc). 

**Tại sao không tin dữ liệu từ Client?** 
Vì môi trường phía Client có thể dễ dàng bị thao túng bởi người dùng hoặc hacker, Client gửi gì Server cũng nhận, dẫn đến nguy cơ hệ thống bị hỏng hoặc rò rỉ dữ liệu.

Validation giúp Server kiểm tra dữ liệu nghiêm ngặt trước khi đưa vào Business Logic, bảo vệ Database khỏi dữ liệu rác và ngăn chặn hack (ví dụ: SQL Injection).

### Trong phần này sẽ học gì?

- Khái niệm Validation là gì?
- Tại sao cần Validation?
- Validation nằm ở đâu trong Request Flow?

### 1. Khái niệm

Validation là bước kiểm tra tính hợp lệ của dữ liệu đầu vào. Nó đảm bảo mọi thông tin Client gửi lên đều đúng định dạng, đúng yêu cầu trước khi hệ thống bắt đầu xử lý nghiệp vụ.

### 2. Cách hoạt động (Request Flow)

Validation luôn đứng ở vị trí "người gác cổng", chặn ngay từ đầu:

```text
Client
   │
   │ (1) Gửi dữ liệu (vd: email, password)
   ▼
Validation ── (2) Sai? ──► Trả lỗi về cho Client
   │
   │ (3) Đúng?
   ▼
Controller
   │
   ▼
Service (Xử lý logic)
```

### 3. Cần nhớ

- Không bao giờ tin tưởng dữ liệu từ Client.
- Validation là "bảo vệ cửa" để chặn dữ liệu rác, lỗi hoặc mã độc.
- Luôn kiểm tra trước khi tiến hành xử lý logic hoặc lưu vào Database.

---

## 3. Chuẩn hóa Error Response

### Mục này để làm gì?

Trong một hệ thống, các API có thể sinh ra nhiều loại lỗi khác nhau. Nếu API 1 báo lỗi kiểu này, API 2 báo lỗi kiểu khác, thì Frontend sẽ phải viết rất nhiều code `if-else` lằng nhằng để xử lý. 

**Tại sao mọi API nên trả lỗi cùng format?** 
Vì sự đồng nhất giúp Frontend (và cả những Developer khác dùng API của bạn) dễ dàng bắt lỗi, parse dữ liệu và hiển thị thông báo một cách nhất quán cho User.

Chuẩn hóa Error Response giúp thống nhất 1 form JSON duy nhất cho mọi loại lỗi từ Server trả về.

### Trong phần này sẽ học gì?

- Lý do cần chuẩn hóa lỗi
- Ví dụ form lỗi chuẩn

### 1. Khái niệm

Chuẩn hóa Error Response là quy định một cấu trúc JSON chung cho mọi phản hồi thất bại (khi HTTP Status Code >= 400). Bất kể lỗi xảy ra ở đâu, hình dáng dữ liệu trả về đều phải giống nhau.

### 2. Ví dụ

**Giả sử không có chuẩn chung:**
*API 1:* `{ "message": "Lỗi" }`
*API 2:* `{ "error": true, "detail": "Lỗi" }`

**Khi áp dụng quy tắc chuẩn hóa, ta có một form duy nhất:**
```json
{
  "success": false,
  "status": 400,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "email", "message": "Email sai định dạng" }
  ]
}
```

### 3. Cần nhớ

- Giao tiếp giữa Frontend và Backend cần chung một tiếng nói.
- Form lỗi chuẩn thường chứa: 
  - `success`: Báo trạng thái thất bại (`false`).
  - `status`: Mã HTTP chỉ định loại lỗi.
  - `message`: Lời nhắn chung.
  - `errors`: Chi tiết lỗi cụ thể (đặc biệt hữu ích khi Validation).

---

## 4. Custom Error

### Mục này để làm gì?

NodeJS cung cấp sẵn `Error` class để quăng lỗi (vd: `throw new Error("Lỗi")`). Tuy nhiên, bản thân class này quá đơn giản, không mang theo thông tin về HTTP Status Code (Lỗi 400, 401, hay 404?). 

**Tại sao `throw new Error()` chưa đủ?** 
Vì khi lỗi văng ra, phần code bắt lỗi không biết nên trả về cho Client mã lỗi HTTP nào. Trả về 500 (Lỗi server) cho mọi thứ là một best practice tồi.

Custom Error giúp chúng ta gắn thêm thuộc tính như `statusCode` hoặc mảng `errors` vào object lỗi để phân loại rõ ràng.

### Trong phần này sẽ học gì?

- Cách mở rộng class Error mặc định
- Xây dựng các Custom Error thường dùng

### 1. Khái niệm

Custom Error là các class tự định nghĩa kế thừa từ class `Error` của NodeJS, cho phép đính kèm thêm các metadata như Status Code, danh sách lỗi chi tiết để phục vụ cho Error Handler sau này.

### 2. Code minh họa

*File: `src/helpers/error.helper.js`*

```javascript
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = "Bad Request", errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

module.exports = {
    ErrorResponse,
    BadRequestError,
    NotFoundError
};
```

Bây giờ thay vì dùng Error thường, ta dùng:
```javascript
throw new BadRequestError("Email bị trùng");
```

### 3. Cần nhớ

- Custom Error giúp phân loại lỗi dễ dàng hơn nhờ có Status Code đi kèm.
- Giúp bước xử lý lỗi cuối cùng ở Middleware tự động và nhàn hơn rất nhiều.

---

## 5. Error Handler Middleware

### Mục này để làm gì?

Trong Express, nếu có lỗi xảy ra (do developer `throw` hoặc do code crash) mà không được xử lý, app sẽ treo, hoặc Express sẽ trả về trang HTML chứa Stack Trace rườm rà. 

**Tại sao không `res.status().json()` ở từng chỗ xảy ra lỗi?** 
Vì điều đó khiến code rẽ nhánh `try-catch` lặp đi lặp lại ở mọi ngóc ngách, Controller sẽ rất cồng kềnh và khó duy trì một Error Response chuẩn.

Error Handler Middleware đóng vai trò là "lưới lọc cuối cùng", đứng ở cuối hệ thống để hứng mọi lỗi bay tới, biến nó thành 1 form JSON chuẩn và trả cho Client.

### Trong phần này sẽ học gì?

- Middleware xử lý lỗi là gì?
- Cách xây dựng Error Handler Middleware

### 1. Khái niệm

Đó là một middleware đặc biệt trong Express có 4 tham số `(err, req, res, next)`. Khi bạn gọi `next(err)` ở bất kỳ đâu, Express sẽ bỏ qua tất cả các logic tiếp theo và nhảy thẳng vào Error Handler này.

### 2. Code minh họa

*File: `src/middlewares/error.middleware.js`*

```javascript
const errorHandler = (err, req, res, next) => {
    // 1. Lấy status code (mặc định 500 nếu không có)
    const statusCode = err.statusCode || 500;
    
    // 2. Tạo form JSON chuẩn
    const response = {
        success: false,
        status: statusCode,
        message: err.message || "Lỗi hệ thống",
    };

    // 3. Nếu có chi tiết lỗi, thêm vào
    if (err.errors) {
        response.errors = err.errors;
    }

    // 4. Gửi về Frontend
    res.status(statusCode).json(response);
};

module.exports = errorHandler;
```

### 3. Cần nhớ

- Luôn khai báo Error Handler Middleware ở **cuối cùng** trong file chạy chính (ngay trước `app.listen()`).
- Nó đóng vai trò "chốt chặn", chịu trách nhiệm chuẩn hóa lỗi.

---

## 6. Validation Middleware với Zod

### Mục này để làm gì?

Để kiểm tra dữ liệu, bạn có thể tự viết các lệnh `if(!req.body.email) ...`. Tuy nhiên code sẽ rất dài, rối và dễ sót logic. 

**Tại sao cần thư viện/schema để validate?** 
Vì thư viện chuyên dụng như Zod cung cấp cơ chế khai báo (Schema) rất ngắn gọn, rõ ràng. Zod có thể bắt nhiều lỗi cùng lúc và tự sinh ra các câu thông báo chuẩn hóa một cách tự động.

### Trong phần này sẽ học gì?

- Schema là gì?
- Cách viết Validation Middleware với Zod.

### 1. Khái niệm

- **Schema:** Là bộ quy tắc định nghĩa cấu trúc của dữ liệu (VD: username tối thiểu 3 ký tự, email phải đúng định dạng).
- **Middleware Validation:** Nhận Schema, kiểm tra dữ liệu trong Request. Nếu sai, gọi `next(BadRequestError)` để Error Handler lo.

### 2. Code minh họa

Cài đặt Zod: `npm install zod`

*File: `src/validations/user.validation.js` (Tạo Schema)*
```javascript
const { z } = require('zod');

const createUserSchema = z.object({
    username: z.string().min(3, "Tên phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải từ 6 ký tự")
});

module.exports = { createUserSchema };
```

*File: `src/middlewares/validate.middleware.js` (Middleware)*
```javascript
const { BadRequestError } = require('../helpers/error.helper');

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            // Lấy lỗi từ Zod và format lại
            const errors = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            
            // Đẩy lỗi cho Error Handler
            return next(new BadRequestError("Dữ liệu đầu vào không hợp lệ", errors));
        }
        
        req.body = result.data;
        next();
    };
};

module.exports = validate;
```

### 3. Cần nhớ

- Validation Middleware là bộ lọc tự động dùng lại được nhiều lần.
- Kết hợp hoàn hảo với Error Handler: Middleware chỉ văng lỗi, Error Handler sẽ dọn dẹp.

---

## 7. Request Flow (Hoàn thiện App)

### Mục này để làm gì?

Để hình dung tổng thể mọi thứ nãy giờ được ghép nối như thế nào, ta cần xếp tất cả các thành phần vào một file server chính và xem luồng đi (Flow) của Request.

### Trong phần này sẽ học gì?

- Lắp ráp Middleware, Route, Error Handler vào `index.js`.
- Mô phỏng quá trình chạy.

### 1. Code minh họa

*File: `src/index.js`*
```javascript
const express = require('express');
const app = express();

const errorHandler = require('./middlewares/error.middleware');
const validate = require('./middlewares/validate.middleware');
const { NotFoundError } = require('./helpers/error.helper');
const { createUserSchema } = require('./validations/user.validation');

app.use(express.json());

// 1. Route hợp lệ (Đã gắn Validation Middleware)
app.post('/api/users', validate(createUserSchema), (req, res) => {
    res.status(201).json({
        success: true,
        data: req.body,
        message: "Tạo user thành công"
    });
});

// 2. Chặn lỗi 404 (Route không tồn tại)
app.use((req, res, next) => {
    next(new NotFoundError("Đường dẫn không tồn tại"));
});

// 3. Chốt chặn cuối cùng xử lý lỗi
app.use(errorHandler);

app.listen(3000, () => console.log("Server running on port 3000"));
```

### 2. Cách hoạt động (Ví dụ lỗi)

Khi Client gửi Request thiếu mật khẩu:

```text
Client
   │ POST /api/users
   ▼
Validate Middleware (Kiểm tra bằng Zod Schema)
   │
   │ ──(Phát hiện lỗi!)──► Gọi next(BadRequestError)
   ▼
Error Handler Middleware (Bắt được lỗi 400)
   │
   │ ──(Biến thành JSON)──► res.status(400).json()
   ▼
Client nhận JSON chuẩn.
```

### 3. Cần nhớ

- Thứ tự khai báo trong file `index.js` cực kỳ quan trọng:
  1. Parsing Body (`express.json()`).
  2. Các Routes (kèm Validation).
  3. Xử lý bắt Route không tồn tại (404).
  4. Middleware xử lý lỗi tổng (Error Handler).

---

## 8. 3-Layer Architecture (Kiến trúc 3 Lớp)

### Mục này để làm gì?

Khi dự án lớn lên, hàng trăm APIs xuất hiện. Nếu viết toàn bộ validation, kết nối database, xử lý logic trong cùng 1 Route thì code sẽ thành một "mớ bòng bong" (Spaghetti code).

**Tại sao không viết logic luôn trong Route/Controller?** Để dễ bảo trì, test, và không file nào dài hàng nghìn dòng.
**Tại sao phải tách Business Logic (Service)?** Để logic có thể tái sử dụng dễ dàng ở nhiều API khác nhau mà không dính dáng đến Request/Response của HTTP.
**Tại sao tách Database Access (Repository)?** Để logic không bị phụ thuộc vào câu query cụ thể, dễ dàng đổi Database nếu cần.

3-Layer Architecture chia source code ra làm các tầng riêng biệt, mỗi tầng giải quyết đúng một nhiệm vụ duy nhất (Separation of Concerns).

### Trong phần này sẽ học gì?

- Các thành phần trong kiến trúc 3 lớp.
- Cách luồng dữ liệu đi qua các lớp.

### 1. Khái niệm

Cấu trúc phổ biến gồm:
- **Router:** Biển chỉ đường (Khai báo URL nối với Controller nào).
- **Controller:** Lễ tân (Nhận HTTP Request, gọi Service, trả HTTP Response).
- **Service:** Đầu bếp (Chứa toàn bộ Business Logic).
- **Repository:** Thủ kho (Trực tiếp query, thao tác với Database).

### 2. Cách hoạt động (Ví dụ Tạo User)

```text
Client
   │ (1) Gửi email, mật khẩu
   ▼
Router (Biển chỉ đường)
   │ (2) "POST /users thì vào đây nhé"
   ▼
Controller (Lễ tân)
   │ (3) Bóc req.body, gọi Service xử lý
   ▼
Service (Đầu bếp)
   │ (4) Kiểm tra email, Hash password
   │ (5) Yêu cầu Repository lưu
   ▼
Repository (Thủ kho)
   │ (6) Chạy câu SQL INSERT
   ▼
Database
```

### 3. Cần nhớ ( quan trọnggggggg, tuân thủ quy tắc giúp viết code đơn giản và dễ ...)

- **Router:** Chỉ chỉ đường.
- **Controller:** Chỉ lo giao tiếp (nhận `req`, trả `res`), không xử lý logic tính toán.
- **Service:** Là não bộ thực sự, làm mọi thứ liên quan đến nghiệp vụ, **không** đụng chạm tới `req` hay `res`.
- **Repository:** Chỉ quan tâm đến Database, câu lệnh SQL hoặc ORM.
- Lợi ích lớn nhất: Chia để trị. Lỗi ở đâu thì khoanh vùng sửa đúng lớp đó.

---

## 9. Tổng kết

Chúc mừng! Trong chương này bạn đã học cách thiết lập nền móng cho một Backend vững chắc:
- Biết dùng **Helper** để tái sử dụng code.
- Biết tạo lưới lọc **Validation** an toàn ở cửa ngõ.
- Biết gom toàn bộ rủi ro về một điểm thông qua **Custom Error** và **Error Handler**.
- Nắm được **Request Flow** chạy như thế nào từ đầu đến cuối server.
- Tư duy chia để trị với **3-Layer Architecture**, tạo tiền đề để code dự án chuyên nghiệp.
