import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaKey, FaLink } from "react-icons/fa";
import { Handle, Position } from "reactflow";

// Color schemes for different table types
const getTableColor = (tableName) => {
    const colors = [
        'from-slate-400 to-slate-600',
        'from-gray-400 to-gray-600',
        'from-zinc-400 to-zinc-600',
        'from-neutral-400 to-neutral-600',
        'from-stone-400 to-stone-600',
        'from-blue-400 to-blue-600',
        'from-indigo-400 to-indigo-600',
        'from-cyan-400 to-cyan-600',
        'from-teal-400 to-teal-600',
        'from-emerald-400 to-emerald-600',
        'from-green-400 to-green-600',
        'from-lime-400 to-lime-600',
        'from-yellow-400 to-yellow-600',
        'from-amber-400 to-amber-600',
        'from-orange-400 to-orange-600',
        'from-red-400 to-red-600',
        'from-rose-400 to-rose-600',
        'from-pink-400 to-pink-600',
        'from-fuchsia-400 to-fuchsia-600',
        'from-violet-400 to-violet-600',
        'from-purple-400 to-purple-600',
        'from-sky-400 to-sky-600',
      ];
      
      
  
  // Use table name to consistently assign colors
  const index = tableName.length % colors.length;
  return colors[index];
};

export default function TableNode({ data }) {
  const colorScheme = getTableColor(data.tableName);
  
  return (
    <Card className="w-48 shadow-lg border border-gray-200 rounded-xl overflow-hidden">
      <CardHeader className={`p-3 pb-1 bg-gradient-to-r ${colorScheme} rounded-t-xl`}>
        <CardTitle className="text-base font-bold text-white truncate drop-shadow-sm">
          {data.tableName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <ul className="space-y-1">
          {data.columns.map((col, index) => (
            <li key={col.name} className="flex items-center gap-2 text-sm text-gray-800 relative">
              {col.isPrimary && <FaKey className="text-yellow-500" title="Primary Key" />}
              {col.isForeign && <FaLink className="text-blue-500" title="Foreign Key" />}
              <span className="font-mono text-xs text-gray-700">{col.name}</span>
              <span className="ml-auto text-gray-400 text-xs">{col.type}</span>
              
              {/* Add handles for foreign key columns */}
              {col.isForeign && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${col.name}-source`}
                  style={{ background: '#2563eb', width: 8, height: 8 }}
                />
              )}
              
              {/* Add handles for primary key columns */}
              {col.isPrimary && (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${col.name}-target`}
                  style={{ background: '#fbbf24', width: 8, height: 8 }}
                />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 