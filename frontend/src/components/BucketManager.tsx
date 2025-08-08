import React, { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme } from '@/contexts/ThemeContext';

interface BucketManagerProps {
  currentBucket: string;
  onSelectBucket: (bucket: string) => void;
  fetchBuckets: () => Promise<string[]>;
}

export const BucketManager: React.FC<BucketManagerProps> = ({
  currentBucket,
  onSelectBucket,
  fetchBuckets,
}) => {
  const [open, setOpen] = useState(false);
  const [buckets, setBuckets] = useState<string[]>([]);
  const { theme } = useTheme();
  
  useEffect(() => {
    const loadBuckets = async () => {
      const bucketList = await fetchBuckets();
      setBuckets(bucketList);
    };
    
    loadBuckets();
  }, [fetchBuckets]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {currentBucket || "Select bucket..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search bucket..." />
          <CommandEmpty>No bucket found.</CommandEmpty>
          <CommandGroup>
            {buckets.map((bucket) => (
              <CommandItem
                key={bucket}
                onSelect={() => {
                  onSelectBucket(bucket);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentBucket === bucket ? "opacity-100" : "opacity-0"
                  )}
                />
                {bucket}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};