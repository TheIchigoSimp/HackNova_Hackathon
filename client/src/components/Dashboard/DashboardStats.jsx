import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiMap, FiLayers, FiCalendar } from 'react-icons/fi';

/**
 * DashboardStats Component
 * 
 * Displays stats tiles using real data from mindmaps.
 * - Total Mindmaps: count of all mindmaps
 * - Total Nodes: sum of nodeCount across all mindmaps
 * - Days Active: number of days since first mindmap created
 */
const DashboardStats = ({ mindmaps = [] }) => {
  const stats = useMemo(() => {
    const totalMindmaps = mindmaps.length;
    
    // Calculate total nodes across all mindmaps
    const totalNodes = mindmaps.reduce((sum, m) => sum + (m.nodeCount || 0), 0);
    
    // Calculate days active (from oldest mindmap to today)
    let daysActive = 0;
    if (mindmaps.length > 0) {
      const dates = mindmaps.map(m => new Date(m.createdAt).getTime());
      const oldest = Math.min(...dates);
      const now = Date.now();
      daysActive = Math.max(1, Math.floor((now - oldest) / (1000 * 60 * 60 * 24)));
    }

    return [
      { 
        icon: FiMap, 
        value: totalMindmaps, 
        label: 'Learning Paths', 
        color: '#667eea',
        bgColor: 'rgba(102, 126, 234, 0.1)'
      },
      { 
        icon: FiLayers, 
        value: totalNodes, 
        label: 'Total Nodes', 
        color: '#764ba2',
        bgColor: 'rgba(118, 75, 162, 0.1)'
      },
      { 
        icon: FiCalendar, 
        value: daysActive, 
        label: 'Days Active', 
        color: '#f093fb',
        bgColor: 'rgba(240, 147, 251, 0.1)'
      },
    ];
  }, [mindmaps]);

  return (
    <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-6 mb-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.1 }}
          className="flex flex-col items-center p-4 rounded-xl border border-[rgba(102,126,234,0.15)] bg-[rgba(25,25,40,0.4)]"
        >
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: stat.bgColor }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <span 
            className="text-2xl font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </span>
          <span className="text-xs text-[#64748b] text-center">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
