import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import CustomersTable from "@/components/store/customers-table";
import useGetWorkspaceMembers from "@/hooks/queries/workspace-users/use-get-workspace-members";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store/customers",
)({
  component: StoreCustomersPage,
});

function StoreCustomersPage() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const { data: members } = useGetWorkspaceMembers({ workspaceId });

  return (
    <>
      <PageTitle title={t("store:sidebar.customers")} />
      <WorkspaceLayout title={t("store:sidebar.customers")}>
        <CustomersTable workspaceId={workspaceId} users={members ?? []} />
      </WorkspaceLayout>
    </>
  );
}
