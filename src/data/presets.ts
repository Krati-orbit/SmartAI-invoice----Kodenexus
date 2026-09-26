import { PresetScenario } from '@/types/invoice';

export const SAMPLE_PRESETS: PresetScenario[] = [
  {
    id: 'preset-saas',
    title: 'FinTech Startup Web & Cloud Launch',
    tag: 'Dev + Cloud',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    clientName: 'Aarav Mehta (FinPulse Labs)',
    summary: 'Full-stack web module, cloud setup, API development, and website maintenance.',
    prompt: `Hi team,

This is Aarav Mehta from FinPulse Labs (aarav.mehta@finpulselabs.io). We are wrapping up our Series A round and need to kick off the next development sprint immediately.

Here is what we need on this invoice:
1. 1 Full-stack Web App Module for our core customer dashboard.
2. 2 REST API Development packages to integrate with banking gateways.
3. Cloud Setup & Deployment on AWS for staging and production.
4. Also please add 1 Website Maintenance package for next month.

Please send the invoice addressed to FinPulse Labs, 4th Floor Innov8 Hub, Koramangala, Bengaluru, Karnataka 560034. We need Net 15 payment terms and please apply standard 18% GST.

Thanks,
Aarav Mehta
Phone: +91 98765 43210`
  },
  {
    id: 'preset-design-branding',
    title: 'Brand Identity & Design Package',
    tag: 'Design & UX',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    clientName: 'Elena Rostova (Nova Luxe Retail)',
    summary: 'Brand identity design, wireframing, and full UI/UX design package.',
    prompt: `Hello!

We would like to formalize the design contract for our new luxury e-commerce brand Nova Luxe Retail.

Client details:
Elena Rostova
Head of Product, Nova Luxe Retail
Email: elena@novaluxe.co
Address: 120 Richmond Road, Mumbai 400001

Scope of work agreed:
- 1 Brand Identity Design (including brand book, logo system and color palette)
- 1 UI/UX Wireframing for mobile and web flows
- 1 UI/UX Design Package for 20 high-fidelity screens

Can you issue invoice #INV-2026-88 with due date set to 14 days from today?

Best regards,
Elena`
  },
  {
    id: 'preset-fallback-unmatched',
    title: 'Security Audit + Custom AI Model (Smart Fallback Test)',
    tag: 'Fallback Test ⚠',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    clientName: 'Vikramaditya Rao (Zenith Dynamics)',
    summary: 'Tests anti-hallucination & smart fallback flag with 1 catalog service + 1 custom unmatched service.',
    prompt: `Good day,

Vikramaditya Rao here from Zenith Dynamics (v.rao@zenithdynamics.com).

We require the following for our Q4 infrastructure compliance:
- 1 Security Assessment for our Kubernetes cluster
- 1 Software Architecture Review
- 1 Custom Fine-Tuned LLM Model Integration for customer support

Please generate our invoice with 18% GST. Bill to Zenith Dynamics, Sector 62, Noida, Uttar Pradesh.`
  },
  {
    id: 'preset-marketing-seo',
    title: 'SEO & Growth Marketing Campaign',
    tag: 'Growth Marketing',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    clientName: 'Priya Sharma (GreenRoot Organics)',
    summary: 'SEO optimization package, 2 digital marketing campaigns, and tech consulting.',
    prompt: `Hey guys,

Priya Sharma from GreenRoot Organics (priya@greenroot.in).

Let's proceed with the marketing agreement we discussed:
- 1 SEO Optimization Package
- 2 Digital Marketing Campaigns (one for Instagram/Meta ads, one for Google search)
- 1 IT Consulting session for analytics setup

Please invoice us with 18% GST. Due in 7 days please!

Thanks!
Priya`
  }
];
