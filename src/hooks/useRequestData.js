import useSWR from 'swr';

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export const useRequestData = (endpoint) => {
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}; 