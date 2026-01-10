import { getLegends, getAllProfiles } from "@/lib/actions";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const legends = await getLegends();
  const profiles = await getAllProfiles();

  return <AdminDashboard legends={legends || []} profiles={profiles || []} />;
}
