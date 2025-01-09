import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import SelectCategory from "./_components/SelectCategory/selectCategory";
import SignupForm from "./_components/SignUp/signup";
import LoginForm from "./_components/LoginForm/loginForm";
import ProtectedRoute from "./_components/ProtectedRoute/protectedRoute";
import SchoolSuppliesPage from "./_components/LazyComponents/lazySchoolSupplies";
import UniformsPage from "./_components/LazyComponents/lazyUniforms";
import PageLoader from "./_components/Loader/PageLoader/loader";
import Loader from "./_components/Loader/ImageLoader/loader";
import { Checkout } from "./Pages/Checkout";

export const router = createBrowserRouter(
  [
    {
      path: "/register",
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
          <ProtectedRoute>
            <SchoolSuppliesPage />
          </ProtectedRoute>
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
          <Checkout />
        </Suspense>
      ),
    },
    {
      path: "/page-loader",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <ProtectedRoute>
            <PageLoader />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/image-loader",
      element: (
        <Suspense
          fallback={
            <div>
              <PageLoader />
            </div>
          }
        >
          <ProtectedRoute>
            <Loader />
          </ProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "/",
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
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
