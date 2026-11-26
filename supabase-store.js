import {
    isSupabaseConfigured,
    supabaseAnonKey,
    supabaseUrl
} from "./supabase-config.js";

if (isSupabaseConfigured) {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    async function loadProducts() {
        const { data, error } = await supabase
            .from("products")
            .select("id,name,category,price,image,description,hidden")
            .order("name");
        if (error) {
            console.error("Unable to load public products from Supabase:", error);
            return;
        }
        window.setSheetalStoreProducts(data || []);
    }

    async function loadWebsiteContent() {
        const { data, error } = await supabase
            .from("website_content")
            .select("*")
            .eq("id", "public")
            .maybeSingle();
        if (error) {
            console.error("Unable to load public website content from Supabase:", error);
            return;
        }
        if (!data) return;
        if (typeof window.applySheetalWebsiteContent === "function") {
            window.applySheetalWebsiteContent({
                bannerTitle: data.banner_title,
                bannerDescription: data.banner_description,
                shopHours: data.shop_hours,
                shopLocation: data.shop_location,
                shopPhone: data.shop_phone,
                alternatePhone: data.alternate_phone,
                featuredProducts: data.featured_products,
                reviewUrl: data.review_url,
                catalogueUrl: data.catalogue_url
            });
        }
    }

    void loadProducts();
    void loadWebsiteContent();

    supabase
        .channel("shop-public-content")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
            void loadProducts();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "website_content" }, () => {
            void loadWebsiteContent();
        })
        .subscribe(status => {
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                console.error("Supabase public content subscription status:", status);
            }
        });
}
