import { cyan, bold } from "colorette";
import server from "@/server";

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(bold(cyan(`REST API running on port ${port}`)));
});
