/** Illustrative personas for marketing — not verified customer reviews */
export const TESTIMONIAL_DISCLOSURE =
  "Illustrative examples based on typical use cases.";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: number;
  quote: string;
  plan?: string;
  outcomeTag?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Product manager",
    city: "Bengaluru",
    rating: 5,
    quote:
      "Filed at 11pm on July 30. AIS caught FD interest I would have missed — saved a notice headache.",
    plan: "AI Smart",
    outcomeTag: "AIS mismatch caught",
  },
  {
    id: "2",
    name: "Rahul Mehta",
    role: "Chartered accountant",
    city: "Mumbai",
    rating: 5,
    quote:
      "Regime compare matched my spreadsheet within ₹200. Good sanity check for DIY clients.",
    plan: "DIY",
    outcomeTag: "Regime verified",
  },
  {
    id: "3",
    name: "Ananya Reddy",
    role: "Software engineer",
    city: "Hyderabad",
    rating: 5,
    quote:
      "Groww + Form 16 import in one flow. Companion mode walked me through every ITR-1 screen.",
    plan: "AI Smart",
    outcomeTag: "Companion filing",
  },
  {
    id: "4",
    name: "Vikram Singh",
    role: "Consultant",
    city: "Delhi",
    rating: 4,
    quote:
      "80GG rent deduction was suggested lawfully — I didn't know I qualified without HRA.",
    plan: "Free",
    outcomeTag: "80GG deduction found",
  },
  {
    id: "5",
    name: "Meera Iyer",
    role: "Doctor",
    city: "Chennai",
    rating: 5,
    quote:
      "CA review caught a Schedule CG error from Zerodha trades. Worth it before submit.",
    plan: "CA",
    outcomeTag: "Schedule CG caught",
  },
  {
    id: "6",
    name: "Arjun Patel",
    role: "Founder",
    city: "Pune",
    rating: 5,
    quote:
      "Switched to new regime after seeing the numbers — old blog advice would have cost ₹18k.",
    plan: "AI Smart",
    outcomeTag: "Regime saved ₹18k",
  },
];
