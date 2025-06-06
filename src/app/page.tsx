import { headers } from "next/headers";
import { getTranslation } from "@/lib/translations";
import Chat from "./chat";

export default async function Page() {
    const headerList = await headers();
    const acceptLang = headerList.get("accept-language") || "en";
    const locale = acceptLang.split(",")[0].split("-")[0];
    const translation = getTranslation(locale);

    return <Chat translation={translation}></Chat>;
}
