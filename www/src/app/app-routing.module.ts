import { DownloadDocumentComponent } from './core/components/download-document/download-document.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from "./auth/app-auth.guard";
import { WelcomeComponent } from "./pages/welcome/welcome.component";

const routes: Routes = [
  { path: 'dashboard', canActivate: [AppAuthGuard], loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)},
  { path: 'requests', canActivate: [AppAuthGuard], loadChildren: () => import('./request/request.module').then(m => m.RequestModule)},
  { path: 'procedures', canActivate: [AppAuthGuard], loadChildren: () => import('./procedure/procedure.module').then(m => m.ProcedureModule)},
  { path: 'positions', canActivate: [AppAuthGuard], loadChildren: () => import('./positions/positions.module').then(m => m.PositionsModule)},
  { path: 'catalog', canActivate: [AppAuthGuard], loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule)},
  { path: 'cart', canActivate: [AppAuthGuard], loadChildren: () => import('./cart/cart.module').then(m => m.CartModule)},
  { path: 'contragents', canActivate: [AppAuthGuard], loadChildren: () => import('./contragent/contragent.module').then(m => m.ContragentModule)},
  { path: 'employees', canActivate: [AppAuthGuard], loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule)},
  { path: 'im', canActivate: [AppAuthGuard], loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule)},
  { path: 'notifications', canActivate: [AppAuthGuard], loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)},
  { path: 'kim', canActivate: [AppAuthGuard], loadChildren: () => import('./kim/kim.module').then(m => m.KimModule)},
  { path: 'agreements', canActivate: [AppAuthGuard], loadChildren: () => import('./agreements/agreements.module').then(m => m.AgreementsModule)},
  { path: 'contracts-sign', loadChildren: () => import('./contract-sign/contract-sign.module').then(m => m.ContractSignModule)},
  { path: 'document-download/:id/:filename', canActivate: [AppAuthGuard], component: DownloadDocumentComponent },
  { path: '', canActivate: [AppAuthGuard], component: WelcomeComponent, pathMatch: 'full' },
  { path: '', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)},
  { path: '**', redirectTo: '/not-found' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [AppAuthGuard]
})
export class AppRoutingModule {
}
