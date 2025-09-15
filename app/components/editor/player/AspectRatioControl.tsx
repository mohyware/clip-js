import { useAppSelector, useAppDispatch } from '@/app/store';
import { setAspectRatio } from '../../../store/slices/projectSlice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Smartphone, Square, Film, Tv } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const aspectRatios = [
  { 
    value: '16:9', 
    label: '16:9 (Landscape)', 
    width: 1920, 
    height: 1080, 
    icon: Monitor,
    description: 'Standard HD, YouTube, TV'
  },
  { 
    value: '4:3', 
    label: '4:3 (Standard)', 
    width: 1440, 
    height: 1080, 
    icon: Tv,
    description: 'Classic TV, Presentations'
  },
  { 
    value: '1:1', 
    label: '1:1 (Square)', 
    width: 1080, 
    height: 1080, 
    icon: Square,
    description: 'Instagram Post, Profile'
  },
  { 
    value: '9:16', 
    label: '9:16 (Portrait)', 
    width: 1080, 
    height: 1920, 
    icon: Smartphone,
    description: 'TikTok, Stories, Reels'
  },
  { 
    value: '21:9', 
    label: '21:9 (Ultrawide)', 
    width: 2560, 
    height: 1080, 
    icon: Film,
    description: 'Cinematic, Ultrawide'
  },
];

interface AspectRatioControlProps {
  onDimensionChange?: (width: number, height: number) => void;
}

export default function AspectRatioControl({ onDimensionChange }: AspectRatioControlProps) {
  const { aspectRatio, resolution } = useAppSelector((state) => state.projectState);
  const dispatch = useAppDispatch();

  const handleAspectRatioChange = (value: string) => {
    const selectedRatio = aspectRatios.find(ratio => ratio.value === value);
    if (selectedRatio) {
      dispatch(setAspectRatio(value));
      // Call the callback to update parent component's width/height state
      if (onDimensionChange) {
        onDimensionChange(selectedRatio.width, selectedRatio.height);
      }
    }
  };

  const currentRatio = aspectRatios.find(ratio => ratio.value === aspectRatio);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {aspectRatios.map((ratio) => {
              const IconComponent = ratio.icon;
              return (
                <SelectItem key={ratio.value} value={ratio.value} className="text-xs">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-3 w-3" />
                    <div className="flex flex-col">
                      <span className="font-medium">{ratio.label}</span>
                      <span className="text-muted-foreground text-xs">{ratio.description}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-4 w-px bg-border"></div>
      
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs font-mono">
          {currentRatio ? `${currentRatio.width} × ${currentRatio.height}` : `${resolution.width} × ${resolution.height}`}
        </Badge>
        <Badge variant="outline" className="text-xs">
          30fps
        </Badge>
      </div>
    </div>
  );
}
