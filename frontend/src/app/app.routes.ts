import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/Register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProductsComponent } from './components/products/products';
import { StockTransactions } from './components/stock-transactions/stock-transactions';
import { Forecast } from './components/forecast/forecast';
import { SuppliersComponent } from './components/supplier/suppliers';
import { OrdersComponent } from './components/order/orders';
import { NotificationsComponent } from './components/notifications/notifications';
import { UsersComponent } from './components/users/users';
import { ReportsComponent } from './components/reports/reports';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'stock', component: StockTransactions, canActivate: [AuthGuard] },
  { path: 'forecast', component: Forecast, canActivate: [AuthGuard] },
  { path: 'suppliers', component: SuppliersComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
