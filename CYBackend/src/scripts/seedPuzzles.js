const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize } = require('../config/db');
const { Puzzle } = require('../models');
const { connectDB } = require('../config/db');
const puzzles = [
  { 
    title: "The Base of It All", 
    description: "You intercepted a strange string: 'Y3liZXJzZWN1cml0eQ=='. Decode it to find the flag.", 
    level: 1, 
    hints: ["Notice the '==' at the end?", "It's a common encoding scheme used to represent binary data in an ASCII string format."], 
    scenario: "During a routine packet capture, you noticed some plain text data that looks suspiciously encoded.", 
    tags: ["encoding", "crypto", "basics"], 
    answer: "cybersecurity", 
    category: "Cryptography" 
  },
  { 
    title: "Caesar's Secret", 
    description: "Decrypt this ancient message: 'KHOOR ZRUOG'.", 
    level: 1, 
    hints: ["An ancient Roman emperor used this method to communicate with his generals.", "Try shifting the letters back by 3 spaces."], 
    scenario: "A locked file left behind by a novice hacker has a hint encrypted using one of the oldest known ciphers.", 
    tags: ["crypto", "ciphers", "historical"], 
    answer: "hello world", 
    category: "Cryptography" 
  },
  { 
    title: "Always Check the Robots", 
    description: "You are doing reconnaissance on a target website. What standard text file should you check first to find hidden directories the admin doesn't want indexed?", 
    level: 1, 
    hints: ["It's placed in the root directory of a website.", "Search engines look for this file before crawling."], 
    scenario: "Web Application Penetration Testing Phase 1: Information Gathering.", 
    tags: ["web", "reconnaissance", "osint"], 
    answer: "robots.txt", 
    category: "Web Security" 
  },
  { 
    title: "The Universal Bypass", 
    description: "What is the most famous, simple SQL injection payload used to bypass an authentication login prompt?", 
    level: 2, 
    hints: ["You are trying to make the SQL WHERE clause evaluate to true.", "It uses single quotes and an OR statement."], 
    scenario: "You encountered an old login form that doesn't use parameterized queries.", 
    tags: ["sqli", "web", "injection"], 
    answer: "' OR '1'='1", 
    category: "Web Security" 
  },
  { 
    title: "Cross-Site Alert", 
    description: "Provide the simplest HTML/JavaScript payload to trigger an alert box displaying the number 1 in a vulnerable input field.", 
    level: 2, 
    hints: ["You need to inject a script tag.", "The JavaScript function to show a popup is alert()."], 
    scenario: "Testing a search bar for Reflected XSS vulnerabilities.", 
    tags: ["xss", "web", "javascript"], 
    answer: "<script>alert(1)</script>", 
    category: "Web Security" 
  },
  { 
    title: "Directory Traversal", 
    description: "In a Linux system, what string of characters is repeatedly used in a URL to move up directories and access the root filesystem?", 
    level: 2, 
    hints: ["Think about how you navigate up one folder in a terminal.", "It involves dots and slashes."], 
    scenario: "An image viewing endpoint fetches files by name: `view.php?file=image.png`. You want to exploit it.", 
    tags: ["lfi", "web", "linux"], 
    answer: "../", 
    category: "Web Security" 
  },
  { 
    title: "The Secure Shell", 
    description: "What is the default TCP port used for SSH (Secure Shell)?", 
    level: 1, 
    hints: ["It's a low-numbered port.", "It's exactly one number higher than FTP."], 
    scenario: "You are configuring a firewall and need to allow secure remote terminal access.", 
    tags: ["networking", "ports", "infrastructure"], 
    answer: "22", 
    category: "Network Security" 
  },
  { 
    title: "Name to Numbers", 
    description: "Which protocol is responsible for translating human-readable domain names into IP addresses?", 
    level: 1, 
    hints: ["It's often referred to as the 'phonebook of the internet'.", "Operates primarily on port 53."], 
    scenario: "A user complains they cannot reach google.com, but they can ping 8.8.8.8.", 
    tags: ["networking", "protocols", "dns"], 
    answer: "dns", 
    category: "Network Security" 
  },
  { 
    title: "The Teapot Protocol", 
    description: "Which HTTP status code was established as an April Fools' joke and states 'I'm a teapot'?", 
    level: 2, 
    hints: ["It's a 4xx client error.", "Research RFC 2324."], 
    scenario: "You are analyzing web server logs and find a strange response code indicating a Hyper Text Coffee Pot Control Protocol violation.", 
    tags: ["web", "http", "trivia"], 
    answer: "418", 
    category: "Web Security" 
  },
  { 
    title: "One-Way Street", 
    description: "What cryptographic process takes an input of any length and produces a fixed-size string of characters, which cannot be reversed?", 
    level: 1, 
    hints: ["MD5 and SHA-256 are examples of this.", "It's used to securely store passwords."], 
    scenario: "You are designing a secure database schema for user authentication.", 
    tags: ["crypto", "fundamentals", "passwords"], 
    answer: "hashing", 
    category: "Cryptography" 
  },
  { 
    title: "Hidden in Plain Sight", 
    description: "What is the practice of concealing a file, message, image, or video within another file, message, image, or video?", 
    level: 2, 
    hints: ["The word comes from Greek origins meaning 'covered writing'.", "Tools like 'steghide' are used for this."], 
    scenario: "A suspect claims an image file is just a family photo, but its file size is unusually large.", 
    tags: ["forensics", "steganography"], 
    answer: "steganography", 
    category: "Forensics" 
  },
  { 
    title: "The Secure Lock", 
    description: "HTTPS relies on TLS/SSL to encrypt data. What is the standard port for HTTPS?", 
    level: 1, 
    hints: ["HTTP uses port 80.", "It's in the 400 range."], 
    scenario: "Configuring a web server to ensure all traffic is encrypted.", 
    tags: ["networking", "web", "ports"], 
    answer: "443", 
    category: "Network Security" 
  },
  { 
    title: "Three-Way Handshake", 
    description: "In a TCP connection, the handshake process uses three flags. The first is SYN, the second is SYN-ACK. What is the third?", 
    level: 2, 
    hints: ["It stands for Acknowledgment.", "It completes the connection establishment phase."], 
    scenario: "Analyzing a Wireshark PCAP file to verify connection stability.", 
    tags: ["networking", "tcp", "protocols"], 
    answer: "ack", 
    category: "Network Security" 
  },
  { 
    title: "The Stealth Scanner", 
    description: "What Nmap flag is used to perform a TCP SYN stealth scan?", 
    level: 3, 
    hints: ["It requires root/sudo privileges.", "The flag consists of a lowercase 's' followed by an uppercase letter representing the packet type."], 
    scenario: "You are conducting an internal pentest and want to avoid completing the TCP handshake to reduce logging.", 
    tags: ["tools", "nmap", "reconnaissance"], 
    answer: "-ss", 
    category: "Network Security" 
  },
  { 
    title: "Rotated by 13", 
    description: "Decrypt this string: 'pna lbh ernq guvf'.", 
    level: 2, 
    hints: ["It's a specific type of Caesar cipher.", "Applying the exact same algorithm to the cipher text will yield the plain text."], 
    scenario: "You found a hidden comment in a web page's source code used to obscure an email address.", 
    tags: ["crypto", "encoding", "rot13"], 
    answer: "can you read this", 
    category: "Cryptography" 
  },
  { 
    title: "The Password File", 
    description: "In modern Linux systems, while user info is in /etc/passwd, where are the actual password hashes securely stored?", 
    level: 2, 
    hints: ["Only the root user can read this file.", "It's named after the dark area created by an object blocking light."], 
    scenario: "You gained local file read access on a Linux server and want to crack credentials.", 
    tags: ["linux", "privesc", "os"], 
    answer: "/etc/shadow", 
    category: "System Security" 
  },
  { 
    title: "Invisible Ink of the Web", 
    description: "Which HTTP header does a browser send to identify the operating system, browser type, and version to the web server?", 
    level: 1, 
    hints: ["It contains the words 'User' and 'Agent'.", "Can be spoofed easily via tools like Burp Suite."], 
    scenario: "A server is blocking your automated script, and you need to make it look like a standard Firefox browser.", 
    tags: ["web", "http", "headers"], 
    answer: "user-agent", 
    category: "Web Security" 
  },
  { 
    title: "Dorking for Files", 
    description: "What Google search operator restricts search results to a specific domain?", 
    level: 2, 
    hints: ["It's a four-letter word followed by a colon.", "Used extensively in Open Source Intelligence (OSINT)."], 
    scenario: "You are looking for exposed PDF documents specifically on a target's company website.", 
    tags: ["osint", "reconnaissance", "google"], 
    answer: "site:", 
    category: "OSINT" 
  },
  { 
    title: "The Middleman", 
    description: "What type of attack intercepts communication between two parties to secretly relay or alter the data?", 
    level: 1, 
    hints: ["It abbreviates to MitM.", "ARP spoofing is a common way to achieve this on local networks."], 
    scenario: "An attacker on a public Wi-Fi network is listening to your unencrypted HTTP traffic.", 
    tags: ["network", "attacks", "concepts"], 
    answer: "man in the middle", 
    category: "Network Security" 
  },
  { 
    title: "The First Line of Defense", 
    description: "What network security device monitors and filters incoming and outgoing network traffic based on an organization's previously established security policies?", 
    level: 1, 
    hints: ["It acts as a barrier between a trusted network and an untrusted network.", "Can be hardware or software."], 
    scenario: "Setting up a perimeter defense for a new corporate office network.", 
    tags: ["infrastructure", "defense", "networking"], 
    answer: "firewall", 
    category: "Network Security" 
  },
  { 
    title: "Malicious Requests", 
    description: "What vulnerability forces an end user to execute unwanted actions on a web application in which they're currently authenticated?", 
    level: 3, 
    hints: ["It's often mitigated by using unique, random tokens.", "Abbreviates to CSRF."], 
    scenario: "An attacker tricked an admin into clicking a link that unknowingly changed their password.", 
    tags: ["web", "csrf", "vulnerabilities"], 
    answer: "cross-site request forgery", 
    category: "Web Security" 
  },
  { 
    title: "The Hidden Trap", 
    description: "What is a system designed to attract attackers, simulating a vulnerable system to study their behavior?", 
    level: 1, 
    hints: ["Think of a bear being lured by something sweet.", "It's a decoy system."], 
    scenario: "The Blue Team deploys a fake database server with weak credentials to monitor who tries to access it.", 
    tags: ["defense", "blue-team", "infrastructure"], 
    answer: "honeypot", 
    category: "System Security" 
  },
  { 
    title: "Data Kidnapping", 
    description: "What type of malware encrypts a victim's files and demands payment for the decryption key?", 
    level: 1, 
    hints: ["WannaCry is a famous example.", "The name implies you have to pay a 'ransom'."], 
    scenario: "An employee opened a malicious email attachment, and now all company documents have a .locked extension.", 
    tags: ["malware", "threats", "concepts"], 
    answer: "ransomware", 
    category: "System Security" 
  },
  { 
    title: "The Unseen Vulnerability", 
    description: "What term describes a software vulnerability that is discovered by attackers before the vendor is aware of it and has a patch?", 
    level: 2, 
    hints: ["The vendor has had zero days to fix it.", "Highly prized on the black market."], 
    scenario: "A completely new exploit is circulating in the wild targeting the latest version of an OS.", 
    tags: ["vulnerabilities", "concepts", "exploits"], 
    answer: "zero-day", 
    category: "System Security" 
  },
  { 
    title: "Asymmetric Pairs", 
    description: "In asymmetric encryption, if you encrypt a message with a public key, what key must be used to decrypt it?", 
    level: 1, 
    hints: ["It is the counterpart to the public key.", "It must be kept secret by the owner."], 
    scenario: "You are setting up PGP to send secure emails to a colleague.", 
    tags: ["crypto", "keys", "fundamentals"], 
    answer: "private key", 
    category: "Cryptography" 
  },
  { 
    title: "Behind the Mask", 
    description: "What is the 32-bit subnet mask representation for a /24 network?", 
    level: 3, 
    hints: ["It consists of three blocks of 255 and one block of 0.", "It allows for 254 usable hosts."], 
    scenario: "Configuring a DHCP server for a standard small office network.", 
    tags: ["networking", "subnetting", "math"], 
    answer: "255.255.255.0", 
    category: "Network Security" 
  },
  { 
    title: "Picture Metadata", 
    description: "What standard specifies the formats for images and tags used by digital cameras, which can accidentally leak GPS coordinates?", 
    level: 2, 
    hints: ["Abbreviates to EXIF.", "Tools like exiftool are used to view and strip this data."], 
    scenario: "An OSINT investigator discovers the exact home location of a target based on a photo uploaded to a forum.", 
    tags: ["osint", "forensics", "metadata"], 
    answer: "exif", 
    category: "Forensics" 
  },
  { 
    title: "The Physical Address", 
    description: "What 48-bit address is assigned to a network interface controller (NIC) for communications at the data link layer?", 
    level: 1, 
    hints: ["It is often represented as six groups of two hexadecimal digits.", "Stands for Media Access Control."], 
    scenario: "You need to whitelist a specific laptop on a secure corporate Wi-Fi network.", 
    tags: ["networking", "hardware", "layer2"], 
    answer: "mac address", 
    category: "Network Security" 
  },
  { 
    title: "Too Much Input", 
    description: "What vulnerability occurs when a program writes more data to a block of memory than it was allocated to hold?", 
    level: 3, 
    hints: ["It can lead to overwriting adjacent memory locations.", "A common vulnerability in C/C++ applications."], 
    scenario: "Reverse engineering a compiled binary, you notice that a user input string can crash the application by overwriting the instruction pointer.", 
    tags: ["pwn", "binary", "vulnerabilities"], 
    answer: "buffer overflow", 
    category: "System Security" 
  },
  { 
    title: "JSON Tokens", 
    description: "In web development, what does JWT stand for?", 
    level: 2, 
    hints: ["It is an open standard (RFC 7519).", "Consists of a header, payload, and signature separated by dots."], 
    scenario: "Analyzing local storage on a modern web app, you find an authentication token used for stateless sessions.", 
    tags: ["web", "auth", "tokens"], 
    answer: "json web token", 
    category: "Web Security" 
  },
  { 
    title: "The Search Engine for Devices", 
    description: "What is the name of the search engine specifically designed to find internet-connected devices (like webcams, routers, and servers)?", 
    level: 2, 
    hints: ["Named after the villain AI in the game System Shock.", "Often called the 'search engine for hackers'."], 
    scenario: "You are looking for internet-facing industrial control systems with default credentials.", 
    tags: ["osint", "tools", "reconnaissance"], 
    answer: "shodan", 
    category: "OSINT" 
  },
  { 
    title: "Bypassing the Execution Policy", 
    description: "In Windows, what command-line shell is commonly abused by attackers to execute malicious scripts natively in memory?", 
    level: 2, 
    hints: ["It has a blue background by default.", "Attackers often use bypass flags like `-ExecutionPolicy Bypass`."], 
    scenario: "An alert triggered regarding a heavily obfuscated `.ps1` script executing on an endpoint.", 
    tags: ["windows", "scripting", "malware"], 
    answer: "powershell", 
    category: "System Security" 
  },
  { 
    title: "The Internet Time Machine", 
    description: "What online archive tool allows you to see how a website looked in the past, even if the current page is taken down?", 
    level: 1, 
    hints: ["It's hosted by the Internet Archive.", "Its name implies traveling backward in time."], 
    scenario: "A company was breached, and they deleted the exposed page. You need to find what was originally posted there last year.", 
    tags: ["osint", "web", "history"], 
    answer: "wayback machine", 
    category: "OSINT" 
  },
  { 
    title: "Phishing for Specifics", 
    description: "What type of phishing attack specifically targets high-profile individuals, such as CEOs or government officials?", 
    level: 2, 
    hints: ["It implies hunting for the biggest catch.", "It's a subset of spear-phishing."], 
    scenario: "The CFO of your company received a highly tailored email pretending to be from the IRS demanding wire transfers.", 
    tags: ["social-engineering", "phishing", "concepts"], 
    answer: "whaling", 
    category: "Social Engineering" 
  },
  { 
    title: "Deep within the System", 
    description: "What type of malicious software is designed to hide the existence of certain processes or programs from normal methods of detection, giving persistent privileged access?", 
    level: 3, 
    hints: ["It operates at the OS or kernel level.", "The name combines the highest Linux privilege level and the word 'kit'."], 
    scenario: "Despite multiple antivirus scans coming back clean, the server is still beaconing out to an unknown IP. The malware is hiding itself from the OS tools.", 
    tags: ["malware", "advanced", "persistence"], 
    answer: "rootkit", 
    category: "System Security" 
  },
  { 
    title: "Shared Resource Mapping", 
    description: "What port is typically used for SMB (Server Message Block) over TCP, often targeted in ransomware attacks like WannaCry?", 
    level: 3, 
    hints: ["It's in the 400 range.", "It replaced the older NetBIOS ports 137-139."], 
    scenario: "Configuring an internal firewall to isolate Windows file sharing from guest networks.", 
    tags: ["networking", "ports", "windows"], 
    answer: "445", 
    category: "Network Security" 
  },
  { 
    title: "The Secure Header", 
    description: "What HTTP header forces browsers to only communicate with a web server over HTTPS?", 
    level: 3, 
    hints: ["Abbreviated as HSTS.", "Prevents protocol downgrade attacks."], 
    scenario: "You are securing a web application and want to ensure users cannot accidentally access the site via unencrypted HTTP.", 
    tags: ["web", "http", "headers"], 
    answer: "strict-transport-security", 
    category: "Web Security" 
  },
  { 
    title: "Who Owns This?", 
    description: "What command-line utility or protocol is used to query databases that store the registered users or assignees of an Internet resource, such as a domain name?", 
    level: 1, 
    hints: ["The name is a question asking 'who is it'.", "Useful for finding domain registrar info and admin contact emails."], 
    scenario: "During the reconnaissance phase, you need to find out when a suspicious domain was registered.", 
    tags: ["osint", "recon", "tools"], 
    answer: "whois", 
    category: "OSINT" 
  },
  { 
    title: "Overwhelming the Target", 
    description: "What type of attack involves multiple compromised computer systems attacking a single target, thereby causing denial of service?", 
    level: 1, 
    hints: ["It's an amplified version of a DoS attack.", "Botnets are typically used for this."], 
    scenario: "A web server crashes because it is suddenly receiving millions of requests per second from thousands of different IP addresses globally.", 
    tags: ["network", "attacks", "availability"], 
    answer: "ddos", 
    category: "Network Security" 
  },
  { 
    title: "The Logic Bomb", 
    description: "What do we call malicious code that is intentionally inserted into software, designed to execute a malicious function when specific conditions are met?", 
    level: 2, 
    hints: ["It lies dormant until a trigger event occurs (like a specific date or time).", "Named after an explosive device with a timer."], 
    scenario: "A disgruntled former employee wrote a script that deletes the entire database, but it is programmed to only run exactly 6 months after their termination date.", 
    tags: ["malware", "concepts", "threats"], 
    answer: "logic bomb", 
    category: "System Security" 
  }
];


// Validate/coerce levels to be integers 1-3
puzzles.forEach(p => {
  if (typeof p.level === 'undefined' || p.level === null) p.level = 1;
  p.level = Number(p.level);
  if (!Number.isInteger(p.level) || ![1,2,3].includes(p.level)) {
    console.warn(`seedPuzzles: puzzle "${p.title}" had invalid level, coercing to 1`);
    p.level = 1;
  }
});
  
const seedPuzzles = async () => {
  try {
    await connectDB();
    await Puzzle.destroy({ truncate: true });
    console.log('Puzzles deleted.');
    await Puzzle.bulkCreate(puzzles);
    console.log('Puzzles seeded successfully!');
    await sequelize.close();
  } catch (error) {
    console.error('Error seeding puzzles:', error);
    await sequelize.close();
    process.exit(1); // Exit process with failure
  }
};


seedPuzzles();