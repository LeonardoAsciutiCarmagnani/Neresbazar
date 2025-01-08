import React, { lazy, Suspense } from "react";
import Header from "../Header/header";
import Loader from "../Loader/PageLoader/loader";

const LazySchoolSupplies = lazy(() => import("../Products/uniforms"));

const LazySchoolSuppliesComponent = (
  props: JSX.IntrinsicAttributes & { children?: React.ReactNode }
) => (
  <Suspense
    fallback={
      <div>
        <Loader />
      </div>
    }
  >
    <Header />
    <LazySchoolSupplies {...props} />
  </Suspense>
);

export default LazySchoolSuppliesComponent;
