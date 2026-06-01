import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
});

export const invoiceInputSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  issueDate: z.string().min(1),
  dueDate: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  vatEnabled: z.boolean().default(true),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one line item'),
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
