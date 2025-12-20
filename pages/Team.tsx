import React from 'react';
import { Users, Code, Shield, Terminal, Cpu } from 'lucide-react';
import Card from '../components/ui/Card';

// ----------------------------------------------------------------------
// EDIT THIS SECTION TO ADD YOUR TEAM MEMBERS
// ----------------------------------------------------------------------
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "CyberMaster",
    role: "Project Lead & Full Stack",
    bio: "Architect of the mainframe. Specialist in React and Neural Networks.",
    icon: <Terminal className="w-8 h-8 text-cyan-400" />
  },
  {
    id: 2,
    name: "NightShade",
    role: "Security Researcher",
    bio: "Expert in penetration testing and cryptography protocols.",
    icon: <Shield className="w-8 h-8 text-emerald-400" />
  },
  {
    id: 3,
    name: "PixelGhost",
    role: "UI/UX Designer",
    bio: "Crafting visual interfaces and holographic projections.",
    icon: <Code className="w-8 h-8 text-purple-400" />
  },
  {
    id: 4,
    name: "BinaryBard",
    role: "Backend Engineer",
    bio: "Database optimization and server-side logic enforcement.",
    icon: <Cpu className="w-8 h-8 text-yellow-400" />
  }
];
// ----------------------------------------------------------------------

const TeamPage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 flex items-center justify-center gap-4">
          <Users className="w-12 h-12 text-cyan-500" /> 
          Development Team
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          The elite operatives behind the CyberHack Platform. Architects of the simulation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.id} hoverEffect className="flex items-start space-x-6 border-t-4 border-t-slate-700 hover:border-t-cyan-500 transition-colors">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex-shrink-0">
              {member.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
              <div className="text-cyan-500 font-mono text-sm font-bold uppercase tracking-wider mb-3">
                {member.role}
              </div>
              <p className="text-slate-400 leading-relaxed">
                {member.bio}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-20 text-center border-t border-slate-800 pt-12">
        <p className="text-slate-500 font-mono text-sm">
          // SYSTEM CREDITS INITIALIZED<br/>
          // ALL RIGHTS RESERVED {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default TeamPage;