import { Img } from "@react-email/components";
import { asset } from "@/utils/asset";

export default function Header() {
  return (
    <>
      <Img
        className="py-4 mt-4 ml-8 bg-indigo-950 rounded-2xl"
        src="https://res.cloudinary.com/dzyc27bpq/image/upload/v1760462136/logo_qxi1hi.png"
        // src={asset("brand/logo.png")}
        width="140"
      />
    </>
  );
}
