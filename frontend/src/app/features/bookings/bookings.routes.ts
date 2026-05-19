// Author: S2401265 Ahmed Aslan Ibrahim
import type { Routes } from '@angular/router';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./bookings-list/bookings-list.component').then((m) => m.BookingsListComponent),
  },
];
