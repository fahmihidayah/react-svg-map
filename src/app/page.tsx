
import InteractiveSVGMapV2 from "@/component/InteractiveSVGMapV2";
import InteractiveSVGMap from "../component/InteractiveSVGMap";
import InteractiveSVGMapV3 from "@/component/InteractiveSVGMapV3";
import InteractiveSVGMapV4 from "@/component/InteractiveSVGMapV4";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <main className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold">Welcome to the Map App!</h1>
        <p className="mt-3 text-2xl">Explore the world with us.</p>
        <InteractiveSVGMapV3/>
        </main>
    </div>
  );
}
