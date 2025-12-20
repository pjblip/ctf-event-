import { Challenge, Achievement } from './types';

export const MOCK_CASES: Challenge[] = [
  {
      id: 'web001',
      title: 'Cross-Site Catastrophe',
      description: 'Identify and exploit the Cross-Site Scripting (XSS) vulnerability to steal the admin\'s session cookie.',
      difficulty: 'easy',
      points: 100,
      hint: 'Look for un-sanitized user input in the comment section. Can you inject a script tag?',
      flag: 'flag{XSS_MASTER_001}',
      estimatedTime: '1 MIN',
      duration: 60,
  },
  {
      id: 'crypto002',
      title: 'Broken Caesar',
      description: 'The company uses a custom, weak substitution cipher. Decrypt the secret message.',
      difficulty: 'easy',
      points: 150,
      hint: 'The cipher is a simple rotation. Try a frequency analysis or brute-force the 25 possible keys.',
      flag: 'flag{ROT13_IS_CHILD_PLAY}',
      estimatedTime: '1 MIN',
      duration: 60,
      fileUrl: '#' // Mock file
  },
  {
      id: 'pwn003',
      title: 'Stack Overflow Intro',
      description: 'Exploit a buffer overflow vulnerability to overwrite the return address and execute a custom function.',
      difficulty: 'medium',
      points: 300,
      hint: 'Find the size of the buffer and the offset to the return address.',
      flag: 'flag{EIP_CONTROL_ACHIEVED}',
      estimatedTime: '3 MIN',
      duration: 180,
      fileUrl: '#' // Mock file
  },
  {
      id: 'web004',
      title: 'SQL Injection: Login Bypass',
      description: 'Bypass the login form by injecting a malicious string into the username field.',
      difficulty: 'medium',
      points: 400,
      hint: 'Try using comments and OR clauses in the username field to make the SQL query always true.',
      flag: 'flag{UNION_SELECT_PASSED}',
      estimatedTime: '3 MIN',
      duration: 180,
  },
  {
      id: 'crypto005',
      title: 'RSA Key Recovery',
      description: 'Given a public key and an unusually small exponent, find the private key and decrypt the message.',
      difficulty: 'hard',
      points: 750,
      hint: 'The small exponent makes it susceptible to a Wiener\'s attack or similar low-exponent attacks.',
      flag: 'flag{PRIME_FACTORS_EXPOSED}',
      estimatedTime: '6 MIN',
      duration: 360,
      fileUrl: '#'
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'Hello World',
    description: 'Solve your first challenge.',
    icon: '🔰',
    condition: (stats) => stats.correct >= 1
  },
  {
    id: 'script_kiddie',
    title: 'Script Kiddie',
    description: 'Reach 250 Points.',
    icon: '💻',
    condition: (stats) => stats.points >= 250
  },
  {
    id: 'hacker',
    title: 'White Hat',
    description: 'Reach 500 Points.',
    icon: '🕵️',
    condition: (stats) => stats.points >= 500
  },
  {
    id: 'elite',
    title: 'Elite Hacker',
    description: 'Reach 1000 Points.',
    icon: '💀',
    condition: (stats) => stats.points >= 1000
  },
  {
    id: 'perfectionist',
    title: 'Completionist',
    description: 'Solve 5 Challenges.',
    icon: '🏆',
    condition: (stats) => stats.correct >= 5
  }
];