import { call } from "@orpc/server";
import { useQuery } from "@tanstack/react-query";
import { appRouter } from "~/.server";
import { orpc } from "~/@lib/orpc-client";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export async function loader({}: Route.LoaderArgs) {
  const serverPing = await call(appRouter.ping, {});

  return { serverPing };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home(props: Route.ComponentProps) {
  props.loaderData.serverPing;
  const { data: clientPing } = useQuery(orpc.ping.queryOptions());
  const { data: projects } = useQuery(orpc.projects.list.queryOptions());

  return (
    <>
      <div>server: {props.loaderData.serverPing}</div>
      <div>client: {clientPing}</div>
      <Welcome />
    </>
  );
}
