"use client";

import { Button } from "@lro-ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@lro-ui/input";
import { createCivitClient, type GetImagesResponse } from "@repo/civit-api-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ImageViewModal from "../../../@components/image-view-modal";
import { getQueryClient } from "../../../@lib/get-tanstack-query-client";

type Image = GetImagesResponse["items"][0];

const sortOptions = ["Most Reactions", "Most Comments", "Newest"] as const;
type SortChoices = (typeof sortOptions)[number];

const periodOptions = ["All Time", "Year", "Month", "Week", "Day"] as const;
type PeriodChoices = (typeof periodOptions)[number];

const nsfwOptions = ["None", "Soft", "Mature", "X"] as const;
type NsfwChoices = (typeof nsfwOptions)[number];

export function ImageResults() {
  const [sort, setSort] = useState<SortChoices>("Most Reactions");
  const [period, setPeriod] = useState<PeriodChoices>("Day");
  const [nsfw, setNsfw] = useState<NsfwChoices>("None");

  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image>();

  const { data: images, isLoading } = useQuery({
    queryKey: ["civit", "images", sort, period, nsfw],
    queryFn: () => {
      const client = createCivitClient("https://civitai.com/");
      return client.getImages({
        limit: 20,
        sort,
        period,
        nsfw,
      });
    },
    throwOnError: true,
  });
  const onRefresh = () => {
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({
      queryKey: ["civit", "images"],
    });
  };
  const onImageClick = (image: Image) => {
    setSelectedImage(image);
    setOpenImageModal(true);
  };

  return (
    <>
      <ImageViewModal image={selectedImage} isOpen={openImageModal} onOpenChange={setOpenImageModal} />
      <div className="mb-4 flex items-center gap-4">
        <SelectFilter label="Sort by" value={sort} choices={sortOptions} onValueChange={setSort} />
        <SelectFilter label="Period" value={period} choices={periodOptions} onValueChange={setPeriod} />
        <SelectFilter label="Nsfw" value={nsfw} choices={nsfwOptions} onValueChange={setNsfw} />
        <Button onClick={onRefresh}>Refresh</Button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {images?.items.map((image) => (
            <ImageItem key={image.id} image={image} onClick={onImageClick} />
          ))}
        </div>
      )}
    </>
  );
}

function SelectFilter<T extends string>({
  label,
  choices,
  value,
  onValueChange,
}: {
  label: string;
  choices: readonly T[];
  value: T;
  onValueChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="whitespace-nowrap">{label}</div>
      <Select value={value} onValueChange={(v) => onValueChange(v as T)}>
        <SelectTrigger className="max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice) => (
            <SelectItem key={choice} value={choice}>
              {choice}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ImageItem({ image, onClick }: { image: Image; onClick: (image: Image) => void }) {
  return (
    <div className="max-w-80 aspect-[7/9] cursor-pointer">
      <Button className="bg-transparent hover:bg-transparent" asChild onClick={() => onClick(image)}>
        <img src={image.url} alt={image.url} className="w-full h-full object-contain" />
      </Button>
    </div>
  );
}
