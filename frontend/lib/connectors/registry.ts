export type ConnectorStatus = "live" | "guided" | "soon" | "roadmap";

export interface ConnectorDefinition {
  id: string;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  href: string;
  status: ConnectorStatus;
  accept?: string;
  aliases?: readonly string[];
}

export const CONNECTOR_REGISTRY: readonly ConnectorDefinition[] = [
  {
    id: "form16",
    label: "Form 16",
    shortLabel: "Form 16",
    title: "Form 16",
    description: "Upload salary certificate from employer",
    href: "/file/import/documents?source=form16",
    status: "live",
    accept: ".pdf",
  },
  {
    id: "ais",
    label: "AIS / TIS (ITD)",
    shortLabel: "AIS",
    title: "AIS",
    description: "AIS or TIS PDF from Compliance Portal (password required)",
    href: "/file/import/documents?source=ais",
    status: "soon",
    accept: ".pdf,.json,application/pdf",
  },
  {
    id: "form26as",
    label: "Form 26AS",
    shortLabel: "Form 26AS",
    title: "Form 26AS",
    description: "Proof of TDS deducted by employers/banks",
    href: "/file/import/documents?source=form26as",
    status: "soon",
    accept: ".pdf,.json,application/pdf",
  },
  {
    id: "cams",
    label: "CAMS / KFintech CG statement",
    shortLabel: "CAMS",
    title: "CAMS",
    description: "MF Capital Gain / Loss PDF (password often required)",
    href: "/file/import/documents?source=cams",
    status: "soon",
    accept: ".pdf,application/pdf",
    aliases: ["mfcentral"],
  },
  {
    id: "groww",
    label: "Groww Capital Gains (Excel)",
    shortLabel: "Groww",
    title: "Groww",
    description:
      "FY Capital Gains Excel from Reports — not Holdings / User Profile",
    href: "/file/import/documents?source=groww",
    status: "guided",
    accept:
      ".xlsx,.xls,.csv,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
  },
  {
    id: "zerodha",
    label: "Zerodha Tax P&L",
    shortLabel: "Zerodha",
    title: "Zerodha",
    description: "Tax P&L from console.zerodha.com — F&O, intraday, equity",
    href: "/file/import/documents?source=zerodha",
    status: "guided",
    accept: ".xlsx,.xls,.csv,.pdf,application/pdf",
  },
  {
    id: "upstox",
    label: "Upstox Tax P&L",
    shortLabel: "Upstox",
    title: "Upstox",
    description: "Tax P&L report from Upstox Reports → Tax",
    href: "/file/import/documents?source=upstox",
    status: "guided",
    accept: ".xlsx,.xls,.csv,.pdf,application/pdf",
  },
  {
    id: "dhan",
    label: "Dhan Tax P&L",
    shortLabel: "Dhan",
    title: "Dhan",
    description: "Tax P&L export from Dhan Reports",
    href: "/file/import/documents?source=dhan",
    status: "guided",
    accept: ".xlsx,.xls,.csv,.pdf,application/pdf",
  },
  {
    id: "angelone",
    label: "Angel One Tax P&L",
    shortLabel: "Angel One",
    title: "Angel One",
    description: "Profit & Loss statement from Angel One Reports → Tax",
    href: "/file/import/documents?source=angelone",
    status: "guided",
    accept: ".xlsx,.xls,.csv,.pdf,application/pdf",
  },
  {
    id: "crypto",
    label: "Crypto / VDA statement",
    shortLabel: "Crypto",
    title: "Crypto",
    description: "Exchange CSV — Schedule VDA (30% per winning trade)",
    href: "/file/import/vda",
    status: "guided",
    accept: ".csv,.xlsx,.pdf",
  },
  {
    id: "itd",
    label: "ITD pre-fill",
    shortLabel: "ITD pre-fill",
    title: "ITD pre-fill",
    description: "Government portal pre-filled JSON",
    href: "/file/import/documents?source=itd",
    status: "roadmap",
    accept: ".json",
  },
  {
    id: "bank",
    label: "Bank interest certificate",
    shortLabel: "Bank",
    title: "Bank",
    description: "Savings and FD interest certificate",
    href: "/file/import/documents?source=bank",
    status: "soon",
    accept: ".pdf,.xlsx,.csv",
  },
];

export type ConnectorId = (typeof CONNECTOR_REGISTRY)[number]["id"];

export function getConnectorDefinition(
  id: string
): ConnectorDefinition | undefined {
  const connectors: readonly ConnectorDefinition[] = CONNECTOR_REGISTRY;
  return connectors.find(
    (connector) => connector.id === id || connector.aliases?.includes(id)
  );
}

export function isLiveConnector(id: string): boolean {
  return getConnectorDefinition(id)?.status === "live";
}

export function isKnownConnector(id: string): boolean {
  return getConnectorDefinition(id) !== undefined;
}

export const QUICK_START_CONNECTORS = CONNECTOR_REGISTRY.filter((connector) =>
  ["form16", "ais", "groww", "zerodha", "cams"].includes(connector.id)
);

export const IMPORT_STRIP_CONNECTORS = CONNECTOR_REGISTRY.map((connector) => ({
  id: connector.id,
  label: connector.shortLabel,
  status: connector.status,
}));
