import portalSteps from "@/data/portal_steps.json";
import portalFootprint from "@/data/portal_footprint.json";
import type { PortalFootprintScreen, PortalForm, PortalStep } from "./types";

/** Server-only portal guide data — do not import from client components. */
export function getPortalStepsForForm(form: PortalForm): PortalStep[] | undefined {
  return (portalSteps as Record<string, PortalStep[]>)[form];
}

export function getPortalFootprintForForm(
  form: PortalForm
): PortalFootprintScreen[] {
  return (portalFootprint as Record<string, PortalFootprintScreen[]>)[form] ?? [];
}
