import { Button } from "@lro-ui/button";
import { Modal, ModalContent } from "@lro-ui/modal";
import type { GetImagesResponse } from "@repo/civit-api-client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Fragment, useMemo } from "react";
import { cn } from "../../../../design-system/utils/src";

type Image = GetImagesResponse["items"][0];

export default function ImageViewModal({
  image,
  isOpen,
  onOpenChange,
}: {
  image?: Image;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const meta = useMemo(() => {
    let m = undefined as Record<string, string> | undefined;
    if (image?.meta) {
      m = {};
      for (const [key, value] of Object.entries(image.meta)) {
        if (typeof value === "string") {
          m[key] = value;
        } else if (typeof value === "number") {
          m[key] = value.toString();
        } else if (typeof value === "boolean") {
          m[key] = value.toString();
        } else {
          m[key] = JSON.stringify(value);
        }
      }
    }
    return m;
  }, [image]);
  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="min-w-[90vw] min-h-[98vh] h-[98vh]">
        {image ? (
          <div className="flex max-h-full min-h-full h-full pr-4 pt-4">
            <div className="max-h-full grow">
              <img className="mx-auto max-h-full max-w-full object-contain" src={image.url} alt="" />
            </div>
            <div className="w-[25%] overflow-auto">
              <Button asChild variant="text">
                <div className="flex items-center gap-2">
                  <ExternalLink />
                  <Link href={`https://civitai.com/images/${image.id}`} target="_blank">
                    Open on Civit
                  </Link>
                </div>
              </Button>
              <DescriptionList>
                {image.baseModel && (
                  <>
                    <DescriptionTerm>Base Model</DescriptionTerm>
                    <DescriptionDetails>{image.baseModel}</DescriptionDetails>
                  </>
                )}
                {meta &&
                  Object.entries(meta).map(([key, value]) => (
                    <Fragment key={key}>
                      <DescriptionTerm>{key}</DescriptionTerm>
                      <DescriptionDetails>{value}</DescriptionDetails>
                    </Fragment>
                  ))}
              </DescriptionList>
            </div>
          </div>
        ) : (
          <p>No image selected</p>
        )}
      </ModalContent>
    </Modal>
  );
}

function DescriptionList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dl className={cn(className)}>{children}</dl>;
}

function DescriptionTerm({ children }: { children: React.ReactNode }) {
  return <dt className="text-muted-foreground uppercase tracking-wide font-medium text-xs pt-2">{children}</dt>;
}

function DescriptionDetails({ children }: { children: React.ReactNode }) {
  return <dd className="not-last:border-b pb-2 pt-2 wrap-anywhere">{children}</dd>;
}
