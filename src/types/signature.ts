export interface EmailSignature {
  id: number;
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
