import { useAppSelector } from '@/app/store';
import { useAppDispatch } from '@/app/store';
import { setResolution, setQuality, setSpeed } from '@/app/store/slices/projectSlice';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Monitor, Gauge, Zap } from 'lucide-react';
export default function RenderOptions() {
    const { exportSettings } = useAppSelector(state => state.projectState);
    const dispatch = useAppDispatch();
    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="space-y-4">
                {/* Resolution Setting */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Resolution</Label>
                    </div>
                    <Select
                        value={exportSettings.resolution}
                        onValueChange={(value) => dispatch(setResolution(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="480p">
                                <div className="flex items-center justify-between w-full">
                                    <span>480p</span>
                                    <Badge variant="outline" className="ml-2 text-xs">Standard</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="720p">
                                <div className="flex items-center justify-between w-full">
                                    <span>720p</span>
                                    <Badge variant="outline" className="ml-2 text-xs">HD</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="1080p">
                                <div className="flex items-center justify-between w-full">
                                    <span>1080p</span>
                                    <Badge variant="outline" className="ml-2 text-xs">Full HD</Badge>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Higher resolution means better quality but larger file size</p>
                </div>

                <Separator />

                {/* Quality Setting */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Quality</Label>
                    </div>
                    <Select
                        value={exportSettings.quality}
                        onValueChange={(value) => dispatch(setQuality(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">
                                <div className="flex items-center justify-between w-full">
                                    <span>Low</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">Fastest</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="medium">
                                <div className="flex items-center justify-between w-full">
                                    <span>Medium</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">Balanced</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="high">
                                <div className="flex items-center justify-between w-full">
                                    <span>High</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">Better</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="ultra">
                                <div className="flex items-center justify-between w-full">
                                    <span>Ultra</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">Best</Badge>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Higher quality takes longer to process</p>
                </div>

                <Separator />

                {/* Processing Speed Setting */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Processing Speed</Label>
                    </div>
                    <Select
                        value={exportSettings.speed}
                        onValueChange={(value) => dispatch(setSpeed(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select speed" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fastest">Fastest</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="slow">Slow</SelectItem>
                            <SelectItem value="slowest">Slowest</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Slower speeds may produce better compression</p>
                </div>
            </div>
        </div>
    );
}