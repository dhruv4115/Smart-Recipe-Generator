import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const RecipeSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};

export const RecipeListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeSkeleton key={i} />
      ))}
    </div>
  );
};
