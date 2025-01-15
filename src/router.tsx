import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import SelectCategory from "./_components/SelectCategory/selectCategory";
import SignupForm from "./_components/SignUp/signup";
import LoginForm from "./_components/LoginForm/loginForm";
import ProtectedRoute from "./_components/ProtectedRoute/protectedRoute";
import SchoolSuppliesPage from "./_components/LazyComponents/lazySchoolSupplies";
import UniformsPage from "./_components/LazyComponents/lazyUniforms";
import PageLoader from "./_components/Loader/PageLoader/loader";
import Checkout from "./_components/CheckoutForm/checkoutForm";
import Loader from "./_components/Loader/PageLoader/loader";
import GetOrdersComponent from "./_components/GetOrders";
import { GetOrdersClientComponent } from "./_components/GetOrdersClient";
import ProtectedAdminRoute from "./_components/ProtectedRoute/protectedAdminRoute";
// import Loader from "./_components/Loader/ImageLoader/loader";
// import { Checkout } from "./Pages/Checkout";

export const router = createBrowserRouter(
  [
    {
      path: "/signup",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      ),
    },
    {
      path: "/login",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      ),
    },
    {
      path: "/select-category",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <ProtectedRoute>
            <SelectCategory />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/school-supplies",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <SchoolSuppliesPage />
        </Suspense>
      ),
    },
    {
      path: "/uniforms",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <UniformsPage />
        </Suspense>
      ),
    },
    {
      path: "/checkout",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/orders",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <ProtectedRoute>
            <ProtectedAdminRoute>
              <GetOrdersComponent />
            </ProtectedAdminRoute>
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/orders-client",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <ProtectedRoute>
            <GetOrdersClientComponent />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/",
      element: (
        <Suspense
          fallback={
            <div>
              <Loader />
            </div>
          }
        >
          <SelectCategory />
        </Suspense>
      ),
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
