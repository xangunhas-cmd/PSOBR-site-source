import type { Metadata } from "next";
import SettingsWorkspace from "@/components/SettingsWorkspace";

export const metadata: Metadata = {title:"Configurações | PSOBR",description:"Preferências da conta PSOBR e futura integração com o 7a0."};
export default function SettingsPage(){return <SettingsWorkspace/>;}
