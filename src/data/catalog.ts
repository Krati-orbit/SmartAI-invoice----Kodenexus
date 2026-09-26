export interface CatalogItem {
  service_id: string;
  category: 'Development' | 'Design' | 'Cloud' | 'Consulting' | 'Marketing' | 'Maintenance' | 'Security' | string;
  service_name: string;
  unit_price_inr: number;
  description: string;
  aliases?: string[];
}

export const CATALOG: CatalogItem[] = [
  {
    service_id: 'SRV001',
    category: 'Development',
    service_name: 'Full-stack Web App Module',
    unit_price_inr: 45000,
    description: 'Development of a production-ready web application module with frontend and backend integration.',
    aliases: ['web app', 'fullstack web', 'full stack web app', 'web application module', 'web platform', 'full-stack website']
  },
  {
    service_id: 'SRV002',
    category: 'Development',
    service_name: 'REST API Development',
    unit_price_inr: 18000,
    description: 'Design and development of RESTful APIs with authentication and database integration.',
    aliases: ['api development', 'rest api', 'backend api', 'api endpoints', 'restful api', 'api integration module']
  },
  {
    service_id: 'SRV003',
    category: 'Development',
    service_name: 'Mobile App Module',
    unit_price_inr: 35000,
    description: 'Development of a cross-platform mobile application module with API integration.',
    aliases: ['mobile app', 'flutter app', 'react native app', 'ios app', 'android app', 'cross-platform mobile module']
  },
  {
    service_id: 'SRV004',
    category: 'Development',
    service_name: 'Database Design & Setup',
    unit_price_inr: 15000,
    description: 'Database schema design, relationships, indexing, and initial configuration.',
    aliases: ['database design', 'db setup', 'schema design', 'sql setup', 'postgres setup', 'mongodb database setup']
  },
  {
    service_id: 'SRV005',
    category: 'Design',
    service_name: 'UI/UX Wireframing',
    unit_price_inr: 8000,
    description: 'Creation of low-fidelity wireframes and user flows for a digital product.',
    aliases: ['wireframing', 'wireframes', 'ux wireframing', 'low fidelity wireframes', 'user flows']
  },
  {
    service_id: 'SRV006',
    category: 'Design',
    service_name: 'UI/UX Design Package',
    unit_price_inr: 25000,
    description: 'Complete high-fidelity interface design for web or mobile screens.',
    aliases: ['ui ux design', 'figma design', 'ui design package', 'high fidelity design', 'interface design', 'app mockup']
  },
  {
    service_id: 'SRV007',
    category: 'Design',
    service_name: 'Brand Identity Design',
    unit_price_inr: 18000,
    description: 'Creation of a basic visual identity including logo, typography, and brand guidelines.',
    aliases: ['branding', 'logo design', 'brand identity', 'brand guidelines', 'visual identity']
  },
  {
    service_id: 'SRV008',
    category: 'Cloud',
    service_name: 'Cloud Setup & Deployment',
    unit_price_inr: 22000,
    description: 'Initial cloud infrastructure setup, application deployment, and environment configuration.',
    aliases: ['cloud setup', 'aws deployment', 'cloud deployment', 'devops setup', 'server configuration', 'infrastructure setup']
  },
  {
    service_id: 'SRV009',
    category: 'Cloud',
    service_name: 'Cloud Migration',
    unit_price_inr: 40000,
    description: 'Migration of an existing application and associated data to a cloud environment.',
    aliases: ['cloud migration', 'aws migration', 'cloud transfer', 'server migration', 'infrastructure migration']
  },
  {
    service_id: 'SRV010',
    category: 'Consulting',
    service_name: 'IT Consulting',
    unit_price_inr: 12000,
    description: 'Technical consultation covering architecture, technology selection, and implementation strategy.',
    aliases: ['it consulting', 'tech consultation', 'it advisory', 'tech review meeting', 'technical consulting']
  },
  {
    service_id: 'SRV011',
    category: 'Consulting',
    service_name: 'Software Architecture Review',
    unit_price_inr: 20000,
    description: 'Review of an existing software architecture with recommendations for scalability and reliability.',
    aliases: ['architecture review', 'codebase review', 'system audit', 'software review', 'scalability assessment']
  },
  {
    service_id: 'SRV012',
    category: 'Marketing',
    service_name: 'Digital Marketing Campaign',
    unit_price_inr: 30000,
    description: 'Planning and execution support for a digital marketing campaign across selected channels.',
    aliases: ['digital marketing', 'marketing campaign', 'social media campaign', 'ad campaign', 'performance marketing']
  },
  {
    service_id: 'SRV013',
    category: 'Marketing',
    service_name: 'SEO Optimization Package',
    unit_price_inr: 16000,
    description: 'On-page SEO improvements, technical SEO checks, and keyword optimization.',
    aliases: ['seo', 'seo optimization', 'search engine optimization', 'on-page seo', 'technical seo']
  },
  {
    service_id: 'SRV014',
    category: 'Maintenance',
    service_name: 'Website Maintenance',
    unit_price_inr: 10000,
    description: 'Monthly website maintenance including updates, monitoring, and minor fixes.',
    aliases: ['website maintenance', 'monthly maintenance', 'site maintenance', 'maintenance support', 'web updates']
  },
  {
    service_id: 'SRV015',
    category: 'Security',
    service_name: 'Security Assessment',
    unit_price_inr: 28000,
    description: 'Basic application security assessment covering common vulnerabilities and configuration issues.',
    aliases: ['security assessment', 'vulnerability audit', 'security audit', 'penetration testing', 'infosec review']
  }
];

// Helper for string token matching & fuzzy score
function cleanString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function matchServiceInCatalog(query: string): {
  matchedItem: CatalogItem | null;
  confidence: number;
} {
  if (!query || typeof query !== 'string') {
    return { matchedItem: null, confidence: 0 };
  }

  const cleanQuery = cleanString(query);
  if (!cleanQuery) return { matchedItem: null, confidence: 0 };

  // 1. Direct or Substring match on service_id
  for (const item of CATALOG) {
    if (cleanQuery.includes(cleanString(item.service_id))) {
      return { matchedItem: item, confidence: 1.0 };
    }
  }

  // 2. Exact match on service_name
  for (const item of CATALOG) {
    const cleanName = cleanString(item.service_name);
    if (cleanQuery === cleanName) {
      return { matchedItem: item, confidence: 1.0 };
    }
  }

  // 3. Exact match in aliases
  for (const item of CATALOG) {
    if (item.aliases) {
      for (const alias of item.aliases) {
        if (cleanQuery === cleanString(alias)) {
          return { matchedItem: item, confidence: 0.95 };
        }
      }
    }
  }

  // 4. Substring inclusion match
  for (const item of CATALOG) {
    const cleanName = cleanString(item.service_name);
    if (cleanQuery.includes(cleanName) || cleanName.includes(cleanQuery)) {
      return { matchedItem: item, confidence: 0.9 };
    }
    if (item.aliases) {
      for (const alias of item.aliases) {
        const cleanAlias = cleanString(alias);
        if (cleanQuery.includes(cleanAlias) || cleanAlias.includes(cleanQuery)) {
          return { matchedItem: item, confidence: 0.85 };
        }
      }
    }
  }

  // 5. Token overlap / Jaccard-like matching
  const queryTokens = new Set(cleanQuery.split(' ').filter(w => w.length > 2));
  let bestMatch: CatalogItem | null = null;
  let highestScore = 0;

  for (const item of CATALOG) {
    const itemTokens = cleanString(`${item.service_name} ${item.description} ${(item.aliases || []).join(' ')}`)
      .split(' ')
      .filter(w => w.length > 2);

    let matchCount = 0;
    for (const token of queryTokens) {
      if (itemTokens.includes(token)) {
        matchCount++;
      }
    }

    if (queryTokens.size > 0) {
      const score = matchCount / Math.max(queryTokens.size, 1);
      if (score > highestScore && score >= 0.4) {
        highestScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestMatch && highestScore >= 0.4) {
    return {
      matchedItem: bestMatch,
      confidence: Math.min(Number(highestScore.toFixed(2)), 0.8)
    };
  }

  return { matchedItem: null, confidence: 0 };
}
