import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ndntezlfqvlwyjctmtib.supabase.co";
const supabasePublishableKey = "sb_publishable_VWSHvtu6olPattLU7uc2BA_XWXTPcIF";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

