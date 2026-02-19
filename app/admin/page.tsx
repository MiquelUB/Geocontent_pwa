import { getLegends, getAllProfiles, getDefaultMunicipalityId } from "@/lib/actions";
import { getReports } from "@/lib/actions/reports";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const legends = await getLegends();
  const profiles = await getAllProfiles();
  const reports = await getReports();
  const municipalityId = await getDefaultMunicipalityId();

  return <AdminDashboard legends={legends || []} profiles={profiles || []} reports={reports || []} municipalityId={municipalityId} />;
}
