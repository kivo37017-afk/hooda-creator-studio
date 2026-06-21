import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RouterPending } from "./components/RouterPending";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Mostra o splash da marca em vez de uma tela branca sempre que uma
    // rota tem beforeLoad/loader pendente (ex: verificação de sessão,
    // verificação de canal no onboarding).
    defaultPendingComponent: RouterPending,
    defaultPendingMs: 0,
    defaultPendingMinMs: 300,
  });

  return router;
};
