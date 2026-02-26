import { getAdminLegends, getAllProfiles, getDefaultMunicipalityId } from "@/lib/actions";
import { getReports } from "@/lib/actions/reports";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const legends = await getAdminLegends();
  const profiles = await getAllProfiles();
  const reports = await getReports();
  const municipalityId = await getDefaultMunicipalityId();

  return <AdminDashboard legends={legends || []} profiles={profiles || []} reports={reports || []} municipalityId={municipalityId ?? undefined} />;
}
