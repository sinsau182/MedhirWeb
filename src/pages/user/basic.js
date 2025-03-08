import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Loader from "@/components/Loader";

function BasicUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUserData({
        name: "John Doe",
        email: "john.doe@example.com",
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <header className="fixed top-0 left-0 right-0 w-full bg-white shadow px-10 py-4 flex justify-between items-center z-50">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <nav className="flex space-x-6 text-lg">
          <Button variant="ghost" asChild>
            <Link href="/user/basic">Basic</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/user/settings">Settings</Link>
          </Button>
        </nav>
        <Button
          onClick={() => {
            router.push("/login");
            localStorage.removeItem("token");
          }}
          className="bg-red-600 hover:bg-red-500 text-white"
        >
          Logout
        </Button>
      </header>

      <div className="h-16" />

      <main className="p-10 flex justify-center">
        {loading ? (
          <Loader />
        ) : (
          <Card className="w-full max-w-md bg-white shadow-lg p-6">
            <CardHeader className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">User Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <Input type="text" value={userData.name} readOnly className="mt-1 bg-gray-50 border" />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input type="email" value={userData.email} readOnly className="mt-1 bg-gray-50 border" />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default BasicUserPage;
