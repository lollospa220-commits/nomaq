import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Mock Database interface for running locally without DB configuration
interface MockDb {
  flights: any[];
  hotels: any[];
  waitlist: any[];
  saved_items: any[];
  [key: string]: any[];
}

const getMockDb = (): MockDb => {
  const g = globalThis as any;
  if (!g.mockDb) {
    g.mockDb = {
      flights: [],
      hotels: [],
      waitlist: [],
      saved_items: [],
    };
  }
  return g.mockDb;
};

class MockQueryBuilder {
  private table: string;
  private filters: Array<{ key: string; value: any; op: 'eq' | 'like' }> = [];
  private isDelete: boolean = false;
  private isCountOnly: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    if (options?.count === 'exact') {
      this.isCountOnly = true;
    }
    return this;
  }

  eq(key: string, value: any) {
    this.filters.push({ key, value, op: 'eq' });
    return this;
  }

  like(key: string, pattern: string) {
    this.filters.push({ key, value: pattern, op: 'like' });
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  private matchesFilters(item: any): boolean {
    return this.filters.every((f) => {
      if (f.op === 'like') {
        // Converte il pattern SQL LIKE (% jolly) in regex, con escape del resto
        const rx = new RegExp('^' + String(f.value).split('%').map((part) =>
          part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
        return rx.test(String(item[f.key] ?? ''));
      }
      return item[f.key] === f.value;
    });
  }

  async maybeSingle() {
    const db = getMockDb();
    const tableData = db[this.table] || [];
    const filtered = tableData.filter((item: any) => this.matchesFilters(item));
    return { data: filtered[0] || null, error: null };
  }

  async insert(values: any[]) {
    const db = getMockDb();
    const tableData = db[this.table] || [];
    
    // Custom check for waitlist duplicate email
    if (this.table === 'waitlist') {
      for (const val of values) {
        if (tableData.some((item: any) => item.email === val.email)) {
          return { data: null, error: { code: '23505', message: 'Email duplicate' } };
        }
      }
    }

    // Assign IDs if not present
    const newValues = values.map((val, idx) => ({
      id: val.id || `${this.table}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...val
    }));

    db[this.table] = [...tableData, ...newValues];
    return { data: newValues, error: null };
  }

  async upsert(values: any | any[]) {
    const db = getMockDb();
    const tableData = [...(db[this.table] || [])];
    const vals = Array.isArray(values) ? values : [values];

    for (const val of vals) {
      const id = val.id;
      const idx = tableData.findIndex((item: any) => item.id === id);
      if (idx > -1) {
        tableData[idx] = { ...tableData[idx], ...val };
      } else {
        tableData.push({
          id: id || `${this.table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          ...val
        });
      }
    }

    db[this.table] = tableData;
    return { data: values, error: null };
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const db = getMockDb();
      const tableData = db[this.table] || [];

      if (this.isDelete) {
        const remaining = tableData.filter((item: any) => !this.matchesFilters(item));
        const deletedCount = tableData.length - remaining.length;
        db[this.table] = remaining;
        const result = { data: null, error: null, count: deletedCount };
        return onfulfilled ? onfulfilled(result) : result;
      }

      const filtered = tableData.filter((item: any) => this.matchesFilters(item));

      const result = {
        data: filtered,
        error: null,
        count: this.isCountOnly ? filtered.length : undefined
      };

      return onfulfilled ? onfulfilled(result) : result;
    } catch (err) {
      if (onrejected) {
        return onrejected(err);
      }
      throw err;
    }
  }
}

const mockSupabase = {
  from(table: string) {
    return new MockQueryBuilder(table);
  }
};

const isConfigured = 
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseUrl.includes('dummy') &&
  !supabaseUrl.includes('YOUR_');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockSupabase as any);


