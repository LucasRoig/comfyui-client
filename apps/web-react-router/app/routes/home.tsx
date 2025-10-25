import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { orpc } from "~/@lib/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { appRouter } from "~/.server";
import { call } from "@orpc/server";

export async function loader({}: Route.LoaderArgs) {
  const serverPing = await call(appRouter.ping, {});

  return { serverPing };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home(props: Route.ComponentProps) {
  props.loaderData.serverPing
  const { data: clientPing } = useQuery(orpc.ping.queryOptions());

  return (
    <>
    <div>server: {props.loaderData.serverPing}</div>
    <div>client: {clientPing}</div>
      <Welcome />
    </>
  );
}
