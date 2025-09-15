import { Separator } from "@/components/ui/separator";
import Ffmpeg from "../../render/Ffmpeg/Ffmpeg";
import RenderOptions from "../../render/Ffmpeg/RenderOptions";

export default function ExportList() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <RenderOptions />
      </div>
      <Separator />
      <Ffmpeg />
    </div>
  );
}
