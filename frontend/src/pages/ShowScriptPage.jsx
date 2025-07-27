import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SCRIPTS = {
  postgres: `-- PostgreSQL: Complete Schema Metadata Query
WITH table_info AS (
    SELECT 
        t.table_name,
        t.table_schema,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.ordinal_position,
        CASE 
            WHEN pk.column_name IS NOT NULL THEN 'YES'
            ELSE 'NO'
        END as is_primary_key,
        CASE 
            WHEN fk.column_name IS NOT NULL THEN 'YES'
            ELSE 'NO'
        END as is_foreign_key,
        fk.foreign_table_name,
        fk.foreign_column_name
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name, ku.table_schema
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name 
        AND c.table_schema = pk.table_schema
    LEFT JOIN (
        SELECT 
            ku.table_name, 
            ku.column_name, 
            ku.table_schema,
            ccu.table_name as foreign_table_name,
            ccu.column_name as foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name 
        AND c.table_schema = fk.table_schema
    WHERE t.table_type = 'BASE TABLE' 
        AND t.table_schema NOT IN ('information_schema', 'pg_catalog')
)
SELECT json_agg(
    json_build_object(
        'table_name', table_name,
        'table_schema', table_schema,
        'columns', columns
    )
) as schema_metadata
FROM (
    SELECT 
        table_name,
        table_schema,
        json_agg(
            json_build_object(
                'column_name', column_name,
                'data_type', data_type,
                'is_nullable', is_nullable,
                'column_default', column_default,
                'ordinal_position', ordinal_position,
                'is_primary_key', is_primary_key,
                'is_foreign_key', is_foreign_key,
                'foreign_table_name', foreign_table_name,
                'foreign_column_name', foreign_column_name
            ) ORDER BY ordinal_position
        ) as columns
    FROM table_info
    GROUP BY table_name, table_schema
) grouped_tables;`,
  mysql: `-- MySQL: Complete Schema Metadata Query
SELECT 
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'table_name', t.TABLE_NAME,
            'table_schema', t.TABLE_SCHEMA,
            'columns', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'column_name', c.COLUMN_NAME,
                        'data_type', c.DATA_TYPE,
                        'is_nullable', c.IS_NULLABLE,
                        'column_default', c.COLUMN_DEFAULT,
                        'ordinal_position', c.ORDINAL_POSITION,
                        'is_primary_key', IF(kcu.COLUMN_NAME IS NOT NULL, 'YES', 'NO'),
                        'is_foreign_key', IF(kcu_fk.COLUMN_NAME IS NOT NULL, 'YES', 'NO'),
                        'foreign_table_name', kcu_fk.REFERENCED_TABLE_NAME,
                        'foreign_column_name', kcu_fk.REFERENCED_COLUMN_NAME
                    )
                )
                FROM INFORMATION_SCHEMA.COLUMNS c
                LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
                    ON c.TABLE_NAME = kcu.TABLE_NAME 
                    AND c.COLUMN_NAME = kcu.COLUMN_NAME 
                    AND c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
                    AND kcu.CONSTRAINT_NAME = 'PRIMARY'
                LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu_fk
                    ON c.TABLE_NAME = kcu_fk.TABLE_NAME 
                    AND c.COLUMN_NAME = kcu_fk.COLUMN_NAME 
                    AND c.TABLE_SCHEMA = kcu_fk.TABLE_SCHEMA
                    AND kcu_fk.REFERENCED_TABLE_NAME IS NOT NULL
                WHERE c.TABLE_NAME = t.TABLE_NAME 
                    AND c.TABLE_SCHEMA = t.TABLE_SCHEMA
                ORDER BY c.ORDINAL_POSITION
            )
        )
    ) as schema_metadata
FROM INFORMATION_SCHEMA.TABLES t
WHERE t.TABLE_TYPE = 'BASE TABLE' 
    AND t.TABLE_SCHEMA = DATABASE();`,
  sqlite: `-- SQLite: Schema Metadata (Note: SQLite has limited metadata)
-- First, get all tables
SELECT name FROM sqlite_master WHERE type='table';

-- For each table, run these commands:
-- PRAGMA table_info(table_name);
-- PRAGMA foreign_key_list(table_name);

-- You'll need to manually combine the results or use a script to aggregate them.`,
};

export default function ShowScriptPage({ selectedDb, onBack, onNext }) {
  const [copied, setCopied] = useState(false);
  const script = SCRIPTS[selectedDb] || '-- No script available for this DB type.';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-center">Run this script in your database console</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 rounded p-6 text-sm overflow-x-auto whitespace-pre-wrap max-h-[60vh] leading-relaxed">
          {script}
        </pre>
        <div className="flex gap-2 mb-6 mt-4">
          <Button variant="outline" onClick={handleCopy} type="button">
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
        <div className="flex justify-between">
          <Button variant="secondary" onClick={onBack} type="button">Back</Button>
          <Button onClick={onNext} type="button">Next</Button>
        </div>
      </CardContent>
    </Card>
  );
} 