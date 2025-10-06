"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface RatingFormProps {
  animeId: number;
  existingRating?: {
    storyRating: number;
    artRating: number;
    charactersRating: number;
    soundRating: number;
  };
  onSubmit: (rating: any) => void;
}

export function RatingForm({ animeId, existingRating, onSubmit }: RatingFormProps) {
  const [ratings, setRatings] = useState({
    storyRating: existingRating?.storyRating || 0,
    artRating: existingRating?.artRating || 0,
    charactersRating: existingRating?.charactersRating || 0,
    soundRating: existingRating?.soundRating || 0,
  });

  const [loading, setLoading] = useState(false);

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const overallRating = (
      ratings.storyRating +
      ratings.artRating +
      ratings.charactersRating +
      ratings.soundRating
    ) / 4;

    const ratingData = {
      ...ratings,
      overallRating,
      animeId,
    };

    try {
      await onSubmit(ratingData);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: "storyRating" as const, label: "Сюжет" },
    { key: "artRating" as const, label: "Рисовка" },
    { key: "charactersRating" as const, label: "Персонажи" },
    { key: "soundRating" as const, label: "Звук" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {existingRating ? "Обновить оценку" : "Оценить аниме"}
        </CardTitle>
        <CardDescription>
          Оцените аниме по каждому критерию от 1 до 10
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {categories.map((category) => (
            <div key={category.key} className="space-y-2">
              <Label>{category.label}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingChange(category.key, value)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      ratings[category.key] >= value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        ratings[category.key] >= value ? "fill-current" : ""
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium">
                  {ratings[category.key]}/10
                </span>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Общая оценка:</span>
              <span className="text-lg font-bold">
                {((ratings.storyRating + ratings.artRating + ratings.charactersRating + ratings.soundRating) / 4).toFixed(1)}/10
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || Object.values(ratings).some(r => r === 0)}
            >
              {loading ? "Сохранение..." : existingRating ? "Обновить оценку" : "Добавить оценку"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
