export function parseMetadataToErd(metadata) {
  if (!metadata || !metadata.trim()) {
    return { nodes: [], edges: [] };
  }

  try {
    // Try to parse as JSON first (for PostgreSQL/MySQL comprehensive queries)
    const jsonData = JSON.parse(metadata.trim());
    
    if (Array.isArray(jsonData)) {
      return parseJsonMetadata(jsonData);
    } else if (jsonData.schema_metadata) {
      return parseJsonMetadata(jsonData.schema_metadata);
    }
  } catch (error) {
    // If JSON parsing fails, try CSV parsing as fallback
    console.log('JSON parsing failed, trying CSV fallback:', error);
    return parseCsvMetadata(metadata);
  }

  return { nodes: [], edges: [] };
}

function parseJsonMetadata(tables) {
  const nodes = [];
  const edges = [];
  const tablePositions = {};

  // Calculate positions for tables using a grid layout
  const columnsPerRow = 4;
  const nodeWidth = 200;
  const nodeHeight = 150;
  const horizontalSpacing = 250;
  const verticalSpacing = 200;

  tables.forEach((table, index) => {
    const row = Math.floor(index / columnsPerRow);
    const col = index % columnsPerRow;
    
    const x = 50 + col * horizontalSpacing;
    const y = 50 + row * verticalSpacing;
    
    tablePositions[table.table_name] = { x, y };
  });

  // Create nodes
  tables.forEach(table => {
    const columns = table.columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      isPrimary: col.is_primary_key === 'YES',
      isForeign: col.is_foreign_key === 'YES',
      foreignTable: col.foreign_table_name,
      foreignColumn: col.foreign_column_name
    }));

    nodes.push({
      id: table.table_name,
      type: 'tableNode',
      position: tablePositions[table.table_name],
      data: {
        tableName: table.table_name,
        columns
      }
    });
  });

  // Create edges for foreign key relationships
  tables.forEach(table => {
    table.columns.forEach(col => {
      if (col.is_foreign_key === 'YES' && col.foreign_table_name) {
        // Find the target table and its primary key column
        const targetTable = tables.find(t => t.table_name === col.foreign_table_name);
        if (targetTable) {
          const targetPrimaryKey = targetTable.columns.find(c => c.is_primary_key === 'YES');
          if (targetPrimaryKey) {
            edges.push({
              id: `${table.table_name}_${col.column_name}_to_${col.foreign_table_name}`,
              source: table.table_name,
              target: col.foreign_table_name,
              sourceHandle: `${col.column_name}-source`,
              targetHandle: `${targetPrimaryKey.column_name}-target`,
              type: 'smoothstep',
              style: { stroke: '#2563eb', strokeWidth: 2 },
              animated: true,
              markerEnd: {
                type: 'arrowclosed',
                width: 20,
                height: 20,
                color: '#2563eb'
              }
            });
          }
        }
      }
    });
  });

  return { nodes, edges };
}

function parseCsvMetadata(metadata) {
  // Fallback CSV parser for simpler outputs
  const lines = metadata.trim().split('\n');
  if (lines.length < 2) {
    return { nodes: [], edges: [] };
  }

  const tables = {};
  
  // Skip header line and parse data
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const [tableName, columnName, dataType] = parts;
      
      if (!tables[tableName]) {
        tables[tableName] = {
          columns: [],
          position: { x: 0, y: 0 }
        };
      }
      
      tables[tableName].columns.push({
        name: columnName,
        type: dataType,
        isPrimary: false,
        isForeign: false
      });
    }
  }

  // Generate nodes from tables
  const nodes = Object.entries(tables).map(([tableName, tableData], index) => {
    const x = 100 + (index * 300);
    const y = 100 + (index * 200);
    
    return {
      id: tableName,
      type: 'tableNode',
      position: { x, y },
      data: {
        tableName,
        columns: tableData.columns
      }
    };
  });

  return {
    nodes,
    edges: []
  };
} 