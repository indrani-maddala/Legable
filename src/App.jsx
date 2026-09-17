import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ROUTES } from './constants/routes';
import { ScanProvider } from './context/ScanContext';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import ScanProcessing from './pages/ScanProcessing';
import ScanProduct from './pages/ScanProduct';
import ScanResult from './pages/ScanResult';

export default function App() {
  return (
    <ScanProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.SCAN} element={<ScanProduct />} />
            {/* Fix /scan/upload so it opens the scanner rather than ComingSoon */}
            <Route path={ROUTES.UPLOAD} element={<Navigate to={ROUTES.SCAN} replace />} />
            <Route path={ROUTES.PROCESSING} element={<ScanProcessing />} />
            <Route path={ROUTES.RESULT} element={<ScanResult />} />
            <Route
              path={ROUTES.PRODUCT}
              element={
                <ComingSoon
                  title="Product Details"
                  description="A detailed view of extracted label fields will be added in a later phase."
                />
              }
            />
            <Route
              path={ROUTES.HISTORY}
              element={
                <ComingSoon
                  title="Scan History"
                  description="A searchable list of past scans will be fully integrated with database storage."
                />
              }
            />
            <Route
              path={ROUTES.ABOUT}
              element={
                <ComingSoon
                  title="About / Help"
                  description="Guidance on Legal Metrology (Packaged Commodities) Rules, 2011 for consumers, retailers, and inspectors."
                />
              }
            />
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ScanProvider>
  );
}
