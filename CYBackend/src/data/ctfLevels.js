// ─── CTF CHALLENGES ──────────────────────────────────────────────────────────
// Note: fsMods are kept as functions for backend reference, but sent as JSON to frontend
const challenges = {
  1: {
    description: 'Find the hidden file in the Desktop folder that contains the flag.',
    hint: 'Use ls -a to reveal hidden files.',
    flag: 'CTF{navigation_master}',
    fsModifications: {
      filesToCreate: [
        {
          path: '/home/user/Desktop/.hidden_flag.txt',
          content: 'CTF{navigation_master}',
          isHidden: true,
        },
      ],
      directoriesToModify: [
        {
          path: '/home/user/Desktop',
          filesToAdd: ['.hidden_flag.txt'],
        },
      ],
    },
    fsMods: (fs) => {
      const hiddenPath = '/home/user/Desktop/.hidden_flag.txt';
      fs[hiddenPath] = { type: 'file', content: 'CTF{navigation_master}' };

      const desktop = fs['/home/user/Desktop'];

      if (
        desktop &&
        desktop.type === 'dir' &&
        desktop.children &&
        !desktop.children.includes('.hidden_flag.txt')
      ) {
        desktop.children = [...desktop.children, '.hidden_flag.txt'];
      }
    },
  },
  2: {
    description: 'Find a file with restricted permissions containing the flag.',
    hint: 'Check file permissions with ls -l and look for readable content.',
    flag: 'CTF{permission_explorer}',
    fsModifications: {
      filesToCreate: [
        {
          path: '/home/user/Documents/.restricted.txt',
          content: 'CTF{permission_explorer}',
          permissions: '600',
          isHidden: true,
        },
      ],
      directoriesToModify: [
        {
          path: '/home/user/Documents',
          filesToAdd: ['.restricted.txt'],
        },
      ],
    },
    fsMods: (fs) => {
      const restrictedPath = '/home/user/Documents/.restricted.txt';
      fs[restrictedPath] = {
        type: 'file',
        content: 'CTF{permission_explorer}',
        permissions: '600',
      };

      const documents = fs['/home/user/Documents'];
      if (
        documents &&
        documents.type === 'dir' &&
        documents.children &&
        !documents.children.includes('.restricted.txt')
      ) {
        documents.children = [...documents.children, '.restricted.txt'];
      }
    },
  },
  3: {
    description: 'Extract the secret flag from environment variables.',
    hint: 'Use env or printenv commands to see all environment variables.',
    flag: 'CTF{env_secrets}',
    fsModifications: {
      environmentVariables: {
        SECRET_FLAG: 'CTF{env_secrets}',
      },
    },
    fsMods: (fs) => {
      // Environment variables are handled separately in terminal
    },
  },
};

module.exports = challenges;

