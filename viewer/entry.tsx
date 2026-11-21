import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from './.upstream/src/app/query-client'
import { AppIntlProvider } from './.upstream/src/i18n/provider'
import { ViewerShell } from './.upstream/src/modules/viewer/viewer-shell'
import { viewerSearchSchema } from './.upstream/src/modules/viewer/viewer-search'
import './.upstream/src/styles.css'

const root = createRootRoute({ component: Outlet })
const map = createRoute({
  getParentRoute: () => root,
  path: '/',
  validateSearch: viewerSearchSchema,
  component: ViewerShell,
})
const router = createRouter({
  routeTree: root.addChildren([map]),
  history: createMemoryHistory({ initialEntries: ['/' + location.search] }),
})

createRoot(document.getElementById('root')!).render(
  <AppIntlProvider>
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </AppIntlProvider>,
)
