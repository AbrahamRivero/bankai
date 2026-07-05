import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/page-title";
import { useWorkspaceWebSocket } from "@/hooks/use-workspace-websocket";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store",
)({
  component: StoreLayout,
});

function StoreLayout() {
  const { workspaceId } = Route.useParams();
  const { t } = useTranslation();

  useWorkspaceWebSocket(workspaceId);

  return (
    <>
      <PageTitle title={t("store:sidebar.title")} />
      <Outlet />
    </>
  );
}
