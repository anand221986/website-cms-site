// lib/sectionFormConfig.ts
export const SECTION_FORM_CONFIG: Record<
  string,
  { label: string; fields: Array<any> }
> = {
  hero: {
    label: "Hero Section",
    fields: [
      { name: "hero_image", label: "Hero Image URL", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "ctaPrimary", label: "Primary CTA", type: "text" },
      { name: "ctaSecondary", label: "Secondary CTA", type: "text" },
      { name: "badges", label: "Badges", type: "badges" },
    ],
  },

  stats: {
    label: "Stats Section",
    fields: [
      { name: "stats_title", label: "Title", type: "text" },
      { name: "stats_items", label: "Items (JSON)", type: "json" },
    ],
  },

  journey: {
    label: "Journey Section",
    fields: [
      { name: "timeline", label: "Timeline (JSON)", type: "json" },
    ],
  },
leftImageRightContent: {
    label: "Left Image Right Content",
    fields: [
        {
    name: "image",
      label: "Image",
      type: "image",
      },
     {
      name: "content",
      label: "Content",
      type: "quill",
    },
    
    ],
  },

  rightImageLeftContent: {
    label: "Right Image Left Content",
    fields: [
     {
          name: "image",
      label: "Image",
      type: "image",
      },
      {
        
       name: "content",
      label: "Content",
      type: "quill",
      },
      
    ],
  }, slider: {
    label: "Image Slider",
    fields: [
      {
        name: "images",
        label: "Slider Images",
        type: "image",
        multiple: true, // 🔥 key flag
      },
      {
        name: "caption",
        label: "Caption",
        type: "text",
      },
      {
      name: "cta",
      label: "CTA Buttons",
      type: "cta", // 🔥 NEW
    },
    ],
  },
 

  // Add other sections as needed
};
