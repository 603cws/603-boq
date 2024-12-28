import { supabase } from '../services/supabase';

export const fetchCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, subcategories');

        if (error) throw error;

        const formattedData = data
            .map(item => ({
                id: item.id,
                category: item.name,
                subcategories: JSON.parse(item.subcategories || '[]'),
            }))
            .sort((a, b) => a.id - b.id);

        return formattedData;
    } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
    }
};

export const fetchProductsData = async () => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                addons(*, addon_variants(*)),
                product_variants (*)
            `);

        if (error) throw error;

        const allImages = data.flatMap(product => [
            ...product.product_variants.map(variant => variant.image),
            ...product.addons.flatMap(addon => [
                addon.image,
                ...addon.addon_variants.map(variant => variant.image),
            ]),
        ]).filter(Boolean);

        const uniqueImages = [...new Set(allImages)];

        const { data: signedUrls, error: signedUrlError } = await supabase.storage
            .from('addon')
            .createSignedUrls(uniqueImages, 3600);

        if (signedUrlError) throw signedUrlError;

        const urlMap = Object.fromEntries(signedUrls.map(item => [item.path, item.signedUrl]));

        const processedData = data.map(product => ({
            ...product,
            product_variants: product.product_variants.map(variant => ({
                ...variant,
                image: urlMap[variant.image] || '',
            })),
            addons: product.addons.map(addon => ({
                ...addon,
                image: urlMap[addon.image] || '',
                addon_variants: addon.addon_variants.map(variant => ({
                    ...variant,
                    image: urlMap[variant.image] || '',
                })),
            })),
        }));

        return processedData;
    } catch (error) {
        console.error('Error fetching products data:', error);
        return [];
    }
};

export const fetchWorkspaces = async () => {
    try {
        const { data, error } = await supabase.from('workspaces').select();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return [];
    }
};

export const fetchRoomData = async () => {
    try {
        const { data: quantityData, error: quantityError } = await supabase
            .from('quantity')
            .select()
            .order('created_at', { ascending: false })
            .limit(1);

        if (quantityError) throw quantityError;

        const { data: areasData, error: areasError } = await supabase
            .from('areas')
            .select()
            .order('created_at', { ascending: false })
            .limit(1);

        if (areasError) throw areasError;

        return {
            quantityData: quantityData || [],
            areasData: areasData || [],
        };
    } catch (error) {
        console.error('Error fetching room data:', error);
        return { quantityData: [], areasData: [] };
    }
};
