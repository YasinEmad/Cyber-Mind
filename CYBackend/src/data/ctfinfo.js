module.exports = {
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
      "description": "Exploit package manager vulnerabilities to gain access.",
      "category": "Linux",
      "hints": ["Check installed packages with 'dpkg -l' or 'rpm -qa'", "Look for package metadata files", "Examine /var/lib/dpkg or /var/lib/rpm directories"],
      "target": "Find the flag hidden in package manager database"
    },
    {
      "level": 8,
      "name": "Linux User Accounts",
      "description": "Analyze user account information to uncover secrets.",
      "category": "Linux",
      "hints": ["Check /etc/passwd and /etc/shadow files", "Look for unusual user accounts", "Examine user home directories"],
      "target": "Find the hidden flag in user account data"
    },
    {
      "level": 9,
      "name": "Linux File Permissions and Capabilities",
      "description": "Exploit special file permissions (SUID, SGID, sticky bit) and capabilities.",
      "category": "Linux",
      "hints": ["Use 'find' to search for SUID/SGID files", "Check file capabilities with 'getcap'", "Look for exploitable binary permissions"],
      "target": "Use file permissions to escalate privileges and find the flag"
    },
    {
      "level": 10,
      "name": "Linux Kernel Modules",
      "description": "Analyze kernel modules to find hidden information.",
      "category": "Linux",
      "hints": ["Use 'lsmod' to list loaded kernel modules", "Check /lib/modules directory", "Look at kernel module parameters"],
      "target": "Find the flag hidden in kernel module information"
    }
  ]
};
