import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <Button
        onClick={() => router.back()}
        className="bg-blue-600 hover:bg-blue-500 text-white"
      >
        Go back
      </Button>

    </div>
  );
}