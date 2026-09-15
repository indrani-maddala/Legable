import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ROUTES } from './constants/routes';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import ScanProduct from './pages/ScanProduct';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.SCAN} element={<ScanProduct />} />
          <Route
            path={ROUTES.UPLOAD}
            element={
              <ComingSoon
                title="Upload / Capture Image"
                description="Image upload and camera capture will be added in the next feature step."
              />
            }
          />
          <Route
            path={ROUTES.PROCESSING}
            element={
              <ComingSoon
                title="Scan Processing"
                description="A processing state will simulate OCR extraction before showing results."
              />
            }
          />
          <Route
            path={ROUTES.RESULT}
            element={
              <ComingSoon
                title="Compliance Result"
                description="Overall status, checklist, missing fields, and recommendations will appear here."
              />
            }
          />
          <Route
            path={ROUTES.PRODUCT}
            element={
              <ComingSoon
                title="Product Details"
                description="A detailed view of extracted label fields will be added later."
              />
            }
          />
          <Route
            path={ROUTES.HISTORY}
            element={
              <ComingSoon
                title="Scan History"
                description="A searchable list of previous scans will be built after the result screen."
              />
            }
          />
          <Route
            path={ROUTES.ABOUT}
            element={
              <ComingSoon
                title="About / Help"
                description="Guidance for consumers, retailers, and inspectors will be added later."
              />
            }
          />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
