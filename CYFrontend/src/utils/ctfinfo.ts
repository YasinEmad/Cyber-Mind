// NOTE: The authoritative CTF level information is now stored in the backend at CYBackend/src/data/ctfinfo.js
// This file is kept on the frontend as a fallback/cache. Fetch from the backend using the Redux CTF slice or direct axios requests.
// Use API: GET http://localhost:8080/api/ctf/info

export default {
  "levels": [
    {
      "level": 1,
      "name": "Linux File System Navigation",
      "description": "Navigate through Linux directories and find hidden files.",
      "category": "Linux",
      "hints": ["Use 'ls -a' to see hidden files", "Look for files starting with '.'", "Check common directories like /home and /etc"],
      "target": "Find the hidden flag file in the user directory"
    },
    {
      "level": 2,
      "name": "Linux Permissions",
      "description": "Understand and exploit file permission vulnerabilities in Linux.",
      "category": "Linux",
      "hints": ["Check file permissions with 'ls -l'", "Look for files with setuid bit set", "Use 'chmod' to change permissions if needed"],
      "target": "Find and read a file with restricted permissions containing the flag"
    },
    {
      "level": 3,
      "name": "Linux Environment Variables",
      "description": "Extract sensitive information from Linux environment variables.",
      "category": "Linux",
      "hints": ["Use 'env' or 'printenv' to list environment variables", "Look for variables containing sensitive data", "Check for custom environment variables"],
      "target": "Find the environment variable containing the secret flag"
    },
    {
      "level": 4,
      "name": "Linux Process Management",
      "description": "Analyze running processes in Linux to find hidden data.",
      "category": "Linux",
      "hints": ["Use 'ps aux' to list all processes", "Check process command lines for sensitive information", "Look for unusual or hidden processes"],
      "target": "Find the process running with the flag in its command line or environment"
    },
    {
      "level": 5,
      "name": "Linux Cron Jobs",
      "description": "Discover scheduled tasks and extract flags from cron configurations.",
      "category": "Linux",
      "hints": ["Check /etc/crontab and /var/spool/cron directories", "Look for user-specific cron files", "Examine cron job scripts for embedded flags"],
      "target": "Find the cron job that contains or generates the flag"
    },
    {
      "level": 6,
      "name": "Linux Log Analysis",
      "description": "Search through Linux system logs to find security incidents.",
      "category": "Linux",
      "hints": ["Check /var/log directory for system logs", "Use 'grep' to search for specific patterns", "Look for authentication failures or unusual activities"],
      "target": "Find the security incident logged with the flag"
    },
    {
      "level": 7,
      "name": "Linux Package Management",
      "description": "Exploit vulnerabilities in Linux package installations.",
      "category": "Linux",
      "hints": ["Check installed packages with 'dpkg' or 'rpm'", "Look for vulnerable package versions", "Examine package configuration files"],
      "target": "Find the vulnerable package containing the flag"
    },
    {
      "level": 8,
      "name": "Linux Kernel Modules",
      "description": "Analyze and manipulate Linux kernel modules for privilege escalation.",
      "category": "Linux",
      "hints": ["Use 'lsmod' to list loaded kernel modules", "Check /lib/modules for available modules", "Look for custom or suspicious modules"],
      "target": "Find the kernel module that contains the flag or provides escalation"
    },
    {
      "level": 9,
      "name": "Linux Network Configuration",
      "description": "Configure and analyze Linux network settings.",
      "category": "Linux",
      "hints": ["Check /etc/network/interfaces or network configuration files", "Use 'ifconfig' or 'ip addr' to view network interfaces", "Look for network-related configuration files"],
      "target": "Find the network configuration containing the flag"
    },
    {
      "level": 10,
      "name": "Linux Boot Process",
      "description": "Understand the Linux boot sequence and find boot-time vulnerabilities.",
      "category": "Linux",
      "hints": ["Check /boot directory for boot files", "Examine GRUB configuration", "Look for init scripts and boot parameters"],
      "target": "Find the boot configuration or script containing the flag"
    },
    {
      "level": 11,
      "name": "Windows File System",
      "description": "Navigate Windows file systems and find hidden files.",
      "category": "Windows"
    },
    {
      "level": 12,
      "name": "Windows Registry",
      "description": "Extract sensitive data from Windows registry keys.",
      "category": "Windows"
    },
    {
      "level": 13,
      "name": "Windows Services",
      "description": "Analyze and exploit Windows service vulnerabilities.",
      "category": "Windows"
    },
    {
      "level": 14,
      "name": "Windows Event Logs",
      "description": "Search Windows event logs for security information.",
      "category": "Windows"
    },
    {
      "level": 15,
      "name": "Windows User Accounts",
      "description": "Manage and exploit Windows user account configurations.",
      "category": "Windows"
    },
    {
      "level": 16,
      "name": "Windows Group Policy",
      "description": "Understand and bypass Windows Group Policy restrictions.",
      "category": "Windows"
    },
    {
      "level": 17,
      "name": "Windows Scheduled Tasks",
      "description": "Analyze Windows Task Scheduler for hidden tasks.",
      "category": "Windows"
    },
    {
      "level": 18,
      "name": "Windows DLL Hijacking",
      "description": "Exploit DLL loading vulnerabilities in Windows.",
      "category": "Windows"
    },
    {
      "level": 19,
      "name": "Windows Firewall",
      "description": "Bypass Windows firewall configurations.",
      "category": "Windows"
    },
    {
      "level": 20,
      "name": "Windows PowerShell",
      "description": "Use PowerShell for system enumeration and exploitation.",
      "category": "Windows"
    },
    {
      "level": 21,
      "name": "Network Scanning",
      "description": "Use network scanning tools to discover hosts and services.",
      "category": "Network"
    },
    {
      "level": 22,
      "name": "Port Analysis",
      "description": "Analyze open ports and identify vulnerable services.",
      "category": "Network"
    },
    {
      "level": 23,
      "name": "Packet Capture",
      "description": "Capture and analyze network packets for sensitive data.",
      "category": "Network"
    },
    {
      "level": 24,
      "name": "DNS Enumeration",
      "description": "Enumerate DNS records to find hidden domains.",
      "category": "Network"
    },
    {
      "level": 25,
      "name": "Network Protocols",
      "description": "Understand and exploit common network protocols.",
      "category": "Network"
    },
    {
      "level": 26,
      "name": "Firewall Evasion",
      "description": "Bypass network firewalls and intrusion detection systems.",
      "category": "Network"
    },
    {
      "level": 27,
      "name": "VPN Analysis",
      "description": "Analyze VPN configurations and find vulnerabilities.",
      "category": "Network"
    },
    {
      "level": 28,
      "name": "Wireless Networks",
      "description": "Exploit wireless network vulnerabilities.",
      "category": "Network"
    },
    {
      "level": 29,
      "name": "Network Segmentation",
      "description": "Understand and bypass network segmentation controls.",
      "category": "Network"
    },
    {
      "level": 30,
      "name": "Network Forensics",
      "description": "Analyze network traffic for forensic evidence.",
      "category": "Network"
    },
    {
      "level": 31,
      "name": "SQL Injection",
      "description": "Exploit SQL injection vulnerabilities in web applications.",
      "category": "Web Security"
    },
    {
      "level": 32,
      "name": "Cross-Site Scripting (XSS)",
      "description": "Inject malicious scripts into web pages.",
      "category": "Web Security"
    },
    {
      "level": 33,
      "name": "Cross-Site Request Forgery (CSRF)",
      "description": "Exploit CSRF vulnerabilities to perform unauthorized actions.",
      "category": "Web Security"
    },
    {
      "level": 34,
      "name": "Broken Access Control",
      "description": "Bypass access controls in web applications.",
      "category": "Web Security"
    },
    {
      "level": 35,
      "name": "Web Application Firewall Bypass",
      "description": "Bypass WAF protections to exploit web vulnerabilities.",
      "category": "Web Security"
    }
  ]
}