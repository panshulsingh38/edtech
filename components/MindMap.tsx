'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { QuestionSet } from '@/lib/ai-engine';

// Dynamically import to avoid SSR issues with Three.js and window object
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface MindMapProps {
  testData: QuestionSet;
}

export default function MindMap({ testData }: MindMapProps) {
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate graph data from testData
    const nodes: any[] = [];
    const links: any[] = [];

    // Central Node (The Subject)
    const rootId = 'root';
    nodes.push({
      id: rootId,
      name: testData.testTitle || 'Main Topic',
      val: 20, // size
      color: '#6366f1' // indigo
    });

    // Create a node for each question
    testData.questions.forEach((q, i) => {
      const qId = `q_${i}`;
      nodes.push({
        id: qId,
        name: q.questionText.length > 50 ? q.questionText.substring(0, 47) + '...' : q.questionText,
        val: 10,
        color: '#ec4899', // pink
        isQuestion: true,
        fullText: q.questionText,
        answer: q.correctAnswer
      });

      // Link to root
      links.push({
        source: rootId,
        target: qId,
        color: 'rgba(255,255,255,0.2)'
      });

      // Create a node for the answer
      const aId = `a_${i}`;
      nodes.push({
        id: aId,
        name: q.correctAnswer,
        val: 5,
        color: '#10b981', // emerald
        isAnswer: true
      });

      // Link question to answer
      links.push({
        source: qId,
        target: aId,
        color: 'rgba(236, 72, 153, 0.4)'
      });
    });

    setGraphData({ nodes, links });
  }, [testData]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="w-full aspect-video rounded-3xl overflow-hidden border border-glass-border bg-oled-black relative shadow-2xl">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-glass-border flex items-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-electric-blue"></div> Core</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-zinc-9005"></div> Question</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Answer</div>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-glass-border text-zinc-400 text-sm">
        Drag to rotate • Scroll to zoom
      </div>

      {(typeof window !== 'undefined') && (
        <ForceGraph3D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor="color"
          nodeRelSize={6}
          linkColor="color"
          linkWidth={1.5}
          backgroundColor="#0a0a0f"
          showNavInfo={false}
          onNodeClick={(node: any) => {
            if (node.isQuestion) {
              alert(`Question: ${node.fullText}\n\nAnswer: ${node.answer}`);
            }
          }}
        />
      )}
    </div>
  );
}
