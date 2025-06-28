import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const GlobalLoading = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header Skeleton */}
      <div className="h-16 bg-gray-100 animate-pulse" />
      
      {/* Main Content Skeleton */}
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-56 h-[calc(100vh-64px)] bg-white shadow-md">
          {/* Sidebar Toggle Button Skeleton */}
          <div className="absolute -right-4 top-3 z-50">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          </div>

          {/* Sidebar Menu Items Skeleton */}
          <nav className="flex-1 pt-4">
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="relative">
                  <div className="flex items-center px-4 py-3 gap-4">
                    {/* Icon Skeleton */}
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                    
                    {/* Text Skeleton */}
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                  </div>

                  {/* Submenu Items Skeleton (for Settings) */}
                  {item === 5 && (
                    <div className="pl-4 mt-1 space-y-2">
                      {[1, 2, 3, 4].map((subItem) => (
                        <div key={subItem} className="flex items-center px-4 py-2 gap-3">
                          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Content Area Skeleton */}
        <div className="flex-1 p-6">
          {/* Page Title Skeleton */}
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          
          {/* Content Blocks Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading; 