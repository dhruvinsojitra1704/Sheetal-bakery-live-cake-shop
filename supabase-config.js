export const supabaseUrl = "";
export const supabaseAnonKey = "";
export const adminEmail = "";

export const isSupabaseConfigured = [
    supabaseUrl,
    supabaseAnonKey,
    adminEmail
].every(value => typeof value === "string" && value.trim().length > 0);
