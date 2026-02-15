export interface EmailSignature {
  id: number;
  is_default?: boolean;
  name: string;
  lastName: string;
  designation: string;
  company: string;
  phone: string;
  mobile: string;
  email: string;
  website: string;
  address: string;
  logoBase64?: string;
  logoUrl:string;
  templateId: string;
  customHTML?: string;
  platform?:string;
  
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface SignatureTemplate {
  id: string;
  name: string;
  preview: string;
  layout: 'horizontal' | 'vertical' | 'compact' | 'modern' | 'minimal';
}

export const SIGNATURE_TEMPLATES: SignatureTemplate[] = [
  { id: 'classic', name: 'Classic', preview: '📋', layout: 'horizontal' },
  { id: 'modern', name: 'Modern', preview: '✨', layout: 'modern' },
  { id: 'compact', name: 'Compact', preview: '📱', layout: 'compact' },
  { id: 'professional', name: 'Professional', preview: '💼', layout: 'vertical' },
  { id: 'minimal', name: 'Minimal', preview: '🎯', layout: 'minimal' },
];

export const INITIAL_SIGNATURE: Omit<EmailSignature, 'id'> = {
  name: '',
  lastName: '',
  designation: '',
  company: '',
  phone: '',
  mobile: '',
  email: '',
  website: '',
  address: '',
  logoBase64: '',
  logoUrl:'',
  templateId: 'classic',
  customHTML: '',
  socialLinks: {},
};


export interface TemplateConfig {
  id: string;
  name: string;
  accent: string;
  layout: "classic" | "modern" | "elegant" | "bold" | "minimal" | "creative";
}

export const TEMPLATES: TemplateConfig[] = [
  { id: "classic", name: "Classic", accent: "hsl(215,80%,50%)", layout: "classic" },
  { id: "modern", name: "Modern", accent: "hsl(160,60%,42%)", layout: "modern" },
  { id: "elegant", name: "Elegant", accent: "hsl(340,65%,50%)", layout: "elegant" },
  { id: "bold", name: "Bold", accent: "hsl(25,95%,55%)", layout: "bold" },
  { id: "minimal", name: "Minimal", accent: "hsl(220,15%,30%)", layout: "minimal" },
  { id: "creative", name: "Creative", accent: "hsl(270,60%,55%)", layout: "creative" },
];