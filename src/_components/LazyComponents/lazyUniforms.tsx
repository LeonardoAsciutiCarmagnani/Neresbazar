import React, { lazy, Suspense } from "react";
import Header from "../Header/header";

const LazySchoolSupplies = lazy(() => import("../Products/uniforms"));

const LazySchoolSuppliesComponent = (
  props: JSX.IntrinsicAttributes & { children?: React.ReactNode }
) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Header />
    <LazySchoolSupplies {...props} />
  </Suspense>
);

export default LazySchoolSuppliesComponent;
