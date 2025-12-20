import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';
import { playTypingSound, playClickSound } from '../utils/audio';

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<string[]>(['Welcome to CyberHack OS v4.0.2', 'Type "help" for available commands.']);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    let output = '';

    switch (cleanCmd) {
      case 'help':
        output = 'Available commands: help, status, whoami, clear, date';
        break;
      case 'status':
        output = 'SYSTEM STATUS: OPERATIONAL. CONNECTION: SECURE. THREAT LEVEL: LOW.';
        break;
      case 'whoami':
        output = 'guest@cyberhack-terminal';
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'clear':
        setHistory([]);
        return;
      case '':
        return;
      default:
        output = `Command not found: ${cleanCmd}`;
    }

    setHistory(prev => [...prev, `root@kali:~# ${cmd}`, output]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    playClickSound();
    handleCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      // Just for typing sound effect
      if (e.key !== 'Enter') playTypingSound();
  };

  return (
    <div className="w-full bg-black/80 border border-slate-700 rounded-lg overflow-hidden font-mono text-sm shadow-2xl">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-4 text-slate-400 text-xs flex items-center">
            <TerminalIcon className="w-3 h-3 mr-2" /> root@kali:~
        </span>
      </div>
      <div className="p-4 h-64 overflow-y-auto space-y-2" onClick={() => document.getElementById('term-input')?.focus()}>
        {history.map((line, i) => (
          <div key={i} className={`${line.startsWith('root') ? 'text-slate-300' : 'text-cyan-400'}`}>
            {line}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center text-slate-300">
          <span className="mr-2 text-green-500">root@kali:~#</span>
          <input
            id="term-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none border-none text-slate-100"
            autoComplete="off"
            autoFocus
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;