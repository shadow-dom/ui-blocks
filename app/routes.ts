import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard-2.tsx"),
    route("gantt", "routes/gantt.tsx"),
    route("assignments", "routes/assignments.tsx"),
] satisfies RouteConfig;
