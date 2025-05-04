import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className=" py-8 flex flex-col gap-8">
    <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="w-full py-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" /> {/* Badge skeleton */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" /> {/* "Front" label skeleton */}
                <Skeleton className="h-16 w-full" /> {/* Front content skeleton */}
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" /> {/* "Back" label skeleton */}
                <Skeleton className="h-16 w-full" /> {/* Back content skeleton */}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Skeleton className="h-9 w-16" /> {/* Edit button skeleton */}
              <Skeleton className="h-9 w-16" /> {/* Delete button skeleton */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 