import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";

function SuperadminSettings() {

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Fixed Header */}
      <SuperadminHeaders />
      {/* Spacer to prevent content from being hidden behind the fixed header */}
      <div className="h-4" />
    </div>
  );
}

export default withAuth(SuperadminSettings);