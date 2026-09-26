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
  items: Array<{ title: string; quantity: number; notes?: string }>;
  taxRate: number;
  notes: string;
} {
  // Extract email
  const emailMatch = prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const clientEmail = emailMatch ? emailMatch[0] : 'client@example.com';

  // Extract phone
  const phoneMatch = prompt.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}|\+91[\s\d]{10,12}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Extract tax
  let taxRate = 18; // default standard GST
  const taxMatch = prompt.match(/(\d+)%\s*(?:gst|tax|vat)/i);
  if (taxMatch && taxMatch[1]) {
    taxRate = parseInt(taxMatch[1], 10);
  }

  // Extract client name
  let clientName = 'Valued Client';
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

  // Extract company
  let companyName = '';
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

  // Extract Address
  let address = '';
  const addressMatch = prompt.match(/(?:Address:?|addressed to|Bill to)\s*[:\s]*([^\n]+(?:,\s*[^\n]+){1,3})/i);
  if (addressMatch && addressMatch[1]) {
    address = addressMatch[1].trim();
  }

  // Extract Line Items
  const items: Array<{ title: string; quantity: number; notes?: string }> = [];
  const lines = prompt.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Pattern 1: Numbered or bullet list like "1. 2 REST API Development" or "- 1 Brand Identity Design"
    const listPattern = /^(?:[-*•]|\d+[\.\)])\s*(\d+)?\s*(?:x\s*)?([A-Za-z0-9\s/&-]+?)(?:\s*\((.*?)\)|\s*for\s*(.*?)|$)/i;
    const match = trimmed.match(listPattern);

    if (match) {
      const rawQty = match[1] ? parseInt(match[1], 10) : 1;
      let rawTitle = match[2].trim();
      const extraNotes = match[3] || match[4] || '';

      // Skip non-item headers
      if (
        rawTitle.toLowerCase().startsWith('client details') ||
        rawTitle.toLowerCase().startsWith('scope of work') ||
        rawTitle.toLowerCase().startsWith('thanks') ||
        rawTitle.length < 3
      ) {
        continue;
      }

      // Check for standalone quantity like "2 REST API Development"
      const qtyStart = rawTitle.match(/^(\d+)\s+(.+)$/);
      let qty = rawQty;
      if (qtyStart) {
        qty = parseInt(qtyStart[1], 10);
        rawTitle = qtyStart[2];
      }

      items.push({
        title: rawTitle,
        quantity: Math.max(qty, 1),
        notes: extraNotes.trim()
      });
    }
  }

  // If list didn't find enough items, check for inline sentence like "We need 1 X and 2 Y"
  if (items.length === 0) {
    const inlineSentence = prompt.match(/(?:need|require|order|want|add|purchase)\s+([^.]+)/i);
    if (inlineSentence && inlineSentence[1]) {
      const segments = inlineSentence[1].split(/(?:,|\band\b|;|\+)/i);
      for (const seg of segments) {
        const trimmedSeg = seg.trim();
        if (trimmedSeg.length > 3) {
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

    // Scan for known catalog items mentioned anywhere in text if still empty
    if (items.length === 0) {
      for (const catalogItem of CATALOG) {
        const regex = new RegExp(`(\\d+)?\\s*(?:x\\s*)?${catalogItem.service_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        const match = prompt.match(regex);
        if (match) {
          items.push({
            title: catalogItem.service_name,
            quantity: match[1] ? parseInt(match[1], 10) : 1
          });
        }
      }
    }
  }

  return {
    clientName,
    clientEmail,
    companyName: companyName || (clientName !== 'Valued Client' ? `${clientName}'s Company` : 'Client Organization'),
    address: address || 'Corporate Headquarters',
    phone,
    items,
    taxRate,
    notes: 'Payment terms: Net 15 days. Please make payment to designated corporate account.'
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

// Call Groq API if API key is provided
async function callGroq(prompt: string, apiKey: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
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
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
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
        steps.push('Dispatching prompt to Google Gemini API...');
        extractedData = await callGemini(prompt, geminiKey);
        engineUsed = 'Google Gemini 1.5 Flash';
        steps.push('Gemini extracted entities into structured JSON');
      } catch (err: any) {
        console.warn('Gemini extraction failed, falling back to rule engine:', err.message);
        steps.push(`Gemini fallback triggered: ${err.message}`);
      }
    } else if (groqKey && provider === 'groq') {
      try {
        steps.push('Dispatching prompt to Groq (Llama 3)...');
        extractedData = await callGroq(prompt, groqKey);
        engineUsed = 'Groq Llama 3';
        steps.push('Groq extracted structured entities');
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

    // Generate Invoice dates & numbers
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15);

    const invoiceNumber = `INV-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice: InvoiceData = {
      invoiceNumber,
      issueDate: today.toISOString().split('T')[0],
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
        name: 'Accounts Department',
        company: 'Kodnexus Technologies Pvt. Ltd.',
        email: 'billing@kodnexus.tech',
        phone: '+91 (080) 4123-8899',
        address: 'Tower B, Tech Innovation Park, Outer Ring Road, Bengaluru, KA 560103',
        gstin: '29ABCDE1234F1Z5'
      },
      items: invoiceItems,
      taxRate: extractedData.taxRate || 18,
      taxLabel: 'GST',
      discount: 0,
      notes: extractedData.notes || 'Thank you for your business! Please quote invoice number on bank transfers.',
      terms: 'Payment is due within 15 days of issue date. Standard 18% GST applicable.'
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
