import Link from "next/link";

export default function Navbar() {
  const navItems = ["Basic", "ID Proofs", "Salary", "Bank Details", "Leaves Policy"];

  return (
    <nav className="w-[60%] bg-black p-2 rounded-md border border-gray-500 flex justify-around shadow-lg mx-auto">
      {navItems.map((item) => (
        <Link key={item} href={`/hradmin/${item.toLowerCase()}`} className="text-white text-sm font-medium">
          {item}
        </Link>
      ))}
    </nav>
  );
}
