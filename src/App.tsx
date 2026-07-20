import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { RequireStaff } from '@/auth/RequireStaff'
import { RequireSuperuser } from '@/auth/RequireSuperuser'
import { AdminShell } from '@/components/layout/AdminShell'
import { ToastProvider } from '@/components/ui/Toast'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AccessDeniedPage } from '@/pages/AccessDeniedPage'
import { AuditLogPage } from '@/pages/AuditLogPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExchangeRatesPage } from '@/pages/ExchangeRatesPage'
import { FundraiserDetailPage } from '@/pages/FundraiserDetailPage'
import { FundraisersListPage } from '@/pages/FundraisersListPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { PayoutDetailPage } from '@/pages/PayoutDetailPage'
import { PayoutsListPage } from '@/pages/PayoutsListPage'
import { TransactionDetailPage } from '@/pages/TransactionDetailPage'
import { TransactionsListPage } from '@/pages/TransactionsListPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { UsersListPage } from '@/pages/UsersListPage'
import { VerificationDetailPage } from '@/pages/VerificationDetailPage'
import { VerificationListPage } from '@/pages/VerificationListPage'
import { BadgesPage } from '@/pages/catalog/BadgesPage'
import { CategoriesPage } from '@/pages/catalog/CategoriesPage'
import { ProfileItemsPage } from '@/pages/catalog/ProfileItemsPage'
import { StatsMoneyByUserPage } from '@/pages/stats/StatsMoneyByUserPage'
import { StatsMoneyPage } from '@/pages/stats/StatsMoneyPage'
import { StatsTransactionsPage } from '@/pages/stats/StatsTransactionsPage'
import { StatsUsersPage } from '@/pages/stats/StatsUsersPage'
import { StatsVisitsPage } from '@/pages/stats/StatsVisitsPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              <Route element={<RequireStaff />}>
                <Route element={<AdminShell />}>
                  <Route index element={<DashboardPage />} />

                  <Route path="users" element={<UsersListPage />}>
                    <Route path=":id" element={<UserDetailPage />} />
                  </Route>
                  <Route path="verification" element={<VerificationListPage />}>
                    <Route path=":id" element={<VerificationDetailPage />} />
                  </Route>
                  <Route path="payouts" element={<PayoutsListPage />}>
                    <Route path=":id" element={<PayoutDetailPage />} />
                  </Route>
                  <Route path="transactions" element={<TransactionsListPage />}>
                    <Route path=":id" element={<TransactionDetailPage />} />
                  </Route>
                  <Route path="fundraisers" element={<FundraisersListPage />}>
                    <Route path=":id" element={<FundraiserDetailPage />} />
                  </Route>

                  <Route path="catalog/categories" element={<CategoriesPage />} />
                  <Route path="catalog/profile-items" element={<ProfileItemsPage />} />
                  <Route path="catalog/badges" element={<BadgesPage />} />
                  <Route path="exchange-rates" element={<ExchangeRatesPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="stats/users" element={<StatsUsersPage />} />
                  <Route path="stats/transactions" element={<StatsTransactionsPage />} />
                  <Route path="stats/visits" element={<StatsVisitsPage />} />
                  <Route path="audit" element={<AuditLogPage />} />

                  <Route element={<RequireSuperuser />}>
                    <Route path="stats/money" element={<StatsMoneyPage />} />
                    <Route path="stats/money-by-user" element={<StatsMoneyByUserPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
