// components/SectionMetaRenderer.tsx
import HeroMetaForm from "./sections/HeroMetaForm";
import StatsMetaForm from "./sections/StatsMetaForm";
import JourneyMetaForm from "./sections/JourneyMetaForm";

export default function SectionMetaRenderer({
  sectionKey,
  meta,
  setMeta,
}: {
  sectionKey: string;
  meta: any;
  setMeta: (meta: any) => void;
}) {
  switch (sectionKey) {
    case "hero":
      return <HeroMetaForm meta={meta} setMeta={setMeta} />;

    case "stats":
      return <StatsMetaForm meta={meta} setMeta={setMeta} />;

    case "journey":
      return <JourneyMetaForm meta={meta} setMeta={setMeta} />;

    default:
      return <p className="text-gray-500">No form available</p>;
  }
}
