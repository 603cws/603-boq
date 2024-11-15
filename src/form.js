import React from 'react';
import './form.css';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from './supabase';

const ProductForm = () => {
  const categories = [
    'Furniture', 
    'Civil / Plumbing', 
    'Lighting', 
    'Electrical', 
    'Partitions- door / windows / ceilings',
    'Paint', 
    'HVAC', 
    'Smart Solutions', 
    'Flooring', 
    'Accessories'
  ];

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      details: '',
      price: '',
      image: null,
      category: '',
      addons: [{ image: null, title: '', price: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addons'
  });

  const onSubmit = async (data) => {
    console.log(data);
    const { data: ProductImage, error: ProductImageError } = await supabase.storage.from("addon").upload(`${data.title}-${data.details}`, data.image[0]);
    if (ProductImageError) {
      console.log(ProductImageError);
      return;
    }

    const { data: Product, error } = await supabase.from("products").insert({
      title: data.title,
      details: data.details,
      price: data.price,
      image: ProductImage.path,
      category: data.category,  // Added category field
    }).select().single();

    if (error) {
      console.log(error);
      return;
    }

    for (let addons in data.addons) {
      const adf = data.addons[addons];
      console.log(adf);
      const { data: AddonFile, error: AddonFileError } = await supabase.storage.from("addon").upload(`${Product.id}-${adf.title}`, adf.image[0]);
      if (AddonFileError) {
        console.error(AddonFileError);
        await supabase.from("products").delete().eq("id", Product.id);
        break;
      }
      const { error: AddonError } = await supabase.from("addons").insert({ title: adf.title, price: adf.price, image: AddonFile.path, productid: Product.id });
      if (AddonError) {
        console.error(AddonError);
        await supabase.from("products").delete().eq("id", Product.id);
        break;
      }
    }
  };

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div>
          <label>Category:</label>
          <select {...register('category', { required: 'Category is required' })}>
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p>{errors.category.message}</p>}
        </div>

        <label>Title:</label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p>{errors.title.message}</p>}
      </div>

      <div>
        <label>Details:</label>
        <textarea
          {...register('details', { required: 'Details are required' })}
        />
        {errors.details && <p>{errors.details.message}</p>}
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          {...register('price', { required: 'Price is required' })}
        />
        {errors.price && <p>{errors.price.message}</p>}
      </div>

      <div>
        <label>Image:</label>
        <input
          type="file"
          {...register(`image`, { required: 'Image is required' })}
        />
      </div>

      <div>
        <h3>Add-ons</h3>
        {fields.map((addon, index) => (
          <div key={addon.id}>
            <label>Image:</label>
            <input
              type="file"
              {...register(`addons.${index}.image`, { required: 'Image is required' })}
            />
            {errors.addons?.[index]?.image && <p>{errors.addons[index].image.message}</p>}

            <label>Title:</label>
            <input
              type="text"
              {...register(`addons.${index}.title`, { required: 'Addon title is required' })}
            />
            {errors.addons?.[index]?.title && <p>{errors.addons[index].title.message}</p>}

            <label>Price:</label>
            <input
              type="number"
              {...register(`addons.${index}.price`, { required: 'Addon price is required' })}
            />
            {errors.addons?.[index]?.price && <p>{errors.addons[index].price.message}</p>}

            <button type="button" onClick={() => remove(index)}>
              Remove Addon
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ image: null, title: '', price: '' })}
        >
          Add Addon
        </button>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default ProductForm;
