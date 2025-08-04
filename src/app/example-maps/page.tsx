import InteractiveSVGMapV3 from "@/component/InteractiveSVGMapV3";
import ListMaps from "@/component/list-maps/list-maps";

export default function Page() {
    return <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <main className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <ListMaps />    
        </main>
    </div>
}