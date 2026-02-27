import z from 'zod'

const productFormSchema = z
  .object({
    code: z.string().min(1, 'Mã sản phẩm không được để trống'),
    name: z.string().min(1, 'Tên sản phẩm không được để trống'),
    unit: z.string().min(1, 'Đơn vị không được để trống'),
    costPrice: z
      .number({ message: 'Giá vốn phải là một số' })
      .min(0, 'Giá vốn phải lớn hơn hoặc bằng 0'),
    sellPrice: z
      .number({ message: 'Giá bán phải là một số' })
      .min(0, 'Giá bán phải lớn hơn hoặc bằng 0'),
    alertLevel: z
      .number({ message: 'Mức cảnh báo phải là một số' })
      .min(0, 'Mức cảnh báo phải lớn hơn hoặc bằng 0'),
  })
  .refine((data) => data.sellPrice >= data.costPrice, {
    message: 'Giá bán phải lớn hơn hoặc bằng giá vốn',
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

export { productFormSchema }
