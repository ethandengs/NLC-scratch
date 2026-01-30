
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Use Anon Key as we might not have Service Role

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars. Please ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
    console.log("--- Supabase Schema Analysis ---");

    // 1. Get Tables
    // Note: 'rpc' is best but restricted. We try to query information_schema via a trick or just standard tables if policy allows.
    // Actually, we can't query information_schema easily with supabase-js unless we have a function.
    // Let's try to infer by selecting one row from known tables.

    const tables = ['users', 'sheep', 'sheep_skins'];

    for (const table of tables) {
        console.log(`\nTable: [${table}]`);
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`  Error/Access Denied: ${error.message}`);
        } else if (data && data.length > 0) {
            const keys = Object.keys(data[0]);
            console.log("  Columns detected from row 1:");
            keys.forEach(k => {
                const val = data[0][k];
                const type = typeof val;
                console.log(`    - ${k} (${type}) : Example: ${JSON.stringify(val).substring(0, 50)}`);
            });
        } else {
            console.log("  Table exists but is empty (or RLS hides rows). Cannot infer structure.");
        }
    }
}

analyze();
