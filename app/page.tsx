import SimHeader from '@/components/SimHeader';
import LeftRail from '@/components/LeftRail';
import MainCanvas from '@/components/MainCanvas';
import RightRail from '@/components/RightRail';

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#FAFAF7]">
      <SimHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftRail />
        <MainCanvas />
        <RightRail />
      </div>
    </div>
  );
}
