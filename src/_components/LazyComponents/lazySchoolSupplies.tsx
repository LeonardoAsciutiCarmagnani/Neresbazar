import React, { lazy, Suspense } from "react";

const LazySchoolSupplies = lazy(() => import("../Products/school-supplies"));

const LazySchoolSuppliesComponent = (
  props: JSX.IntrinsicAttributes & { children?: React.ReactNode }
) => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazySchoolSupplies {...props} />
  </Suspense>
);

export default LazySchoolSuppliesComponent;
