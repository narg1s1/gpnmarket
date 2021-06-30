import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegistrationComponent } from "./components/registration/registration.component";
import { AuthPageComponent } from "./components/auth-page/auth-page.component";
import { ForgotPasswordFormComponent } from "./components/forgot-password-form/forgot-password-form.component";
import { LoginFormComponent } from "./components/login-form/login-form.component";
import { ChangePasswordFormComponent } from "./components/change-password-form/change-password-form.component";
import { ActivationFormComponent } from "./components/activation-form/activation-form.component";
import { CanActivateFeatureGuard } from "../core/can-activate-feature.guard";
import { Routes } from "../core/models/routes";

const routes: Routes = [
  {
    path: 'auth',
    component: AuthPageComponent,
    data: { title: "Страница входа" },
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginFormComponent,
        data: { title: "Вход в систему", hideTitle: true, noContentPadding: true, hideBreadcrumbs: true }
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordFormComponent,
        data: { title: "Восстановление пароля", hideTitle: true, noContentPadding: true, hideBreadcrumbs: true }
      },
      {
        path: 'change-password',
        component: ChangePasswordFormComponent,
        data: { title: "Изменение пароля", hideTitle: true, noContentPadding: true, hideBreadcrumbs: true }
      }
    ]
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    canActivate: [ CanActivateFeatureGuard ],
    data: { title: "Регистрация", feature: 'registration', hideTitle: true }
  },
  {
    path: 'activate',
    component: AuthPageComponent,
    children: [{
      path: "",
      component: ActivationFormComponent,
      data: { hideTitle: true, noContentPadding: true, hideBreadcrumbs: true  }
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
