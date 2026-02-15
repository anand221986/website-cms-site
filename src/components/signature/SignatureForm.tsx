import { User, Building2, Palette, Type, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormSection from "./FormSection";
import { EmailSignature } from "@/types/signature";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
export interface SignatureData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  mobile: string;
  company: string;
  website: string;
  address: string;
  logoBase64:string;
}

interface SignatureFormProps {
  form: Partial<EmailSignature>;
  setForm: (form: Partial<EmailSignature>) => void;
  errors: Record<string, string>;
}

const SignatureForm = ({ form, setForm, errors }: SignatureFormProps) => {
  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.match(/image\/(png|jpeg|jpg|gif)/)) {
      toast.error("Only PNG, JPG, JPEG, GIF allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };
  const { getUserDetails } = useAuth();
  const userDetails = getUserDetails();
  const userId = userDetails?.userId;
  const subscribed = userDetails?.subscription;
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
     <h2 className="text-lg font-semibold text-center mb-6">
  3. Enter signature details
</h2>

{/* Default Signature Option */}
<div className="mb-6 flex items-center justify-between bg-muted/40 p-3 rounded-lg border">
  <label className="flex items-center gap-2 text-sm font-medium">
    <input
      type="checkbox"
      checked={form.is_default || false}
      onChange={(e) =>
        setForm({ ...form, is_default: e.target.checked })
      }
      className="accent-primary"
    />
    Set as Default Signature
  </label>

  {form.is_default && (
    <span className="text-xs text-green-600 font-medium">
      ⭐ This will be used automatically
    </span>
  )}
</div>

      <div className="space-y-4">
        {/* Personal Data */}
       
        <FormSection 
          title="Personal Data" 
          icon={<User className="w-4 h-4" />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First name</Label>
              <Input
                id="name"
                placeholder="John"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={form.lastName || ''}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Job title</Label>
              <Input
                id="designation"
                placeholder="Sales & Marketing Director"
                value={form.designation || ''}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@my-company.com"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                placeholder="(800) 555-0199"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile number</Label>
              <Input
                id="mobile"
                placeholder="(800) 555-0299"
                value={form.mobile || ''}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
          </div>
        </FormSection>

        {/* Company Data */}
        <FormSection 
          title="Company Data" 
          icon={<Building2 className="w-4 h-4" />}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                placeholder="My Company"
                value={form.company || ''}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://www.my-company.com"
                value={form.website || ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className={errors.website ? "border-destructive" : ""}
              />
              {errors.website && <p className="text-destructive text-xs">{errors.website}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street, City, Zip Code, Country"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </FormSection>

        {/* Graphics */}
       {subscribed === "pro" && (  <FormSection 
          title="Graphics" 
          icon={<ImageIcon className="w-4 h-4" />}
        > 
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Photo / Logo</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={(e) => handleLogoUpload(e.target.files?.[0])}
              />
              {form.logoBase64 && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={form.logoBase64}
                    className="h-16 w-16 rounded-lg border object-cover"
                    alt="Logo preview"
                  />
                  <button
                    onClick={() => setForm({ ...form, logoBase64: '' })}
                    className="text-sm text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Facebook URL"
                  value={form.socialLinks?.facebook || ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    socialLinks: { ...form.socialLinks, facebook: e.target.value }
                  })}
                />
                <Input
                  placeholder="Twitter URL"
                  value={form.socialLinks?.twitter || ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    socialLinks: { ...form.socialLinks, twitter: e.target.value }
                  })}
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={form.socialLinks?.linkedin || ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    socialLinks: { ...form.socialLinks, linkedin: e.target.value }
                  })}
                />
                <Input
                  placeholder="Instagram URL"
                  value={form.socialLinks?.instagram || ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    socialLinks: { ...form.socialLinks, instagram: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </FormSection>
        )}

        {/* Style */}
        <FormSection 
          title="Style" 
          icon={<Palette className="w-4 h-4" />}
        >
          <p className="text-sm text-muted-foreground">
            Style customization options coming soon. Select a template above to change the signature layout.
          </p>
        </FormSection>
      </div>
    </div>
  );
};

export default SignatureForm;
