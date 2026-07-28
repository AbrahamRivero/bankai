"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import StarRating from "@/components/catalog/star-rating";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createReview, type ReviewResponse } from "@/lib/fetchers/reviews";
import { toast } from "@/lib/toast";

type ProductReviewsProps = {
  reviews: ReviewResponse[] | undefined;
  isLoading: boolean;
  productId: string;
  workspaceId: string;
};

function RatingProgress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-colors"
        >
          <Star
            className={`h-8 w-8 ${
              star <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ProductReviews({
  reviews,
  isLoading,
  productId,
  workspaceId,
}: ProductReviewsProps) {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("most-recent");

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!reviews) return dist;
    for (const r of reviews) {
      const rating = Math.round(r.rating);
      if (rating >= 1 && rating <= 5) dist[rating] = (dist[rating] || 0) + 1;
    }
    return dist;
  }, [reviews]);

  const totalRatings = useMemo(
    () => Object.values(distribution).reduce((a, b) => a + b, 0),
    [distribution],
  );

  const maxCount = useMemo(
    () => Math.max(...Object.values(distribution), 1),
    [distribution],
  );

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const lastMonthReviews = useMemo(() => {
    if (!reviews) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return reviews.filter((r) => new Date(r.createdAt) >= cutoff);
  }, [reviews]);

  const lastMonthAverage = useMemo(() => {
    if (lastMonthReviews.length === 0) return 0;
    return (
      lastMonthReviews.reduce((sum, r) => sum + r.rating, 0) /
      lastMonthReviews.length
    );
  }, [lastMonthReviews]);

  const featuredReview = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    return reviews.reduce((best, r) => (r.rating > best.rating ? r : best));
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    const sorted = [...reviews];
    switch (sortBy) {
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [reviews, sortBy]);

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast.error(t("pleaseSelectRating"));
      return;
    }
    if (!newComment.trim()) {
      toast.error(t("pleaseWriteReview"));
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview(productId, newRating, newComment.trim(), workspaceId);
      toast.success(t("reviewSubmitted"));
      setIsWriteOpen(false);
      setNewRating(0);
      setNewComment("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("failedToSubmitReview"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <Skeleton className="mx-auto mb-8 h-8 w-64" />
          <div className="grid gap-8 xl:grid-cols-12">
            <div className="space-y-3 xl:col-span-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-4" />
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-5 w-6" />
                </div>
              ))}
            </div>
            <div className="xl:col-span-8">
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
          <div className="mt-12 space-y-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h2 className="mb-8 text-center font-bold text-3xl sm:text-4xl">
            {t("customerReviews")}
          </h2>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-12 text-center">
            <Star className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground">
              {t("noReviewsYet")}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("noReviewsDescription")}
            </p>
            <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
              <DialogTrigger render={<Button />}>
                {t("writeReview")}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("writeReviewTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("writeReviewDescription")}
                  </DialogDescription>
                </DialogHeader>
                <ReviewFormContent
                  user={user}
                  rating={newRating}
                  onRatingChange={setNewRating}
                  comment={newComment}
                  onCommentChange={setNewComment}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmitReview}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-5 lg:px-6">
        <h2 className="mb-8 text-center font-bold text-3xl sm:text-4xl">
          {t("customerReviews") || "Customer Reviews & Rating"}
        </h2>

        <div className="mb-11 grid grid-cols-12">
          <div className="col-span-12 flex items-center xl:col-span-4">
            <div className="mx-auto flex w-full flex-col gap-y-3 max-xl:max-w-3xl">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <span className="mr-1 text-sm font-medium">{star}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="mx-3 flex-1">
                    <RatingProgress value={distribution[star]} max={maxCount} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {distribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 mt-8 w-full xl:col-span-8 xl:mt-0 xl:pl-8">
            <div className="grid h-full w-full grid-cols-12 rounded-2xl bg-muted px-6 py-8 max-xl:mx-auto max-xl:max-w-3xl md:px-8">
              <div className="col-span-12 flex items-center md:col-span-8">
                <div className="flex w-full flex-col items-center sm:flex-row sm:items-center">
                  <div className="flex flex-col items-center sm:border-r sm:border-border sm:pr-6">
                    <p className="mb-3 font-bold text-5xl text-foreground">
                      {averageRating.toFixed(1)}
                    </p>
                    <StarRating rating={Math.round(averageRating)} size="lg" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {totalRatings} {t("ratingsCount")}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col items-center sm:mt-0 sm:border-l sm:border-border sm:pl-6">
                    <p className="mb-3 font-bold text-5xl text-foreground">
                      {lastMonthAverage > 0 ? lastMonthAverage.toFixed(1) : "—"}
                    </p>
                    <StarRating
                      rating={Math.round(lastMonthAverage) || 0}
                      size="lg"
                    />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {t("lastMonth")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 mt-6 flex items-center md:col-span-4 md:mt-0 md:pl-6">
                <div className="flex w-full flex-col items-center gap-3">
                  <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
                    <DialogTrigger
                      render={
                        <Button className="w-full rounded-full sm:w-auto" />
                      }
                    >
                      {t("writeReview")}
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("writeReviewTitle")}</DialogTitle>
                        <DialogDescription>
                          {t("writeReviewDescription")}
                        </DialogDescription>
                      </DialogHeader>
                      <ReviewFormContent
                        user={user}
                        rating={newRating}
                        onRatingChange={setNewRating}
                        comment={newComment}
                        onCommentChange={setNewComment}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmitReview}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isSeeAllOpen} onOpenChange={setIsSeeAllOpen}>
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full rounded-full sm:w-auto"
                        />
                      }
                    >
                      {t("seeAllReviews")}
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t("allReviews")}</DialogTitle>
                        <DialogDescription>
                          {t("allReviewsDescription", { count: totalRatings })}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {sortedReviews.length === 0 && (
                          <p className="py-8 text-center text-sm text-muted-foreground">
                            {t("noReviewsToShow")}
                          </p>
                        )}
                        {sortedReviews.map((review) => (
                          <ReviewCard key={review.id} review={review} compact />
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        {featuredReview && (
          <>
            <div className="pb-8 max-xl:mx-auto max-xl:max-w-3xl">
              <h3 className="mb-6 font-semibold text-2xl">
                {t("mostHelpfulPositiveReview")}
              </h3>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <StarRating rating={featuredReview.rating} />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    @{featuredReview.user?.name ?? "anonymous"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(featuredReview.createdAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "2-digit", year: "numeric" },
                    )}
                  </span>
                </div>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">
                {featuredReview.comment}
              </p>
            </div>
            <Separator />
          </>
        )}

        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row max-xl:mx-auto max-xl:max-w-3xl">
          <p className="text-sm text-foreground">
            {t("reviewCount", { count: totalRatings })}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("sortByLabel")}
            </span>
            <Select
              value={sortBy}
              onValueChange={(value) => value && setSortBy(value)}
            >
              <SelectTrigger className="w-40 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-recent">{t("mostRecent")}</SelectItem>
                <SelectItem value="highest">{t("highestRated")}</SelectItem>
                <SelectItem value="lowest">{t("lowestRated")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-4 max-xl:mx-auto max-xl:max-w-3xl">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  compact = false,
}: {
  review: ReviewResponse;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/30">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!compact && (
            <Avatar className="h-7 w-7">
              <AvatarImage src={review.user?.image ?? ""} />
              <AvatarFallback className="text-[10px]">
                {(review.user?.name ?? "A").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-medium">
            {review.user?.name ?? "Anonymous"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </span>
      </div>
      <StarRating rating={review.rating} />
      <p
        className={`mt-2 leading-relaxed text-muted-foreground ${
          compact ? "line-clamp-2 text-sm" : "text-sm"
        }`}
      >
        {review.comment}
      </p>
    </div>
  );
}

function ReviewFormContent({
  user,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  isSubmitting,
  onSubmit,
}: {
  user: { id: string } | null | undefined;
  rating: number;
  onRatingChange: (v: number) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  const { t } = useTranslation("store");
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">{t("signInToReview")}</p>
        <Button nativeButton={false} render={<Link href="/auth/sign-in" />}>
          {t("signInAction")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="review-rating" className="text-sm font-medium">
          {t("ratingLabel")}
        </label>
        <div id="review-rating">
          <StarSelector value={rating} onChange={onRatingChange} />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-medium">
          {t("reviewLabel")}
        </label>
        <Textarea
          id="review-comment"
          placeholder={t("reviewPlaceholder")}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">{comment.length}/500</p>
      </div>
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || rating === 0 || !comment.trim()}
        className="w-full"
      >
        {isSubmitting ? t("submitting") : t("submitReview")}
      </Button>
    </div>
  );
}

export default ProductReviews;
