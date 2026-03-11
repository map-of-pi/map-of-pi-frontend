'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ReviewInt } from '@/constants/types';
import { OutlineBtn } from '@/components/shared/Forms/Buttons/Buttons';
import { getImageSrc } from '@/utils/image';

interface ReviewCardProps {
  review: ReviewInt;
  currentUserId?: string;
  userFallbackImage: string | null;
}

export function ReviewCard({ review, currentUserId, userFallbackImage }: ReviewCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const imgSrc = getImageSrc(review.image, userFallbackImage);

  return (
    <div className="seller_item_container mb-5">
      <div className="flex justify-between items-start mb-3">
        {/* Left: giver → receiver + comment */}
        <div className="flex-grow">
          <p className="text-primary text-sm">
            {review.giver}
            {' → '}
            <span className="text-primary text-sm">{review.receiver}</span>
          </p>
          <p className="text-md break-words">{review.heading}</p>
        </div>

        {/* Right: date/time + image + emoji */}
        <div className="flex flex-col items-end space-y-2">
          <div className="text-[#828282] text-sm text-right whitespace-nowrap">
            <p>{review.date}</p>
            <p>{review.time}</p>
          </div>
          <div className="flex gap-2 items-center">
            {imgSrc && (
              <Image
                src={imgSrc}
                alt="review image"
                width={50}
                height={50}
                className="object-cover rounded-md"
              />
            )}
            <p className="text-xl max-w-[50px]" title={review.reaction}>
              {review.unicode}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-2 w-full">
        {review.giverId === currentUserId && (
          <Link
            href={`/${locale}/seller/reviews/${review.reviewId}/edit?user_name=${encodeURIComponent(review.receiver)}`}
          >
            <OutlineBtn label={t('SHARED.EDIT')} />
          </Link>
        )}
        <Link
          href={`/${locale}/seller/reviews/feedback/${review.reviewId}?user_name=${encodeURIComponent(review.giver)}`}
        >
          <OutlineBtn label={t('SHARED.REPLY')} />
        </Link>
      </div>
    </div>
  );
}
