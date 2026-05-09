import { 
  auth, 
  workspace, 
  billing, 
  ai, 
  storage, 
  branches, 
  products,
  foodVariants,
  categories,
  extras,
  currencies,
  mealTimes,
  advertisements,
  qr,
  unitsOfMeasurement,
  admin,
  notifications,
  analytics,
  tickets,
  portability
  } from "@node-stack/api-client";

  import { axiosInstance } from "./axiosInstance";

  export { axiosInstance };
  export const apiClient = axiosInstance;
  export { cookieTokenStorage } from "../cookie-storage";

  export const api = {
  auth: auth(axiosInstance),
  workspace: workspace(axiosInstance),
  billing: billing(axiosInstance),
  ai: ai(axiosInstance),
  storage: storage(axiosInstance),
  branches: branches(axiosInstance),
  products: products(axiosInstance),
  foodVariants: foodVariants(axiosInstance),
  categories: categories(axiosInstance),
  extras: extras(axiosInstance),
  currencies: currencies(axiosInstance),
  mealTimes: mealTimes(axiosInstance),
  advertisements: advertisements(axiosInstance),
  qr: qr(axiosInstance),
  unitsOfMeasurement: unitsOfMeasurement(axiosInstance),
  admin: admin(axiosInstance),
  notifications: notifications(axiosInstance),
  analytics: analytics(axiosInstance),
  tickets: tickets(axiosInstance),
  portability: portability(axiosInstance),
  };