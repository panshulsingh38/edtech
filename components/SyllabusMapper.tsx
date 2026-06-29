import React from 'react';
import { Network, CheckCircle2, AlertCircle } from 'lucide-react';

type TopicNode = {
  id: string;
  name: string;
  mastery: number; // 0 to 100
  children?: TopicNode[];
};

export default function SyllabusMapper({ topics }: { topics: TopicNode[] }) {
  const renderTopic = (topic: TopicNode, level: number = 0) => {
    const isMastered = topic.mastery >= 80;
    const isWeak = topic.mastery < 40;

    return (
      <div key={topic.id} className={`ml-${level * 6} mt-4`}>
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMastered ? 'bg-green-500/10 border-green-500/30' : isWeak ? 'bg-red-500/10 border-red-500/30' : 'bg-nord-1/50 border-nord-3'}`}>
          {isMastered ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : isWeak ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Network className="w-5 h-5 text-nord-4" />}
          <div className="flex-1">
            <h4 className={`font-medium ${isMastered ? 'text-green-200' : isWeak ? 'text-red-200' : 'text-nord-6'}`}>{topic.name}</h4>
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full ${isMastered ? 'bg-green-400' : isWeak ? 'bg-red-400' : 'bg-indigo-400'}`} 
                style={{ width: `${topic.mastery}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold opacity-70">{topic.mastery}%</span>
        </div>
        
        {topic.children && topic.children.length > 0 && (
          <div className="border-l-2 border-nord-3 ml-6 pl-4 mt-2">
            {topic.children.map(child => renderTopic(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#13131a] border border-white/5 p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Network className="w-6 h-6 text-nord-8" />
        <h2 className="text-2xl font-bold text-white">Official Syllabus Blueprint</h2>
      </div>
      <div className="space-y-4">
        {topics.map(topic => renderTopic(topic, 0))}
      </div>
    </div>
  );
}
