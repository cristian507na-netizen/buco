import { SupabaseClient } from '@supabase/supabase-js';

export interface ToolContext {
  supabase: SupabaseClient;
  userId: string;
}

export interface SystemTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (input: Record<string, unknown>, context: ToolContext) => Promise<unknown>;
}
