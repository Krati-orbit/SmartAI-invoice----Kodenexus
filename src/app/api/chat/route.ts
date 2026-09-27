import { NextRequest, NextResponse } from 'next/server';
import { InvoiceData } from '@/types/invoice';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback intelligent responder when Gemini API key is missing or quota is exceeded
function generateContextualFallbackReply(question: string, invoice: InvoiceData): string {
  const q = question.toLowerCase();
  const subtotal = invoice.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const discount = Math.min(invoice.discount || 0, subtotal);
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);
  const sym = invoice.currencySymbol || '₹';

  // 1. Tax / GST queries
  if (q.includes('tax') || q.includes('gst') || q.includes('vat')) {
    return `### 🧾 Tax Breakdown for ${invoice.invoiceNumber}
- **Tax Type:** ${invoice.taxLabel || 'GST'}
- **Applied Rate:** **${invoice.taxRate}%**
- **Tax Amount:** **${sym}${taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}**
- **Taxable Subtotal:** ${sym}${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}

The tax is calculated as \`(${invoice.taxRate}% of Subtotal)\` before any discounts.`;
  }

  // 2. Total / Grand Total / Subtotal
  if (q.includes('total') || q.includes('amount') || q.includes('how much') || q.includes('price')) {
    return `### 💰 Invoice Summary for ${invoice.invoiceNumber}
- **Subtotal (${invoice.items.length} items):** ${sym}${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
- **Discount Applied:** -${sym}${discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
- **${invoice.taxLabel || 'GST'} (${invoice.taxRate}%):** +${sym}${taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
- **Grand Total Payable:** **${sym}${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${invoice.currency}**`;
  }

  // 3. Due Date / Dates / When to pay
  if (q.includes('due') || q.includes('date') || q.includes('when') || q.includes('deadline')) {
    return `### 📅 Invoice Schedule
- **Invoice Number:** ${invoice.invoiceNumber}
- **Issue Date:** ${invoice.issueDate}
- **Payment Due Date:** **${invoice.dueDate}**
- **Payment Terms:** ${invoice.terms || 'Net 15 Days'}`;
  }

  // 4. Draft client email
  if (q.includes('draft') || q.includes('email') || q.includes('message') || q.includes('write')) {
    return `### ✉️ Draft Client Email

**Subject:** Invoice ${invoice.invoiceNumber} from ${invoice.sender?.company || 'SmartInvoice Technologies'}

Dear ${invoice.client?.name || 'Client'},

I hope this email finds you well.

Please find attached the official invoice **${invoice.invoiceNumber}** for the services rendered.

**Invoice Details:**
- **Amount Due:** ${sym}${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${invoice.currency}
- **Due Date:** ${invoice.dueDate}
- **Items:** ${invoice.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}

Please transfer the balance to our designated bank account as detailed in the invoice document.

Thank you for your business!

Best regards,  
**${invoice.sender?.name || 'Finance Team'}**  
${invoice.sender?.company || 'SmartInvoice Technologies Pvt. Ltd.'}`;
  }

  // 5. Line items / services / catalog verification
  if (q.includes('item') || q.includes('service') || q.includes('catalog') || q.includes('hallucination') || q.includes('rate')) {
    const itemsList = invoice.items
      .map(
        (it, idx) =>
          `${idx + 1}. **${it.title}** (x${it.quantity}) — ${sym}${(it.unitPrice * it.quantity).toLocaleString('en-IN')} ${
            it.isUnmatched ? '⚠️ *Custom Bespoke Rate*' : `✓ *Verified Catalog Rate (${it.service_id})*`
          }`
      )
      .join('\n');

    return `### 📦 Line Items Breakdown (${invoice.items.length} Services)
${itemsList}

**Anti-Hallucination Status:**
${
  invoice.items.every(i => !i.isUnmatched)
    ? '✅ **100% Verified:** All line items strictly match official benchmark catalog rates.'
    : '⚠️ **Custom Flag:** Some items were not found in the standard catalog and have been flagged for manual rate review.'
}`;
  }

  // 6. Client / Recipient
  if (q.includes('client') || q.includes('who') || q.includes('customer') || q.includes('bill to')) {
    return `### 👤 Billed Customer Details
- **Contact:** ${invoice.client?.name || 'Not specified'}
- **Company:** ${invoice.client?.company || 'N/A'}
- **Email:** ${invoice.client?.email || 'N/A'}
- **Address:** ${invoice.client?.address || 'N/A'}
- **Phone:** ${invoice.client?.phone || 'N/A'}`;
  }

  // Default helpful overview
  return `### 🤖 Invoice Overview: ${invoice.invoiceNumber}
- **Customer:** ${invoice.client?.name} (${invoice.client?.company || 'N/A'})
- **Total Amount:** **${sym}${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${invoice.currency}**
- **Due Date:** ${invoice.dueDate} (${invoice.terms || 'Net 15'})
- **Line Items:** ${invoice.items.length} items billed

You can ask me to:
- *"Draft an email to the client"*
- *"Explain the GST calculation"*
- *"List all line items and verification status"*
- *"What if we offer a 10% discount?"*`;
}

// Call Google Gemini API
async function callGeminiChat(
  messages: ChatMessage[],
  invoice: InvoiceData,
  apiKey: string
): Promise<string> {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const discount = Math.min(invoice.discount || 0, subtotal);
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);
  const sym = invoice.currencySymbol || '₹';

  const systemPrompt = `You are "SmartInvoice AI Assistant", an expert AI finance and billing co-pilot embedded inside the SmartInvoice AI enterprise platform.
You have direct, real-time access to the user's currently active invoice.

CURRENT INVOICE CONTEXT:
- Invoice Number: ${invoice.invoiceNumber}
- Issue Date: ${invoice.issueDate}
- Due Date: ${invoice.dueDate}
- Currency: ${invoice.currency} (${sym})
- Client: ${invoice.client?.name} | Organization: ${invoice.client?.company || 'N/A'} | Email: ${invoice.client?.email} | Address: ${invoice.client?.address || 'N/A'}
- Vendor / Sender: ${invoice.sender?.company} | Email: ${invoice.sender?.email} | GSTIN: ${invoice.sender?.gstin}
- Line Items:
${invoice.items.map((it, idx) => `  ${idx + 1}. [${it.service_id || 'CUSTOM'}] ${it.title} | Qty: ${it.quantity} | Unit Price: ${sym}${it.unitPrice} | Total: ${sym}${it.quantity * it.unitPrice} | Verified: ${!it.isUnmatched}`).join('\n')}
- Subtotal: ${sym}${subtotal.toLocaleString('en-IN')}
- Discount: ${sym}${discount.toLocaleString('en-IN')}
- Tax: ${invoice.taxLabel || 'GST'} @ ${invoice.taxRate}% = ${sym}${taxAmount.toLocaleString('en-IN')}
- Grand Total: ${sym}${grandTotal.toLocaleString('en-IN')} ${invoice.currency}
- Payment Terms: ${invoice.terms || 'Payment due within 15 days of issue date.'}
- Notes: ${invoice.notes || 'None'}

INSTRUCTIONS:
1. Answer the user's questions clearly, concisely, and professionally using markdown with bullet points, bold numbers, and clean headers.
2. If asked to draft an email or message, provide a polished, ready-to-copy email template with subject and body.
3. If asked about taxes, discounts, or calculations, show the exact math step-by-step.
4. Maintain a helpful, courteous, and authoritative tone as an enterprise invoice co-pilot.`;

  const models = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  // Convert conversation messages to Gemini contents format
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nHello, I need assistance with this invoice.` }]
    },
    {
      role: 'model',
      parts: [{ text: `Hello! I am your SmartInvoice AI Assistant. I have loaded invoice **${invoice.invoiceNumber}** for **${invoice.client?.name || 'your client'}** (Total: **${sym}${grandTotal.toLocaleString('en-IN')}**). How can I assist you with this invoice today?` }]
    }
  ];

  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini ${model} HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return reply;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, invoice, customApiKey } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice context is required.' },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const geminiKey = customApiKey || process.env.GEMINI_API_KEY;

    // Try Gemini first if key available
    if (geminiKey) {
      try {
        const reply = await callGeminiChat(messages, invoice, geminiKey);
        return NextResponse.json({
          success: true,
          reply,
          engine: 'Google Gemini Flash'
        });
      } catch (err: any) {
        console.warn('Gemini chat failed, using intelligent context fallback:', err.message);
      }
    }

    // Contextual fallback response
    const fallbackReply = generateContextualFallbackReply(latestUserMessage, invoice);
    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      engine: 'Built-in Smart Assistant'
    });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
