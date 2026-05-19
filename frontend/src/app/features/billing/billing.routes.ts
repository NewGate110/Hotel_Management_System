// Author: S2401265 Ahmed Aslan Ibrahim
import type { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./billing-home/billing-home.component').then((m) => m.BillingHomeComponent),
  },
];
