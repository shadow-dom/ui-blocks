import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <>
    <div className="flex flex-row">
    <div className="sm:basis-1/3 sm:block hidden">01</div>
    <div className="sm:basis-2/3 basis-1"></div>
  </div>
  </>;
}
