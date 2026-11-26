import {
    isSupabaseConfigured,
    supabaseAnonKey,
    supabaseUrl
} from "./supabase-config.js";

if (isSupabaseConfigured) {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    window.saveSheetalOrder = async order => {
        const row = {
            id: crypto.randomUUID(),
            order_id: order.orderId,
            order_date: order.date,
            name: order.name,
            phone: order.phone,
            address: order.address,
            pincode: order.pincode || "",
            order_type: order.orderType || "Home Delivery",
            payment_method: order.paymentMethod || "Cash on Delivery",
            items: order.items,
            subtotal: Number(order.subtotal) || 0,
            delivery_charge: Number(order.deliveryCharge) || 0,
            total: Number(order.total) || 0,
            status: "New"
        };
        const { error } = await supabase.from("orders").insert(row);
        if (error) throw error;
        return row.id;
    };

    window.saveSheetalCakeRequest = async request => {
        const id = crypto.randomUUID();
        const [referencePhotoPath, customerPhotoPath] = await Promise.all([
            uploadRequestPhoto(supabase, id, "reference", request.referencePhoto),
            uploadRequestPhoto(supabase, id, "customer", request.customerPhoto)
        ]);
        const { error } = await supabase.from("custom_cake_requests").insert({
            id,
            name: request.name,
            phone: request.phone,
            flavour: request.flavour,
            size: request.size,
            required_date: request.requiredDate,
            message: request.message,
            payment_method: request.paymentMethod,
            has_reference_photo: Boolean(request.referencePhoto),
            has_customer_photo: Boolean(request.customerPhoto),
            reference_photo_path: referencePhotoPath,
            customer_photo_path: customerPhotoPath,
            status: "New"
        });
        if (error) throw error;
        return id;
    };
}

async function uploadRequestPhoto(supabase, requestId, label, file) {
    if (!file) return "";
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
        throw new Error("Request photos must be JPEG, PNG, WebP or GIF images smaller than 5 MB.");
    }

    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${requestId}/${label}.${extension}`;
    const { error } = await supabase.storage.from("cake-requests").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
    });
    if (error) throw error;
    return path;
}
