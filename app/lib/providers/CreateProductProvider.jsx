"use client"
import { useState, useCallback } from "react";
import { createContext } from "react";
import { fetcher, postFetcher, putFetcher, blobFetcher } from "@/app/lib/data";

export let CreateProductContext = createContext();

export default function CreateProductProvider({ children }) {
    let Details = useState('');
    let Category = useState('');
    let Brand = useState('');
    let Product = useState('');
    let Price = useState();
    let AlternatePrice = useState('');
    let Description = useState('');
    let Variations = useState([]); // Will store attribute-value combinations
    let Perks = useState(['Free shipping on orders over Ksh 300','NgwindsongkExpress under 90min delivery']);
    let Media = useState([]);
    let FAQ = useState([]);
    let Stock = useState('');
    let CarouselMedia = useState([]);
    let ExistingMedia = useState([]); // Store existing DB image records {id, url, is_primary}

    // New state for attributes and their values
    let Attributes = useState({}); // Store attribute objects: { [name]: { [value]: { price, stock, discount, image } } }
    let ProductVariations = useState([]); // Store final product variations with pricing

    let DraftId = useState(null);
    let IsPublished = useState(false);
    let LoadedProduct = useState(null); // Track the currently loaded product to prevent redundant fetches

    const saveDraft = useCallback(() => {
        const draftData = {
            name: Product[0] || 'Untitled Draft',
            data: {
                details: Details[0],
                category: Category[0],
                brand: Brand[0],
                product: Product[0],
                price: Price[0],
                alternatePrice: AlternatePrice[0],
                description: Description[0],
                variations: Variations[0],
                perks: Perks[0],
                faq: FAQ[0],
                attributes: Attributes[0],
                productVariations: ProductVariations[0],
            }
        };

        if (DraftId[0]) {
            return putFetcher([`/drafts/${DraftId[0]}`, draftData]);
        } else {
            return postFetcher(['/drafts', draftData]).then((res) => {
                if (res?.draft?.id) DraftId[1](res.draft.id);
                return res;
            });
        }
    }, [Product, Details, Category, Brand, Price, AlternatePrice, Description, Variations, Perks, FAQ, Attributes, ProductVariations, DraftId]);

    const loadDraft = useCallback((id) => {
        return fetcher([`/drafts/${id}`, {}]).then((draft) => {
            const d = draft.data;
            if (d.details !== undefined) Details[1](d.details);
            if (d.category !== undefined) Category[1](d.category);
            if (d.brand !== undefined) Brand[1](d.brand);
            if (d.product !== undefined) Product[1](d.product);
            if (d.price !== undefined) Price[1](d.price);
            if (d.alternatePrice !== undefined) AlternatePrice[1](d.alternatePrice);
            if (d.description !== undefined) Description[1](d.description);
            if (d.variations !== undefined) Variations[1](d.variations);
            if (d.perks !== undefined) Perks[1](d.perks);
            if (d.faq !== undefined) FAQ[1](d.faq);
            if (d.attributes !== undefined) Attributes[1](d.attributes);
            if (d.productVariations !== undefined) ProductVariations[1](d.productVariations);
            DraftId[1](draft.id);
            return draft;
        });
    }, [Details, Category, Brand, Product, Price, AlternatePrice, Description, Variations, Perks, FAQ, Attributes, ProductVariations, DraftId]);

    // Load an existing product by id (or name) and populate provider state.
    const loadProduct = useCallback(async (idOrName) => {
        if (!idOrName) return null;
        if (LoadedProduct[0] === idOrName) return null; // Already loaded this product's data

        try {
            const response = await fetcher([`/products/${idOrName}`, {}]);
            const d = response;

            // Basic fields
            if (d.category) Category[1](d.category.name || d.category);
            if (d.brand) Brand[1](d.brand.name || d.brand);
            if (d.name) Product[1](d.name);
            if (d.price !== undefined) Price[1](d.price);
            if (d.discount !== undefined) AlternatePrice[1](d.discount);
            if (d.about !== undefined) Description[1](d.about);
            if (d.stock !== undefined) Stock[1](d.stock);

            // Rich text details
            if (d.description && typeof d.description === 'object' && d.description.description) {
                Details[1](d.description.description);
            } else if (typeof d.description === 'string') {
                Details[1](d.description);
            }

            // Attributes & variations
            if (d.product_variations && Array.isArray(d.product_variations) && d.product_variations.length > 0) {
                const attrs = {};
                const varMap = {};
                d.product_variations.forEach(v => {
                    if (!attrs[v.attribute_name]) attrs[v.attribute_name] = {};
                    attrs[v.attribute_name][v.attribute_value] = {
                        price: v.price !== null ? v.price : '',
                        stock: v.stock !== null ? v.stock : '',
                        discount: v.discount !== null ? v.discount : '',
                        image: v.image || '',
                        weight_kg: v.weight_kg !== null ? v.weight_kg : '',
                        min_order_quantity: v.min_order_quantity !== null ? v.min_order_quantity : '',
                        is_bulk: !!v.is_bulk
                    };

                    if (!varMap[v.attribute_name]) varMap[v.attribute_name] = new Set();
                    varMap[v.attribute_name].add(v.attribute_value);
                });
                Attributes[1](attrs);

                const varsArray = [];
                for (const [name, set] of Object.entries(varMap)) {
                    varsArray.push({ name: name, options: Array.from(set) });
                }
                Variations[1](varsArray);
                ProductVariations[1](d.product_variations);
            }

            // FAQs and perks
            if (d.faqs) FAQ[1](d.faqs);
            if (d.perks) Perks[1](d.perks);

            // Media files
            const existingFiles = [];
            const images = d.product_images || d.images || [];
            if (Array.isArray(images) && images.length > 0) {
                images.forEach(img => {
                    existingFiles.push({
                        id: img.id,
                        url: img.url || img.image_path || img.image,
                        is_primary: !!img.is_primary
                    });
                });
            }

            if (existingFiles.length > 0) {
                ExistingMedia[1](existingFiles);
            }

            LoadedProduct[1](idOrName);
            return response;
        } catch (err) {
            console.error('Failed to load product', err);
            return null;
        }
    }, [LoadedProduct, Category, Brand, Product, Details, Price, AlternatePrice, Description, Stock, Attributes, Variations, ProductVariations, FAQ, Perks, ExistingMedia]);

    return(
        <CreateProductContext.Provider value={{
            Details,
            Category, Brand, Product, 
            Price, AlternatePrice,
            Perks, Stock,
            Description, Variations, Media,
            CarouselMedia,
            ExistingMedia, // expose ExistingMedia
            FAQ,
            Attributes,
            ProductVariations,
            DraftId,
            IsPublished,
            saveDraft,
            loadDraft,
            loadProduct
        }}>
        {children}
        </CreateProductContext.Provider>
    )
}