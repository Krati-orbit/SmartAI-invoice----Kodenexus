import { NextRequest, NextResponse } from 'next/server';
import { CATALOG, matchServiceInCatalog } from '@/data/catalog';
import { InvoiceData, InvoiceItem } from '@/types/invoice';

// Fallback intelligent parser when no LLM key is configured or API limits hit
function parseWithRuleEngine(prompt: string): {
  clientName: string;
  clientEmail: string;
  companyName: string;
  address: string;
  phone: string;
  invoiceNumber?: string;
  issueDate?: string;
  senderName?: string;
  senderCompany?: string;
  senderEmail?: string;
  senderAddress?: string;
  items: Array<{ title: string; quantity: number; notes?: string }>;
  taxRate: number;
  notes: string;
  terms: string;
} {
  // Extract email
  const emailMatches = prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  let clientEmail = 'client@example.com';
  let senderEmail = 'billing@technovate.example';

  if (emailMatches && emailMatches.length > 0) {
    if (emailMatches.length === 1) {
      clientEmail = emailMatches[0];
    } else {
      senderEmail = emailMatches[0];
      clientEmail = emailMatches[1] || emailMatches[0];
    }
  }

  // Extract phone
  const phoneMatch = prompt.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}|\+91[\s\d]{10,12}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Extract tax rate
  let taxRate = 18; // default standard GST
  const taxMatch = prompt.match(/(?:gst|tax|vat)\s*(?:\(?\s*(\d+)%\s*\)?|:\s*(\d+)%)/i) || prompt.match(/(\d+)%\s*(?:gst|tax|vat)/i);
  if (taxMatch) {
    const rateVal = taxMatch[1] || taxMatch[2];
    if (rateVal) taxRate = parseInt(rateVal, 10);
  }

  // Extract Invoice Number (e.g., "Invoice No: INV-2026-0917")
  const invNumMatch = prompt.match(/Invoice\s*(?:No\.?|Number|#)\s*:?\s*([A-Za-z0-9-_]+)/i) ||
                      prompt.match(/\b(INV-[A-Za-z0-9-_]+)\b/i);
  let invoiceNumber = '';
  if (invNumMatch && invNumMatch[1] && invNumMatch[1].toLowerCase() !== 'invoice') {
    invoiceNumber = invNumMatch[1];
  }

  // Extract Date
  const dateMatch = prompt.match(/Date:\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[^\n]+)/i);
  let issueDate = '';
  if (dateMatch && dateMatch[1]) {
    const rawDate = dateMatch[1].trim();
    if (!rawDate.toLowerCase().includes('invoice') && rawDate.length < 25) {
      issueDate = rawDate;
    }
  }

  // Extract Bill To & Client Details
  let clientName = 'Valued Client';
  let companyName = '';
  let address = '';

  const billToMatch = prompt.match(/Bill\s*To:?\s*\n+([^\n]+)(?:\n+([^\n]+))?/i);
  if (billToMatch) {
    clientName = billToMatch[1].trim();
    companyName = billToMatch[1].trim();
    if (billToMatch[2] && !billToMatch[2].toLowerCase().includes('hey') && !billToMatch[2].toLowerCase().includes('thanks')) {
      address = billToMatch[2].trim();
    }
  } else {
    const namePatterns = [
      /(?:This is|I am|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|\(|,|\.)/i,
      /(?:Thanks|Regards|Best regards|Cheerio),\s*\n*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:Client details:?\s*\n*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+here from/i
    ];
    for (const pattern of namePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1] && !['Good', 'Hello', 'Hi', 'Please', 'We'].includes(match[1].trim())) {
        clientName = match[1].trim();
        break;
      }
    }

    const companyPatterns = [
      /(?:from|at)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s*\(|\s*,|\s*\.|\s+here|\s+Labs|\s+Retail|\s+Organics|\s+Dynamics|\s+Corp|\s+LLC|\s+Inc)/,
      /(?:addressed to|bill to)\s+([A-Z][A-Za-z0-9\s&]+?)(?:,|\.|\n)/i
    ];
    for (const pattern of companyPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1] && match[1].length < 40) {
        companyName = match[1].trim();
        break;
      }
    }

    const addressMatch = prompt.match(/(?:Address:?|addressed\s+to:?|Bill\s+to:?)\s*([^\n]+?(?:,\s*[^\n]+?){1,3})(?:\.|\n|$)/i);
    if (addressMatch && addressMatch[1]) {
      address = addressMatch[1].replace(/^(?:ed\s+to|to)\s+/i, '').trim();
    }
  }

  // Extract Sender Organization (e.g., TECHNOVATE SOLUTIONS, Agra)
  let senderCompany = 'SmartInvoice Technologies Pvt. Ltd.';
  let senderAddress = 'Tower B, Tech Innovation Park, Outer Ring Road, Bengaluru, KA 560103';

  const headerSenderMatch = prompt.match(/^\s*([A-Z\s]{4,35})\n+\s*([^\n]+)\n+\s*([^\n]+)/);
  if (headerSenderMatch && headerSenderMatch[1]) {
    const rawSender = headerSenderMatch[1].trim();
    if (!['INVOICE', 'BILL TO', 'HEY TEAM'].includes(rawSender.toUpperCase())) {
      senderCompany = rawSender
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      if (headerSenderMatch[3] && !headerSenderMatch[3].includes('Email:')) {
        senderAddress = `${headerSenderMatch[2].trim()}, ${headerSenderMatch[3].trim()}`;
      } else if (headerSenderMatch[2]) {
        senderAddress = headerSenderMatch[2].trim();
      }
    }
  }

  // Pre-process and normalize lines for line item extraction
  const rawLines = prompt.split('\n');
  const normalizedLines: string[] = [];
  let pendingLine = '';

  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (!trimmed) {
      if (pendingLine) {
        normalizedLines.push(pendingLine);
        pendingLine = '';
      }
      continue;
    }

    // STRICT: Filter out pure divider/decorative lines or lines without any alphabetic letters
    if (!/[a-zA-Z]/.test(trimmed)) continue;
    if (/^[-=_*.#~+]{2,}$/.test(trimmed)) continue;
    if (/^[-=_*.#~\s]+$/.test(trimmed)) continue;

    // Join wrapped lines with dot leaders or trailing price
    if (trimmed.includes('...') || /\.{2,}\s*[\d,]+/.test(trimmed)) {
      if (pendingLine) {
        normalizedLines.push(`${pendingLine} ${trimmed}`);
        pendingLine = '';
      } else {
        normalizedLines.push(trimmed);
      }
    } else {
      if (pendingLine) {
        normalizedLines.push(pendingLine);
      }
      pendingLine = trimmed;
    }
  }
  if (pendingLine) normalizedLines.push(pendingLine);

  const items: Array<{ title: string; quantity: number; notes?: string }> = [];

  for (const line of normalizedLines) {
    const lower = line.toLowerCase();

    // Ignore non-item lines, headers, footers, totals, greetings
    if (
      lower.startsWith('subtotal') ||
      lower.startsWith('total') ||
      lower.startsWith('gst') ||
      lower.startsWith('tax') ||
      lower.startsWith('invoice') ||
      lower.startsWith('date:') ||
      lower.startsWith('bill to') ||
      lower.startsWith('payment terms') ||
      lower.startsWith('bank transfer') ||
      lower.startsWith('thank you') ||
      lower.startsWith('thanks') ||
      lower.startsWith('hey') ||
      lower.startsWith('hi team') ||
      lower.startsWith('this is') ||
      lower.startsWith('below are the') ||
      lower.startsWith('here is what') ||
      lower.startsWith('software & digital') ||
      lower.startsWith('email:') ||
      lower.startsWith('phone:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('provided during') ||
      lower.startsWith('please send') ||
      lower.startsWith('technovate') ||
      lower.startsWith('agra,') ||
      lower.startsWith('brightpath') ||
      lower.startsWith('noida,')
    ) {
      continue;
    }

    // Pattern A: Numbered/bullet list (e.g. "1. 1 Full-stack...", "- 1 Brand...")
    const listMatch = line.match(/^(?:[-*•]|\d+[\.\)])\s*(\d+)?\s*(?:x\s*)?([A-Za-z0-9\s/&,.-]+?)(?:\s*\((.*?)\)|$)/i);
    const hasDotLeader = line.includes('..');

    if (listMatch) {
      const rawQty = listMatch[1] ? parseInt(listMatch[1], 10) : 1;
      let rawTitle = listMatch[2].trim();
      const extraNotes = listMatch[3] || '';

      if (
        rawTitle.toLowerCase().startsWith('client details') ||
        rawTitle.toLowerCase().startsWith('scope of work') ||
        rawTitle.length < 3
      ) {
        continue;
      }

      // Clean prefix filler
      rawTitle = rawTitle.replace(/^(?:also\s+please\s+add|please\s+add|also\s+add|add)\s+/i, '');

      // Standalone quantity check
      const qtyStart = rawTitle.match(/^(\d+)\s+(.+)$/);
      let qty = rawQty;
      if (qtyStart) {
        qty = parseInt(qtyStart[1], 10);
        rawTitle = qtyStart[2];
      }

      // Clean trailing notes/clauses
      rawTitle = rawTitle
        .replace(/\s+(?:for\s+our|to\s+integrate|for\s+next|on\s+aws).*$/i, '')
        .replace(/\s+(?:package|packages|modules?|services?)$/i, '')
        .trim();

      if (rawTitle.length > 2) {
        items.push({
          title: rawTitle,
          quantity: Math.max(qty, 1),
          notes: extraNotes.trim()
        });
      }
    } else if (hasDotLeader) {
      // Pattern B: Dot-leader invoice memo line
      let clean = line
        .replace(/^[-*•]\s+/, '')
        .replace(/^\d+[\.\)]\s+/, '')
        .replace(/\.{2,}.*$/, '')
        .replace(/[-_~]{3,}.*$/, '')
        .replace(/\s+[₹$€£]?\s*[\d,]+(?:\.\d{2})?\s*$/, '')
        .trim();

      clean = clean.replace(/^(?:we\s+also\s+completed|also\s+completed|completed|we\s+did|added|also\s+please\s+add)\s+/i, '');

      let qty = 1;
      const wordNums: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
      const wordQtyMatch = clean.match(/^(one|two|three|four|five|six)\s+(.+)$/i);
      const numQtyMatch = clean.match(/^(\d+)\s*(?:x\s*)?(.+)$/i);

      if (numQtyMatch) {
        qty = parseInt(numQtyMatch[1], 10);
        clean = numQtyMatch[2];
      } else if (wordQtyMatch) {
        qty = wordNums[wordQtyMatch[1].toLowerCase()] || 1;
        clean = wordQtyMatch[2];
      }

      const trailingQty = clean.match(/^(.+?)\s*-\s*(\d+)\s*(?:sessions|modules|packages|units)?$/i);
      if (trailingQty) {
        clean = trailingQty[1];
        qty = parseInt(trailingQty[2], 10);
      }

      if (clean.trim().length > 2) {
        items.push({ title: clean.trim(), quantity: qty });
      }
    }
  }

  // Fallback inline sentence scanner if items still empty
  if (items.length === 0) {
    const inlineSentence = prompt.match(/(?:need|require|order|want|add|purchase)\s+([^.]+)/i);
    if (inlineSentence && inlineSentence[1]) {
      const segments = inlineSentence[1].split(/(?:,|\band\b|;|\+)/i);
      for (const seg of segments) {
        const trimmedSeg = seg.trim();
        if (trimmedSeg.length > 3 && !trimmedSeg.toLowerCase().includes('gst')) {
          const qtyMatch = trimmedSeg.match(/^(\d+)\s+(.+)$/);
          if (qtyMatch) {
            items.push({
              title: qtyMatch[2].trim(),
              quantity: parseInt(qtyMatch[1], 10)
            });
          } else {
            items.push({
              title: trimmedSeg,
              quantity: 1
            });
          }
        }
      }
    }
  }

  // Payment terms
  let terms = 'Payment due within 15 days of invoice date.';
  const termsMatch = prompt.match(/Payment\s*(?:Terms:?|due:?)\s*([^\n.]+)/i);
  if (termsMatch && termsMatch[1]) {
    terms = termsMatch[1].trim();
  }

  return {
    clientName,
    clientEmail,
    companyName: companyName || (clientName !== 'Valued Client' ? `${clientName}'s Company` : 'Client Organization'),
    address: address || 'Corporate Headquarters',
    phone,
    invoiceNumber,
    issueDate,
    senderCompany,
    senderAddress,
    senderEmail,
    items,
    taxRate,
    notes: 'Thank you for your business! Bank transfer details will be shared separately.',
    terms
  };
}

// Call Google Gemini API if API key is provided
async function callGemini(prompt: string, apiKey: string) {
  const systemInstruction = `You are an AI Invoice Parser for an invoice automation tool.
Extract structured invoice information from messy client natural language requests.
Return ONLY valid JSON matching this schema:
{
  "clientName": string,
  "clientEmail": string,
  "companyName": string,
  "address": string,
  "phone": string,
  "invoiceNumber": string,
  "issueDate": string,
  "taxRate": number (e.g. 18 for 18% GST),
  "items": [
    {
      "title": string,
      "quantity": number,
      "description": string
    }
  ],
  "notes": string,
  "terms": string
}
Do not hallucinate prices. Do not output prices. Output only quantities and titles.`;

  const models = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nClient Input Request:\n${prompt}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini ${model} error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { data: JSON.parse(text), modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed');
}

// Call Groq API if API key is provided
async function callGroq(prompt: string, apiKey: string) {
  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI invoice extractor. Extract JSON with clientName, clientEmail, companyName, address, phone, taxRate, and items (title, quantity, description). Output strictly JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq ${model} error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return { data: JSON.parse(content), modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq model endpoints failed');
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const steps: string[] = [];

  try {
    const body = await req.json();
    const { prompt, customApiKey, provider } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Input prompt is required.' },
        { status: 400 }
      );
    }

    steps.push('Received raw client input text');

    // Determine API keys
    const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
    const groqKey = customApiKey || process.env.GROQ_API_KEY;

    let extractedData: any = null;
    let engineUsed = 'Local Smart NLP Engine';

    // 1. Attempt LLM extraction if key available
    if (geminiKey && (provider === 'gemini' || !provider)) {
      try {
        steps.push('Dispatching prompt to Google Gemini API (gemini-flash-latest)...');
        const result = await callGemini(prompt, geminiKey);
        extractedData = result.data;
        engineUsed = `Google Gemini Flash (${result.modelUsed})`;
        steps.push(`Gemini [${result.modelUsed}] extracted entities into structured JSON`);
      } catch (err: any) {
        console.warn('Gemini extraction failed, falling back to rule engine:', err.message);
        steps.push(`Gemini fallback triggered: ${err.message}`);
      }
    } else if (groqKey && provider === 'groq') {
      try {
        steps.push('Dispatching prompt to Groq Cloud API...');
        const result = await callGroq(prompt, groqKey);
        extractedData = result.data;
        engineUsed = `Groq Cloud (${result.modelUsed})`;
        steps.push(`Groq [${result.modelUsed}] extracted structured entities`);
      } catch (err: any) {
        console.warn('Groq extraction failed, falling back to rule engine:', err.message);
        steps.push(`Groq fallback triggered: ${err.message}`);
      }
    }

    // 2. Fallback to smart rule-based parser if LLM was skipped or failed
    if (!extractedData) {
      steps.push('Engaged Smart NLP Parser (Resilient offline extractor)');
      extractedData = parseWithRuleEngine(prompt);
      steps.push('Entities and line items extracted successfully');
    }

    // 3. Database Price Lookup & Anti-Hallucination Layer
    steps.push('Initiating Database Price Lookup against mock_data catalog...');
    const rawItems = Array.isArray(extractedData.items) ? extractedData.items : [];
    const invoiceItems: InvoiceItem[] = [];
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (let i = 0; i < rawItems.length; i++) {
      const raw = rawItems[i];
      const title = raw.title || raw.service_name || raw.name || 'Unspecified Item';
      const quantity = Math.max(parseInt(raw.quantity, 10) || 1, 1);

      // Perform anti-hallucination lookup against official catalog
      const { matchedItem, confidence } = matchServiceInCatalog(title);

      if (matchedItem) {
        matchedCount++;
        invoiceItems.push({
          id: `item-${i + 1}`,
          service_id: matchedItem.service_id,
          title: matchedItem.service_name,
          category: matchedItem.category,
          description: raw.description || matchedItem.description,
          quantity,
          unitPrice: matchedItem.unit_price_inr, // STRICT PRICING FROM CATALOG
          isUnmatched: false,
          matchConfidence: confidence,
          originalRequestedTitle: title !== matchedItem.service_name ? title : undefined
        });
        steps.push(`Matched "${title}" -> ${matchedItem.service_id} (${matchedItem.service_name}) at ₹${matchedItem.unit_price_inr.toLocaleString('en-IN')}`);
      } else {
        unmatchedCount++;
        invoiceItems.push({
          id: `item-${i + 1}`,
          title: title,
          category: 'Custom / Unmatched',
          description: raw.description || 'Custom requested service (Not found in catalog)',
          quantity,
          unitPrice: 0, // Flagged for human review
          isUnmatched: true,
          matchConfidence: 0,
          originalRequestedTitle: title
        });
        steps.push(`⚠️ Flagged unmatched service: "${title}" (Requires human review rate)`);
      }
    }

    // Generate or use extracted Invoice dates & numbers
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15);

    const invoiceNumber = extractedData.invoiceNumber || `INV-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = extractedData.issueDate || today.toISOString().split('T')[0];

    let finalTaxRate = extractedData.taxRate !== undefined && extractedData.taxRate !== null ? Number(extractedData.taxRate) : 18;
    if (finalTaxRate > 0 && finalTaxRate <= 1) {
      finalTaxRate = Math.round(finalTaxRate * 100);
    }
    if (isNaN(finalTaxRate) || finalTaxRate < 0) {
      finalTaxRate = 18;
    }

    const invoice: InvoiceData = {
      invoiceNumber,
      issueDate,
      dueDate: dueDate.toISOString().split('T')[0],
      currency: 'INR',
      currencySymbol: '₹',
      client: {
        name: extractedData.clientName || 'Valued Client',
        email: extractedData.clientEmail || 'client@example.com',
        company: extractedData.companyName || 'Client Organization',
        address: extractedData.address || 'Address provided upon request',
        phone: extractedData.phone || ''
      },
      sender: {
        name: extractedData.senderName || 'Finance & Accounts',
        company: extractedData.senderCompany || 'SmartInvoice Technologies Pvt. Ltd.',
        email: extractedData.senderEmail || 'billing@smartinvoice.ai',
        phone: '+91 (080) 4123-8899',
        address: extractedData.senderAddress || 'Tower B, Tech Innovation Park, Outer Ring Road, Bengaluru, KA 560103',
        gstin: '29ABCDE1234F1Z5'
      },
      items: invoiceItems,
      taxRate: finalTaxRate,
      taxLabel: 'GST',
      discount: 0,
      notes: extractedData.notes || 'Thank you for your business! Please quote invoice number on bank transfers.',
      terms: extractedData.terms || 'Payment is due within 15 days of issue date. Standard 18% GST applicable.'
    };

    steps.push(`Invoice generation complete. Engine: ${engineUsed}`);

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      invoice,
      rawJson: extractedData,
      steps,
      durationMs,
      matchedCount,
      unmatchedCount
    });
  } catch (error: any) {
    console.error('Extraction handler error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while parsing invoice.',
        steps
      },
      { status: 500 }
    );
  }
}
