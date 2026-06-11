import { z } from 'zod'

export const itemSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(60, 'Brand name too long'),

  dept_code: z
    .string()
    .regex(/^\d{2}$/, 'Department must be a 2-digit code (e.g. 04)'),

  category_code: z
    .string()
    .regex(/^\d{4}$/, 'Category must be a 4-digit number (e.g. 1042)'),

  style_number: z
    .string()
    .regex(/^\d{6}$/, 'Style number must be exactly 6 digits'),

  price: z.string().regex(/^\d+\.99$/, 'Price must end in .99 (e.g. 49.99)'),

  markdown_price: z
    .string()
    .regex(/^\d+\.00$/, 'Markdown price must end in .00 (e.g. 39.00)')
    .optional()
    .or(z.literal('')),

  status: z.enum(['active', 'markdown', 'sold', 'archived']),

  notes: z.string().max(300, 'Notes too long').optional().or(z.literal('')),
})

// ── Refinement: markdown price required when status is markdown
export const itemSchemaWithRefinement = itemSchema.superRefine((data, ctx) => {
  if (data.status === 'markdown' && !data.markdown_price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Markdown price is required when status is Markdown',
      path: ['markdown_price'],
    })
  }

  if (
    data.status === 'markdown' &&
    data.markdown_price &&
    parseFloat(data.markdown_price) >= parseFloat(data.price)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Markdown price must be lower than original price',
      path: ['markdown_price'],
    })
  }
})
