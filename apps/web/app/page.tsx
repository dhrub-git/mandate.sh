import Link from "next/link";
import { Button } from "@repo/ui/button";
import {
  Shield,
  FileText,
  Scale,
  ArrowRight,
  Brain,
  Search,
  Layers,
} from "lucide-react";
import { Bruno_Ace } from "next/font/google";
import RainOnGlass from "@/components/home/RainOnGlass";

const brunoAce = Bruno_Ace({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Page() {
  return (
    <div className="min-w-0">
      <Nav />
      <HeroSection />
      <ValuePropSection />
      <PlatformSection />
      <FeaturesSection />
      <TrustSection />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between bg-[oklch(10%_0.02_250_/_0.4)] backdrop-blur-xl">
      <span className={`text-2xl tracking-tight text-white ${brunoAce.className}`}>
        Mandate
      </span>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
      >
        <Link href="/onboarding">Get Started</Link>
      </Button>
    </nav>
  );
}

/* ---------- Hero ---------- */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#040d10]">
      {/* Rain on glass WebGL background */}
      <RainOnGlass />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pt-24">
        <h1
          className="font-bold text-white drop-shadow-lg"
          style={{
            fontSize: "var(--font-size-display)",
            lineHeight: "var(--line-height-display)",
            letterSpacing: "-0.02em",
          }}
        >
          Build AI governance
          <br />
          policies{" "}
          <span className="text-accent-highlight">that actually work.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg lg:text-xl leading-relaxed text-white/70 drop-shadow-sm">
          Mandate guides your organization from onboarding through risk analysis
          to production-ready AI policies&mdash;powered by AI agents that
          understand your regulatory landscape.
        </p>

        <div className="mt-10">
          <Button variant="primary" size="lg" asChild>
            <Link href="/onboarding">
              Start Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Value Prop ---------- */

function ValuePropSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="section-number mb-6">01 &mdash; What We Do</div>
        <h2
          className="font-bold tracking-tight text-foreground max-w-4xl"
          style={{
            fontSize: "var(--font-size-headline)",
            lineHeight: "var(--line-height-headline)",
          }}
        >
          Mandate transforms the complexity of AI regulation into{" "}
          <span className="text-accent-highlight">clear, actionable governance.</span>
        </h2>
        <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Answer a few questions about your organization, and our AI agents
          research your regulatory obligations, assess your risks, and generate
          tailored policies&mdash;all in a single guided workflow.
        </p>
      </div>
    </section>
  );
}

/* ---------- Platform / How It Works ---------- */

const steps = [
  {
    num: "01",
    icon: Layers,
    title: "Company Profile",
    desc: "Tell us about your organization: industry, size, regions, and AI usage.",
  },
  {
    num: "02",
    icon: Search,
    title: "AI Inventory",
    desc: "Our agents ask targeted follow-up questions to map your AI systems and data flows.",
  },
  {
    num: "03",
    icon: Brain,
    title: "Risk Analysis",
    desc: "Automated research into regulations like the EU AI Act, NIST, and ISO 42001 that apply to you.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Policy Generation",
    desc: "Receive production-ready governance policies tailored to your exact profile.",
  },
];

function PlatformSection() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="section-number mb-6">02 &mdash; The Platform</div>
        <h2
          className="font-bold tracking-tight text-foreground mb-16"
          style={{
            fontSize: "var(--font-size-headline)",
            lineHeight: "var(--line-height-headline)",
          }}
        >
          From onboarding to policy{" "}
          <span className="text-accent-highlight">in four stages.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col">
              <div className="text-sm font-bold mb-3 text-accent-highlight" style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                {step.num}
              </div>
              <step.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */

const features = [
  {
    icon: Shield,
    title: "Regulatory Intelligence",
    desc: "Our AI agents research the EU AI Act, NIST AI RMF, ISO 42001, and emerging regulations to ensure your policies stay current.",
  },
  {
    icon: FileText,
    title: "Custom Policy Generation",
    desc: "No templates. Policies are generated from scratch based on your company profile, AI inventory, and specific risk assessment.",
  },
  {
    icon: Scale,
    title: "Multi-Framework Compliance",
    desc: "Whether you're an AI provider, deployer, or both\u2014Mandate maps obligations across overlapping regulatory frameworks.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="section-number mb-6">03 &mdash; Capabilities</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-border rounded-xl p-8 hover:shadow-md transition-shadow"
            >
              <f.icon className="h-10 w-10 text-primary mb-5" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                {f.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust / About ---------- */

function TrustSection() {
  return (
    <section className="py-24 lg:py-32 bg-[oklch(12%_0.02_250)] text-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="section-number mb-6">04 &mdash; Our Approach</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <h2
            className="font-bold tracking-tight"
            style={{
              fontSize: "var(--font-size-headline)",
              lineHeight: "var(--line-height-headline)",
            }}
          >
            AI governance shouldn&apos;t require a team of lawyers and
            consultants.
          </h2>
          <div className="flex flex-col justify-center">
            <p className="text-lg text-[oklch(70%_0.02_250)] leading-relaxed">
              Mandate combines the depth of a consulting engagement with the
              speed of automation. Our multi-agent workflow mirrors the process a
              compliance team would follow&mdash;company analysis, regulatory
              research, gap assessment, and policy drafting&mdash;but completes
              it in minutes, not months.
            </p>
            <div className="mt-8">
              <Button variant="primary" size="lg" asChild>
                <Link href="/onboarding">
                  Begin Your Governance Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-[oklch(8%_0.01_250)] text-[oklch(60%_0.02_250)] py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className={`text-5xl lg:text-6xl text-white tracking-tight mb-12 ${brunoAce.className}`}>
          Mandate
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/onboarding"
                  className="hover:text-white transition-colors"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <span className="cursor-default">How It Works</span>
              </li>
              <li>
                <span className="cursor-default">Pricing</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              Frameworks
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default">EU AI Act</span>
              </li>
              <li>
                <span className="cursor-default">NIST AI RMF</span>
              </li>
              <li>
                <span className="cursor-default">ISO 42001</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default">About</span>
              </li>
              <li>
                <span className="cursor-default">Blog</span>
              </li>
              <li>
                <span className="cursor-default">Contact</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-sm">
          &copy; 2026 Mandate. AI governance, simplified.
        </div>
      </div>
    </footer>
  );
}