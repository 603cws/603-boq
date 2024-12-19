import { jsPDF } from "jspdf";
import "jspdf-autotable";

const PDFGenerator = {
    generatePDF: async (selectedData) => {
        const doc = new jsPDF();
        const publicUrl = `https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/`;

        // Prepare table data
        const headers = ["Product Details", "Product Image", "Addons"];
        const rows = [];

        for (const item of selectedData) {
            const productDetails = `Title: ${item.product_variant.variant_title || "N/A"}
                                    Category: ${item.category || "N/A"}
                                    Subcategory: ${item.subcategory || "N/A"}
                                    Price: $${item.product_variant.variant_price || "N/A"}
                                    Description: ${item.product_variant.variant_details || "N/A"}`;

            let productImage = "No image available";
            if (item.product_variant.variant_iamge) {
                try {
                    const fileName = new URL(item.product_variant.variant_iamge).pathname.split("/").pop();
                    const imageUrl = publicUrl + fileName;
                    productImage = await loadImage(imageUrl);
                } catch (err) {
                    console.error("Failed to load product image:", err);
                }
            }

            const addonDetails = [];
            if (item.addons) {
                for (const addon of Object.values(item.addons)) {
                    const addonText = `Addon Title: ${addon.addon_title || "N/A"}
                                        Addon Price: $${addon.addon_price || "N/A"}`;
                    // let addonImage = "No image available";
                    // if (addon.addon_image) {
                    //   try {
                    //     const fileName = new URL(addon.addon_image).pathname.split("/").pop();
                    //     const imageUrl = publicUrl + fileName;
                    //     addonImage = await loadImage(imageUrl);
                    //   } catch (err) {
                    //     console.error("Failed to load addon image:", err);
                    //   }
                    // }
                    addonDetails.push({ text: addonText }); //, image: addonImage
                }
            }

            const addonTextCombined = addonDetails.map((addon) => addon.text).join("\n\n");
            // const addonImages = addonDetails.map((addon) => addon.image).filter((img) => img !== "No image available");

            // Prepare row
            rows.push([
                productDetails,
                productImage !== "No image available"
                    ? { content: "", styles: { cellPadding: 5 }, image: productImage }
                    : "No image available",
                addonTextCombined,
            ]);

            // Add images for addons (compactly)
            // for (const addonImage of addonImages) {
            //   rows.push(["", "", { content: "", styles: { cellPadding: 5 }, image: addonImage }]);   //commented addon part
            // }
        }

        // Render table with images
        doc.autoTable({
            head: [headers],
            body: rows.map((row) =>
                row.map((cell) => {
                    if (cell.image) {
                        return {
                            content: "",
                            styles: { cellPadding: 5 },
                            image: cell.image,
                        };
                    }
                    return cell;
                })
            ),
            didDrawCell: (data) => {
                if (data.cell.raw && data.cell.raw.image) {
                    doc.addImage(data.cell.raw.image, "PNG", data.cell.x + 5, data.cell.y + 5, 20, 20);
                }
            },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 40 },
                2: { cellWidth: 70 },
            },
            startY: 10,
            margin: { top: 10 },
        });

        // Save the PDF
        doc.save("products_table.pdf");
    },
};

const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxWidth = 100; // Restrict image width for PDF
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = (err) => reject(err);
        img.src = url;
    });
};

export default PDFGenerator;
