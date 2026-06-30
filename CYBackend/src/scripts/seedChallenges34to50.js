const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize } = require('../config/db');
const { Challenge } = require('../models');
const { connectDB } = require('../config/db');
const { getPointsForDifficulty } = require('../utils/challingesPoints');

const challenges = [
  {
    title: "Race Condition in Bank Transfer",
    difficulty: "Medium",
    description: "A balance transfer operation reads the account balance, checks it's sufficient, then deducts in separate operations. Concurrent requests can both pass the balance check before either deduction occurs.",
    programmingLanguage: "Java",
    challengeDetails: "This is a Time-of-Check to Time-of-Use (TOCTOU) race condition. Between reading the balance and writing the updated balance, another concurrent request can read the same original balance and also pass the sufficiency check. With two concurrent transfers of $500 from a $600 account, both read $600, both pass the check, and both deduct — leaving the balance at -$400 or causing double-spend. This is a classic distributed systems problem and the same logic flaw underlies many DeFi exploits. The `@Transactional` annotation alone doesn't prevent this — it only ensures the read and write are in the same transaction, but two transactions can still interleave reads. The correct fix is pessimistic locking (`SELECT ... FOR UPDATE` or `@Lock(PESSIMISTIC_WRITE)`) which blocks concurrent reads until the write commits, or an atomic `UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?` that fails if the balance is insufficient.",
    initialCode: "// VULNERABLE: TOCTOU race condition\n@Transactional\npublic void transfer(Long fromId, Long toId, BigDecimal amount) {\n    Account from = accountRepo.findById(fromId).get();\n    if (from.getBalance().compareTo(amount) < 0)\n        throw new InsufficientFundsException();\n    from.setBalance(from.getBalance().subtract(amount));\n    accountRepo.save(from);\n}",
    recommendation: "Use pessimistic locking: `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the `findById` query. Alternatively use an atomic `UPDATE` with `WHERE balance >= amount` and check if rows affected == 1."
  },
  {
    title: "Unvalidated OAuth Redirect URI",
    difficulty: "Medium",
    description: "An OAuth 2.0 authorization server performs only a prefix check on the `redirect_uri` parameter.",
    programmingLanguage: "Node.js",
    challengeDetails: "The `redirect_uri` in an OAuth flow is where the authorization code is sent after the user authenticates. If the validation is only a prefix check, an attacker registers a redirect URI of `https://app.com.evil.com` or `https://app.com/callback?extra=` and their URI passes the prefix check against `https://app.com`. The authorization code — which can be exchanged for an access token — is then sent to the attacker's server. This attack is sometimes called authorization code interception and is the main reason the OAuth 2.0 spec mandates exact redirect URI matching. The fix is strict string equality: `redirectUri === client.registeredUri`. The registered URI should be stored at client registration time and never modified dynamically. For mobile apps and SPAs that can't keep secrets, combine strict redirect URI validation with PKCE to prevent code interception even if the redirect is somehow compromised.",
    initialCode: "// VULNERABLE: Prefix-only redirect_uri validation\nfunction validateRedirectUri(clientId, redirectUri) {\n    const client = clients.find(c => c.id === clientId);\n    if (redirectUri.startsWith(client.registeredUri)) {\n        return true;\n    }\n    return false;\n}",
    recommendation: "Perform exact string matching: `return redirectUri === client.registeredUri;`. Register exact URIs at client registration time and never allow partial matches."
  },
  {
    title: "XXE via SVG File Upload",
    difficulty: "Medium",
    description: "An SVG file upload is parsed as XML without disabling external entity processing, enabling file disclosure and SSRF through image uploads.",
    programmingLanguage: "PHP",
    challengeDetails: "SVG is an XML-based image format, and XML parsers process SVG files the same way they process any other XML — including honoring DOCTYPE declarations and external entity references. An attacker who uploads an SVG containing `<!ENTITY xxe SYSTEM \"file:///etc/passwd\">` and then references `&xxe;` in the SVG body can exfiltrate file contents that appear in the rendered output or error messages. This is particularly sneaky because developers think of SVG as an image format rather than a document format. The script-tag removal in this code (`removeScriptTags()`) doesn't help because XXE happens at parse time, before any traversal of the document. The fix is to disable external entity loading before calling `loadXML()`: `libxml_disable_entity_loader(true)` (PHP < 8.0) or use `LIBXML_NOENT` flag handling. Also consider rejecting SVGs entirely and re-encoding user images to a raster format like PNG before serving.",
    initialCode: "<?php\n// VULNERABLE: SVG parsed as XML without XXE protection\nfunction processSvgUpload($svgContent) {\n    $dom = new DOMDocument();\n    $dom->loadXML($svgContent);  // XXE possible here — default loads external entities!\n    removeScriptTags($dom);\n    return $dom->saveXML();\n}\n?>",
    recommendation: "Disable external entities: `libxml_disable_entity_loader(true);` before parsing, or use `$dom->loadXML($svgContent, LIBXML_NONET)`. Consider converting SVGs to raster format with a library like Imagick to eliminate the XML attack surface entirely."
  },
  {
    title: "Insecure JWT Secret (Weak Key)",
    difficulty: "Medium",
    description: "A JWT is signed with a short, predictable secret (`secret123`). An attacker can perform an offline brute-force attack using tools like hashcat.",
    programmingLanguage: "Node.js",
    challengeDetails: "JWTs signed with HS256 use a shared secret as the signing key. The security of the entire authentication system depends on this secret being unguessable. `secret123` can be cracked in milliseconds by any attacker who obtains a JWT token — they run hashcat or jwt-cracker against the token offline, with no rate limiting or lockout possible since it's a local computation. Once the secret is known, the attacker can forge tokens for any user ID or role and sign them validly. The NIST minimum for HMAC-SHA256 keys is 256 bits (32 bytes). Your task is to generate the secret with `crypto.randomBytes(64).toString('hex')` and store it securely in environment variables — never in source code. For higher assurance, switch to RS256 or ES256 (asymmetric algorithms), which allow public key distribution for verification without exposing the signing key.",
    initialCode: "// VULNERABLE: Weak JWT secret\nconst jwt = require('jsonwebtoken');\nconst JWT_SECRET = 'secret123';  // weak, short, guessable\n\nfunction generateToken(user) {\n    return jwt.sign(\n        { id: user.id, role: user.role },\n        JWT_SECRET,\n        { expiresIn: '24h' }\n    );\n}",
    recommendation: "Use a cryptographically random secret of at least 256 bits: `const JWT_SECRET = process.env.JWT_SECRET; // generated with crypto.randomBytes(64).toString('hex')`."
  },
  {
    title: "SQL Injection via ORDER BY Clause",
    difficulty: "Medium",
    description: "A search endpoint allows the user to specify a sort column via a query parameter. The column name is injected directly into the `ORDER BY` clause.",
    programmingLanguage: "Python",
    challengeDetails: "Parameterized queries solve SQL injection for values in WHERE clauses, but they cannot parameterize SQL keywords like column names, table names, or sort directions — these are structural parts of the query that the database driver cannot treat as literal strings. Injecting into `ORDER BY` allows an attacker to use `CASE WHEN` expressions to extract data bit by bit (Boolean-based blind injection), call functions like `SLEEP()` to perform time-based attacks, or in some databases reference columns from other tables via subqueries. The correct mitigation is an explicit allowlist: define the exact set of column names and directions that are valid, and reject everything else. `sort_by = sort_by if sort_by in {'name', 'price', 'created_at'} else 'name'`. This pattern is fundamentally different from sanitization — you're selecting from known-safe values rather than trying to make dangerous values safe.",
    initialCode: "# VULNERABLE: ORDER BY injection\n@app.route('/products')\ndef get_products():\n    sort_by = request.args.get('sort', 'name')\n    order = request.args.get('order', 'ASC')\n    query = f\"SELECT * FROM products ORDER BY {sort_by} {order}\"\n    return jsonify(db.execute(query).fetchall())",
    recommendation: "Validate against an explicit allowlist: `ALLOWED_COLUMNS = {'name', 'price', 'created_at'}; sort_by = sort_by if sort_by in ALLOWED_COLUMNS else 'name'; order = 'ASC' if order.upper() == 'ASC' else 'DESC'`."
  },
  {
    title: "Unrestricted File Inclusion",
    difficulty: "Medium",
    description: "A PHP application includes template files based on a user-supplied `page` parameter.",
    programmingLanguage: "PHP",
    challengeDetails: "PHP's `include()` function executes the included file as PHP code. When the filename comes from user input, an attacker can include any PHP-parseable file on the system (`/etc/passwd` doesn't execute but may be readable as a parse error). More dangerously, if the server allows remote file includes (`allow_url_include = On`), an attacker can include `http://evil.com/shell.txt` and execute arbitrary PHP code. Even with local inclusion only, an attacker can combine this with a file upload vulnerability to include their uploaded PHP shell, or use log file poisoning to include `/var/log/apache2/access.log` which contains attacker-controlled User-Agent strings. The fix is a strict allowlist: define the exact set of valid page names, map them to file paths server-side, and reject everything else. Never build file paths from raw user input.",
    initialCode: "<?php\n// VULNERABLE: Dynamic file inclusion from user input\n$page = $_GET['page'];\ninclude($page . '.php');\n?>",
    recommendation: "Use a strict allowlist: `$allowed = ['home', 'about', 'contact']; $page = in_array($_GET['page'], $allowed) ? $_GET['page'] : 'home'; include(__DIR__ . '/templates/' . $page . '.php');`."
  },
  {
    title: "Business Logic — Negative Quantity in Cart",
    difficulty: "Medium",
    description: "A cart update endpoint accepts any integer quantity, allowing negative values that reduce the total price or generate credit.",
    programmingLanguage: "Python",
    challengeDetails: "Business logic vulnerabilities are not about technical injection or protocol exploits — they're about using the application's own features in unintended ways. Adding an item with quantity `-10` produces a subtotal of `-$500`, which when combined with other items in the cart results in a total below zero. Depending on how the checkout processes negative totals, the attacker may receive a refund, gain store credit, or complete the purchase for free. These bugs are often missed by automated scanners because the individual inputs are technically valid integers — only the business rule (quantities must be positive) is violated. Your fix must enforce constraints on every field that has business meaning: `if quantity <= 0: return 400`. Calculate totals server-side rather than trusting client-provided totals. Enforce minimum and maximum quantities. Verify the final cart total is positive before initiating payment. Never trust the client for pricing logic.",
    initialCode: "# VULNERABLE: No quantity sign validation\n@app.route('/cart/add', methods=['POST'])\ndef add_to_cart():\n    item_id = request.json['item_id']\n    quantity = int(request.json['quantity'])\n    price = db.get_price(item_id)\n    cart_total = quantity * price  # quantity can be -100!\n    db.update_cart(session['user_id'], item_id, quantity)\n    return jsonify({'new_total': calculate_total()})",
    recommendation: "Enforce business constraints: `if quantity <= 0: return jsonify({'error': 'Invalid quantity'}), 400`. Validate min/max quantities, recalculate totals server-side, verify the final total is positive before processing payment."
  },
  {
    title: "Second-Order SQL Injection",
    difficulty: "Hard",
    description: "A username is safely stored using parameterized queries during registration, but later used in a profile-update query without parameterization.",
    programmingLanguage: "Python",
    challengeDetails: "Second-order injection is subtle and often evades code review because the vulnerable query and the injection source are in different functions, written at different times, sometimes by different developers. The pattern: safe parameterized write → data stored → data read back → unsafely interpolated into another query. A username like `admin'--` is stored safely. Later, when `update_email` retrieves it and interpolates it into an f-string, the single quote closes the string literal and `--` comments out the rest of the query. The attacker registers with a malicious username, then triggers the vulnerable code path by performing an innocent action like updating their email. The defense is absolute: parameterize every query that uses data from the database, not just queries that directly use user input. Treat all data as untrusted at the point of query construction, regardless of how safely it was stored.",
    initialCode: "# VULNERABLE: Second-order injection\ndef register(username, password):\n    # Safe: parameterized on write\n    db.execute(\"INSERT INTO users (username,password) VALUES (?,?)\",\n               (username, bcrypt.hash(password)))\n\ndef update_email(current_username, new_email):\n    user = db.execute(\"SELECT username FROM users WHERE id=?\",\n                      (session['user_id'],)).fetchone()\n    username = user['username']  # contains attacker payload!\n    # ...but injects it unsafely:\n    db.execute(f\"UPDATE users SET email='{new_email}'\"\n               f\" WHERE username='{username}'\")  # injection!",
    recommendation: "Parameterize every query that uses database-read values: `db.execute('UPDATE users SET email=? WHERE username=?', (new_email, username))`. Never use f-strings or string concatenation for SQL queries, even with data that came from your own database."
  },
  {
    title: "SSTI — Server-Side Template Injection",
    difficulty: "Hard",
    description: "An email notification feature renders a user-supplied template string using Jinja2's `render_template_string`.",
    programmingLanguage: "Python",
    challengeDetails: "Template injection occurs when user-supplied content is rendered as a template rather than as data. Jinja2 templates have access to Python's object model, and through method resolution order (MRO) traversal, an attacker can reach the built-in `__import__` function and execute arbitrary system commands. A payload like `{{ ''.__class__.__mro__[1].__subclasses__()[396]('id', shell=True, stdout=-1).communicate() }}` executes `id` on the server. The number in `__subclasses__()` varies by environment, making this a research task, but automated tools like tplmap enumerate it rapidly. This is effectively remote code execution via a template. The fix is to never pass user-supplied strings to `render_template_string()`. For user-customizable notifications, use a logic-less templating language like Mustache (via `chevron`) that has no concept of code execution, only variable substitution.",
    initialCode: "# VULNERABLE: User-controlled template string rendered by Jinja2\nfrom flask import render_template_string\n\n@app.route('/preview', methods=['POST'])\ndef preview_email():\n    template = request.json.get('template')\n    rendered = render_template_string(template)  # RCE!\n    return jsonify({'preview': rendered})",
    recommendation: "Never render user-supplied strings as templates. Use `jinja2.sandbox.SandboxedEnvironment` with strict restrictions. Better: use a logic-less template language (Mustache) for user templates."
  },
  {
    title: "OAuth PKCE Bypass — State Parameter Missing",
    difficulty: "Hard",
    description: "An OAuth flow initiates without a `state` parameter and the callback performs no validation, enabling CSRF attacks that link victim accounts to attacker-controlled identities.",
    programmingLanguage: "TypeScript",
    challengeDetails: "The OAuth `state` parameter serves as a CSRF token for the authorization flow. Without it, an attacker can initiate their own OAuth flow, stop before completing it, and trick a victim into completing it. The attacker crafts a URL to their own OAuth callback with the victim's browser — when the victim clicks it, their browser completes the OAuth exchange and links the attacker's OAuth identity to the victim's account. The attacker then logs in with their OAuth identity and has full access to the victim's account. This attack is called OAuth CSRF or login CSRF. The fix: generate a cryptographically random `state` value (using `crypto.randomBytes(32)`), store it in the session, include it as the `state` parameter in the authorization URL, and in the callback validate that `req.query.state === req.session.oauthState` before exchanging the code. Combine with PKCE for mobile and SPA flows.",
    initialCode: "// VULNERABLE: OAuth flow without state parameter\nasync function initiateOAuth(req: Request, res: Response) {\n    const authUrl = new URL('https://provider.com/oauth/authorize');\n    authUrl.searchParams.set('client_id', CLIENT_ID);\n    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);\n    authUrl.searchParams.set('response_type', 'code');\n    authUrl.searchParams.set('scope', 'email profile');\n    // Missing: state parameter — CSRF possible on callback!\n    res.redirect(authUrl.toString());\n}\n\nasync function handleCallback(req: Request, res: Response) {\n    const { code } = req.query;\n    // No state validation!\n    const token = await exchangeCode(code as string);\n}",
    recommendation: "Generate a cryptographically random state value, store it in the session, include it in the authorization request, and validate it on callback: `if (req.query.state !== req.session.oauthState) return res.status(403).send('Invalid state');`."
  },
  {
    title: "Timing Attack on HMAC Comparison",
    difficulty: "Hard",
    description: "A webhook handler verifies HMAC signatures using Python's `==` operator, which short-circuits on the first mismatching byte, creating a timing oracle.",
    programmingLanguage: "Python",
    challengeDetails: "String comparison with `==` in most languages returns `False` as soon as the first mismatching character is found. This means comparing a correct signature takes longer than comparing an incorrect one — the more correct prefix bytes the attacker guesses, the longer the comparison takes. By making thousands of requests with different signature bytes and measuring response times with statistical precision, an attacker can recover the correct signature one byte at a time, without knowing the secret. This timing oracle attack is practical in low-latency environments (same datacenter, localhost). The defense is constant-time comparison: `hmac.compare_digest(computed, provided)` always compares all bytes regardless of where the first mismatch occurs. This function is in Python's standard library and should be used for all security-sensitive string comparisons — API keys, tokens, signatures, and nonces.",
    initialCode: "# VULNERABLE: Non-constant-time HMAC comparison\nimport hmac, hashlib\n\ndef verify_webhook(payload: bytes, signature: str) -> bool:\n    secret = os.environ['WEBHOOK_SECRET'].encode()\n    computed = hmac.new(secret, payload, hashlib.sha256).hexdigest()\n    return computed == signature  # == returns early on first mismatch!",
    recommendation: "Use `hmac.compare_digest()` which is implemented in constant time: `return hmac.compare_digest(computed, signature)`. This is a drop-in replacement that eliminates the timing channel."
  },
  {
    title: "GraphQL Introspection & Batch Query DoS",
    difficulty: "Hard",
    description: "A GraphQL API exposes introspection in production and accepts batch queries without depth or complexity limits.",
    programmingLanguage: "Node.js",
    challengeDetails: "GraphQL introspection allows any client to query the complete schema: every type, field, argument, and resolver. In production, this is a documentation service for attackers — they can enumerate every mutation (account deletion, password reset, admin actions), map data relationships, identify deprecated fields that might have weaker security, and craft targeted attacks against underdocumented endpoints. Beyond information disclosure, GraphQL's flexible query structure enables denial-of-service through deeply nested or batched queries. A query that fetches users → their posts → each post's comments → each comment's author → their posts (repeated 10 levels deep) can trigger millions of database queries from a single HTTP request. Batch arrays multiply this — 100 queries in one request bypasses rate limiting. The mitigations are layered: disable introspection in production, enforce depth limits with `graphql-depth-limit`, calculate query complexity with `graphql-validation-complexity`, and limit batch array size.",
    initialCode: "// VULNERABLE: GraphQL with introspection and no limits\nconst { ApolloServer } = require('@apollo/server');\nconst server = new ApolloServer({\n    typeDefs,\n    resolvers,\n    // introspection defaults to true in all environments!\n    // No query depth limit, no complexity limit, no batching limit\n});",
    recommendation: "Set `introspection: false` in production. Use `graphql-depth-limit` (`depthLimit(5)`) and `graphql-validation-complexity` to reject expensive queries. Limit batch size and implement query cost analysis."
  },
  {
    title: "Insecure Cryptography — ECB Mode",
    difficulty: "Hard",
    description: "Credit card numbers are encrypted using AES in ECB mode. ECB encrypts each 16-byte block independently, so identical plaintext blocks produce identical ciphertext blocks — patterns remain visible.",
    programmingLanguage: "Java",
    challengeDetails: "AES-ECB (Electronic Codebook) mode is textbook cryptography's most famous failure. Each 16-byte block is encrypted independently with the same key, producing deterministic output: identical plaintext blocks always produce identical ciphertext blocks. For structured data like credit card numbers — many of which share common prefixes or patterns — this leaks statistical information. The canonical demonstration is the 'ECB penguin': encrypting a bitmap image with ECB preserves the outline of the original image in the ciphertext. For financial data, patterns in card numbers become patterns in ciphertext, enabling frequency analysis. Furthermore, ECB provides no authentication — an attacker can rearrange, duplicate, or substitute ciphertext blocks without detection. The correct choice is AES-GCM (Galois/Counter Mode), which uses a random nonce per encryption, produces statistically random ciphertext, and provides authenticated encryption — any tampering of the ciphertext causes decryption to fail.",
    initialCode: "// VULNERABLE: AES-ECB mode\nimport javax.crypto.Cipher;\nimport javax.crypto.spec.SecretKeySpec;\n\npublic byte[] encryptCard(String cardNumber, byte[] key) throws Exception {\n    SecretKeySpec keySpec = new SecretKeySpec(key, \"AES\");\n    Cipher cipher = Cipher.getInstance(\"AES/ECB/PKCS5Padding\");  // ECB!\n    cipher.init(Cipher.ENCRYPT_MODE, keySpec);\n    return cipher.doFinal(cardNumber.getBytes(StandardCharsets.UTF_8));\n}",
    recommendation: "Use AES-GCM which provides authenticated encryption: `Cipher cipher = Cipher.getInstance(\"AES/GCM/NoPadding\"); byte[] iv = new byte[12]; new SecureRandom().nextBytes(iv); cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(128, iv));`. Prepend the IV to the ciphertext for storage."
  },
  {
    title: "Subdomain Takeover via Dangling DNS",
    difficulty: "Hard",
    description: "A CNAME record for `staging.app.com` points to a cloud provider app that has been deleted. The CNAME still resolves but points to an unclaimed name that an attacker can claim.",
    programmingLanguage: "JavaScript",
    challengeDetails: "Subdomain takeover occurs when a DNS record points to a third-party service (Heroku, GitHub Pages, Netlify, Azure, S3) that has been deprovisioned, but the DNS record is never removed. Many cloud platforms allow anyone to claim an unclaimed subdomain name — so an attacker who registers `old-app-name.herokuapp.com` now controls all traffic destined for `staging.app.com`. This is catastrophic: the attacker can serve arbitrary content on your domain, issue TLS certificates (via DNS challenge), steal cookies scoped to `*.app.com`, perform phishing with a trusted domain, and exfiltrate data from applications that fetch config from `staging.app.com`. The code in this challenge fetches an API key from the compromised subdomain — that key now goes to the attacker. Prevention requires infrastructure hygiene: remove DNS records before deprovisioning cloud resources, audit CNAME targets periodically with tools like `subjack`, and implement DNS lifecycle management in your IaC decommissioning runbooks.",
    initialCode: "// VULNERABLE: Infrastructure left a dangling DNS CNAME\n// staging.app.com CNAME old-app-name.herokuapp.com (resource deleted!)\n\nconst config = await fetch('https://staging.app.com/config.json');\n// Attacker now controls staging.app.com content!\nconst { apiKey, featureFlags } = await config.json();",
    recommendation: "Before deprovisioning any cloud resource, remove the DNS record first. Run periodic audits with tools like `subjack` or `can-i-take-over-xyz`. Implement DNS record lifecycle management in your infrastructure-as-code decommissioning checklist."
  },
  {
    title: "Deserialization RCE via Java ObjectInputStream",
    difficulty: "Hard",
    description: "A REST API endpoint accepts Base64-encoded Java serialized objects and passes them directly to `ObjectInputStream`. Gadget chains in common libraries allow arbitrary code execution.",
    programmingLanguage: "Java",
    challengeDetails: "Java's native serialization mechanism, `ObjectInputStream.readObject()`, reconstructs arbitrary Java objects from a byte stream — including invoking methods during deserialization through 'gadget chains'. A gadget chain is a sequence of legitimate class methods that, when triggered by the deserialization of a crafted payload, executes attacker-controlled code. The `ysoserial` tool generates ready-made gadget chain payloads for common libraries (Commons Collections, Spring, Hibernate) that are almost certainly in your dependency tree. An attacker base64-encodes a ysoserial payload and POSTs to this endpoint. The `readObject()` call executes `Runtime.exec()` with attacker-specified arguments — shell command injection with the server's full privileges. The fix is to never deserialize Java objects from untrusted sources. Replace with JSON (Jackson) or Protocol Buffers. If you must use Java serialization, use a filtering `ObjectInputStream` that whitelists only your specific expected classes and rejects everything else.",
    initialCode: "// VULNERABLE: Deserializing untrusted ObjectInputStream data\n@PostMapping(\"/api/session/restore\")\npublic ResponseEntity<?> restoreSession(\n        @RequestBody String base64Data) throws Exception {\n    byte[] bytes = Base64.getDecoder().decode(base64Data);\n    ObjectInputStream ois =\n        new ObjectInputStream(new ByteArrayInputStream(bytes));\n    SessionData session = (SessionData) ois.readObject();  // RCE!\n    sessionManager.restore(session);\n    return ResponseEntity.ok(\"Session restored\");\n}",
    recommendation: "Never deserialize data from untrusted sources using Java `ObjectInputStream`. Use JSON (Jackson) or Protocol Buffers instead. If Java serialization is unavoidable, use a filtering `ObjectInputStream` that whitelists expected classes."
  },
  {
    title: "DNS Rebinding Attack on Internal API",
    difficulty: "Hard",
    description: "An SSRF protection function resolves the hostname and checks against a blocklist, but the DNS resolution and the HTTP request are separate operations. An attacker-controlled DNS server returns a public IP for the check, then a private IP for the actual connection.",
    programmingLanguage: "Python",
    challengeDetails: "DNS rebinding is a sophisticated SSRF bypass that exploits the gap between IP validation and connection. This code resolves the hostname once for the IP check, then passes the original URL (with the hostname) to `requests.get()`, which performs its own DNS lookup at connection time. The attacker controls a domain with a very low TTL (1 second). For the validation lookup, their DNS server returns a public IP (passing the check). For the subsequent lookup during the actual HTTP request — after the TTL expires — it returns `192.168.1.1` or `169.254.169.254`. The connection bypasses the blocklist because the validation and the connection use different resolved IPs. The fix is to resolve the hostname once, validate the IP, then connect directly to that IP address (not the hostname), preventing re-resolution. Use the IP as the URL host and pass the original hostname as the `Host` header.",
    initialCode: "# VULNERABLE: DNS rebinding bypass\nimport socket, requests\n\ndef safe_fetch(url):\n    hostname = urlparse(url).hostname\n    ip = socket.gethostbyname(hostname)  # resolve once to check\n    private_ranges = ['10.', '172.16.', '192.168.', '127.']\n    if any(ip.startswith(r) for r in private_ranges):\n        raise ValueError(\"Private IP blocked\")\n    # DNS can rebind between this check and the actual request!\n    return requests.get(url, timeout=5)",
    recommendation: "Resolve the hostname once, verify the IP, then connect to the resolved IP directly: replace the hostname in the URL with the validated IP and set the `Host` header manually. This prevents re-resolution at connection time."
  },
  {
    title: "Cache Poisoning via Unkeyed Headers",
    difficulty: "Hard",
    description: "A CDN cache uses the URL as the cache key but does not include the `X-Forwarded-Host` header. A response reflecting this header is cached and served to all subsequent users.",
    programmingLanguage: "Node.js",
    challengeDetails: "Web cache poisoning attacks exploit the difference between what the cache considers unique (the cache key) and what actually affects the response content. Here, `X-Forwarded-Host` influences the CDN base URL embedded in the page's script tags, but the CDN doesn't include it in the cache key. An attacker sends a request with `X-Forwarded-Host: evil.com` — the response contains `<script src=\"https://evil.com/static/app.js\">` and is cached. Every subsequent visitor receives this poisoned response and loads JavaScript from the attacker's domain, giving the attacker arbitrary code execution in every visitor's browser. Cache poisoning turns a single request into a persistent, scalable attack affecting all users. The fix is to never reflect request headers into responses, use only static hardcoded values for CDN URLs, and configure the CDN to include all response-influencing headers in the cache key.",
    initialCode: "// VULNERABLE: Reflecting unkeyed header into response\napp.use((req, res, next) => {\n    const host = req.headers['x-forwarded-host'] || req.hostname;\n    // Attacker sets X-Forwarded-Host: evil.com\n    res.locals.cdnBase = `https://${host}/static`;\n    next();\n});\n\napp.get('/', (req, res) => {\n    // Cached response includes: <script src=\"https://evil.com/static/app.js\">\n    res.render('index', { cdnBase: res.locals.cdnBase });\n});",
    recommendation: "Never reflect attacker-influenced headers (`X-Forwarded-Host`, `X-Original-URL`) into responses. Configure the CDN to include all response-influencing headers in the cache key. Use a static, hardcoded CDN base URL from configuration rather than request headers."
  }
];

const mapChallenge = (c) => {
  const level = c.difficulty.toLowerCase();
  return {
    title: c.title,
    level,
    description: c.description,
    programmingLanguage: c.programmingLanguage,
    challengeDetails: c.challengeDetails,
    initialCode: c.initialCode,
    recommendation: c.recommendation,
    points: getPointsForDifficulty(level),
    hints: [],
    code: '',
    feedback: '',
    solution: '',
    validationType: 'regex',
  };
};

const seedChallenges34to50 = async () => {
  console.log('Connecting to database...');
  await connectDB();

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\nProcessing ${challenges.length} challenges (#34–#50)...\n`);

  for (const raw of challenges) {
    const data = mapChallenge(raw);

    try {
      const existing = await Challenge.findOne({ where: { title: data.title } });

      if (existing) {
        console.log(`  ⏭  SKIP — "${data.title}" already exists (ID=${existing.id})`);
        skipped++;
        continue;
      }

      const created = await Challenge.create(data);
      console.log(`  ✅  INSERT — "${data.title}" (ID=${created.id}, UUID=${created.uuid}, level=${created.level}, points=${created.points})`);
      inserted++;
    } catch (err) {
      console.error(`  ❌  FAIL — "${data.title}": ${err.message}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`  Total challenges processed  : ${challenges.length}`);
  console.log(`  Successfully inserted       : ${inserted}`);
  console.log(`  Skipped (already exist)     : ${skipped}`);
  console.log(`  Failed inserts              : ${failed}`);
  console.log('═══════════════════════════════════════════\n');

  await sequelize.close();
  process.exit(failed > 0 ? 1 : 0);
};

seedChallenges34to50();
