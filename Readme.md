# FullStack Project Practice

## Important Concepts Used in This Project

### 1. **Error Handling with Custom Error Classes**

**What it is:** Creating custom error classes that extend the Error class to handle application-specific errors consistently.

```javascript
class ApiError extends Error {
    constructor(statusCode, message, errors, stack) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
    }
}
```

**Why we use it:**
- Standardized error responses across the API
- Easy to identify and handle application errors
- Provides both HTTP status codes and custom error messages

**When I got stuck:** Initially threw generic JavaScript errors without status codes, making it hard to send proper HTTP responses. Switching to custom ApiError class with statusCode solved the problem.

---

### 2. **Async Handler Wrapper (Higher-Order Function)**

**What it is:** A wrapper function that handles async/await errors automatically without repetitive try-catch blocks.

```javascript
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch(err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        });
    }
}
```

**Why we use it:**
- DRY principle - avoids repeating try-catch in every route handler
- Cleaner, more readable code
- Centralized error handling

**When I got stuck:** Without this, every async route handler needed try-catch blocks. This pattern made the code much cleaner.

---

### 3. **JWT (JSON Web Tokens) for Authentication**

**What it is:** A token-based authentication mechanism where users receive a token after login that proves their identity.

```javascript
const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET);
```

**Key Points:**
- Tokens are created with a secret key
- Verified using `jwt.verify()` in middleware
- Stored in cookies or Authorization headers
- Access token (short-lived) + Refresh token (long-lived) pattern

**When I got stuck:** Understanding the difference between access tokens and refresh tokens. Access tokens are short-lived (for active sessions), refresh tokens are long-lived (to get new access tokens without re-login).

---

### 4. **Middleware Pattern**

**What it is:** Functions that process requests before they reach route handlers.

```javascript
const isLogin = asyncHandler((req, res, next) => {
    const token = req.cookies?.accessToken || req.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "Unauthorized");
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.userId };
    next(); // Pass to next middleware/route
});
```

**Why we use it:**
- Centralized authentication logic
- Protects routes that require login
- Can be chained: `router.post("/route", isLogin, asyncHandler(handler))`

---

### 5. **Mongoose Models & Schema**

**What it is:** Define database structure with validation using Mongoose.

**Concepts:**
- **Schema:** Blueprint for data structure
- **Model:** Class to interact with database
- **Methods:** Custom instance methods on documents
- **Middleware/Hooks:** Run code before/after save, delete, etc.

**Example Use Case in Project:**
- User model with password hashing before save
- Custom methods: `AccessTokenGenerator()`, `RefreshTokenGenerator()`
- Methods run automatically using `pre()` hooks

**When I got stuck:** Understanding the difference between static methods (on model) and instance methods (on document). Also, the importance of `validateBeforeSave: false` when updating refresh tokens without validation.

---

### 6. **Password Security with bcryptjs**

**What it is:** Hash passwords using bcrypt to store securely.

```javascript
// In Mongoose pre-save hook
if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 10);
}
```

**Why:**
- Never store plain text passwords
- Salt (10 rounds) prevents rainbow table attacks
- `isModified()` ensures only changed passwords are hashed

**When I got stuck:** Not hashing passwords on update, leading to security issues. The `isModified()` check is crucial.

---

### 7. **File Upload with Multer & Cloudinary**

**What it is:** Middleware to handle file uploads and store them on cloud.

```javascript
// Multer stores files locally
const upload = multer({ storage: diskStorage });

// Cloudinary uploads to cloud
const uploadImage = async (localFilePath) => {
    const response = await cloudinary.uploader.upload(localFilePath);
    return response.secure_url;
}
```

**Pattern:**
1. User uploads file → Multer saves locally
2. Send to Cloudinary → Get cloud URL
3. Delete local file → Save URL to database

**When I got stuck:** File paths and local storage management. Cloudinary integration requires proper environment variables and error handling for non-existent files.

---

### 8. **Request Validation & Input Sanitization**

**What it is:** Check if required fields exist and validate format before processing.

```javascript
const { username, email, fullname, password } = req.body;
if(!username || !email || !fullname || !password) {
    throw new ApiError(400, "All fields required");
}

const existedUser = await User.findOne({ 
    $or: [{ username }, { email }] 
});
if(existedUser) {
    throw new ApiError(409, "User already exists");
}
```

**Why:**
- Prevent empty/invalid data in database
- Catch duplicate entries
- Consistent error responses

---

### 9. **CORS (Cross-Origin Resource Sharing)**

**What it is:** Allow frontend (different port) to communicate with backend.

```javascript
app.use(cors({
    origin: "http://localhost:3000"
}));
```

**Why:** Without this, browser blocks requests from frontend to backend.

---

### 10. **Throw Statement for Error Handling**

**What it is:** Intentionally stop execution and throw an error.

```javascript
throw new ApiError(400, "All fields required");
```

**Key Points:**
- Stops current function execution immediately
- Gets caught by nearest try-catch (or asyncHandler)
- Always wrap code that might throw in try...catch

---

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Password Security:** bcryptjs
- **File Upload:** Multer + Cloudinary
- **Middleware:** CORS, Cookie Parser
- **Environment:** Dotenv, Nodemon (dev)

---

## Common Patterns in This Project

1. **Request Flow:** Client → CORS → Middleware (isLogin) → asyncHandler → Controller → DB → Response
2. **Error Handling:** Throw ApiError → asyncHandler catches → JSON response with statusCode
3. **Authentication:** Register → Hash password → Login → Generate tokens → Store in cookies → Use in requests