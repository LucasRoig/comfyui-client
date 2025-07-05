import { SelectedProjectContext } from "../../../modules/project/selected-project-context";

export default async function ProjectPage({ params }: Readonly<{ params: Promise<{ projectId: string }> }>) {
  const { projectId } = await params;

  return <div>Project {projectId}
    {/* <SelectedProjectContext.Consumer>
      {(ctx) => {
        if (!ctx) {
          return null;
        }
        return (
          <div>
            <h1>{ctx.projectName}</h1>
            <p>Project ID: {ctx.projectId}</p>
          </div>
        );
      }}
    </SelectedProjectContext.Consumer> */}
  </div>;
}
