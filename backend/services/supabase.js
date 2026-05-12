import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
let supabaseConfigError = null;

if (!supabaseUrl || !supabaseKey) {

  supabaseConfigError =
    "Missing Supabase environment variables.";

} else {

  supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      realtime: {
        transport: ws
      }
    }
  );
}

export {
  supabase,
  supabaseConfigError
};