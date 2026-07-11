/** How to download Tax P&L / capital-gains reports from Indian brokers. */

export interface BrokerDownloadGuide {
  id: string;
  label: string;
  taxPnlSteps: string[];
  capitalGainsSteps?: string[];
  acceptHint: string;
}

export const BROKER_DOWNLOAD_GUIDES: readonly BrokerDownloadGuide[] = [
  {
    id: "zerodha",
    label: "Zerodha",
    taxPnlSteps: [
      "Log in to console.zerodha.com → Reports → Tax P&L.",
      "Select Financial Year → Download P&L (Excel/PDF). Includes F&O, intraday, and equity delivery.",
    ],
    capitalGainsSteps: [
      "Console → Reports → Equity / MF capital gains for the FY (if you sold outside Coin).",
    ],
    acceptHint: "Tax P&L Excel or PDF from Kite Console",
  },
  {
    id: "groww",
    label: "Groww",
    taxPnlSteps: [
      "Groww app → Profile → Reports → Stocks – Tax P&L (FY) for F&O/equity.",
      "For mutual funds: Reports → Capital Gains – Mutual Funds → pick FY → Download Excel.",
    ],
    acceptHint: "Capital Gains Excel or Tax P&L PDF — not Holdings export",
  },
  {
    id: "upstox",
    label: "Upstox",
    taxPnlSteps: [
      "Upstox app / web → Reports → Tax → Tax P&L report.",
      "Choose FY and download — covers equity, F&O, and commodity segments.",
    ],
    acceptHint: "Tax P&L report (Excel/PDF) from Upstox Reports",
  },
  {
    id: "dhan",
    label: "Dhan",
    taxPnlSteps: [
      "Dhan app → Menu → Reports → Tax P&L.",
      "Select assessment year and export — includes options chain trades and equity.",
    ],
    acceptHint: "Tax P&L export from Dhan Reports",
  },
  {
    id: "angelone",
    label: "Angel One",
    taxPnlSteps: [
      "Angel One app → Reports → Tax → Profit & Loss statement.",
      "Pick financial year → download PDF/Excel for trading and F&O.",
    ],
    acceptHint: "Tax P&L from Angel One Reports section",
  },
] as const;

export function getBrokerGuide(id: string): BrokerDownloadGuide | undefined {
  return BROKER_DOWNLOAD_GUIDES.find((g) => g.id === id);
}
