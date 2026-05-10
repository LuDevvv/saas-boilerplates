import {
  Button,
  CalloutCard,
  EmptyState,
  FilterTabs,
  LoadingState,
  PageHeader,
  SectionHeader,
  StatRow,
  StatusPill,
  TwoColumnLayout,
} from "@node-stack/ui";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Inbox,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FC, useState } from "react";

// ─── Layout helpers (catalog-only) ───────────────────────────────────────────

const Section: FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section className="space-y-4">
    <SectionHeader eyebrow="COMPONENT" title={title} description={description} />
    <div className="rounded-[20px] border border-border bg-surface p-6 space-y-6">{children}</div>
  </section>
);

const ExampleRow: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 md:gap-6 items-start">
    <p className="text-[10px] font-bold uppercase  text-fg-muted pt-1.5">
      {label}
    </p>
    <div className="flex flex-wrap items-start gap-3">{children}</div>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const ComponentsCatalog: FC = () => {
  const [tabValue, setTabValue] = useState<"all" | "active" | "archived">("all");

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="DEV"
        title="Catálogo de componentes"
        description="Vista interna con todos los primitivos de @node-stack/ui en sus variantes principales. Solo accesible en desarrollo."
        className="mb-6"
      />

      <div className="flex flex-col gap-8 max-w-[1100px]">
        {/* ── Buttons ── */}
        <Section
          title="Button"
          description="Variantes principales del componente Button."
        >
          <ExampleRow label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </ExampleRow>
          <ExampleRow label="Sizes">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </ExampleRow>
          <ExampleRow label="States">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button fullWidth>Full width</Button>
          </ExampleRow>
        </Section>

        {/* ── StatusPill ── */}
        <Section
          title="StatusPill"
          description="Pill compacta para estados (active / pending / verified / failed)."
        >
          <ExampleRow label="Tones">
            <StatusPill label="Activo" tone="success" />
            <StatusPill label="Pendiente" tone="warning" />
            <StatusPill label="Info" tone="info" />
            <StatusPill label="Error" tone="danger" />
            <StatusPill label="Neutral" tone="neutral" />
          </ExampleRow>
          <ExampleRow label="Pulse">
            <StatusPill label="En vivo" tone="success" pulse />
            <StatusPill label="Vence en 30m" tone="danger" pulse />
          </ExampleRow>
          <ExampleRow label="No dot">
            <StatusPill label="200" tone="success" hideDot />
            <StatusPill label="500" tone="danger" hideDot />
          </ExampleRow>
        </Section>

        {/* ── FilterTabs ── */}
        <Section
          title="FilterTabs"
          description="Tab pill switcher con counts opcionales."
        >
          <ExampleRow label="Default">
            <FilterTabs
              value={tabValue}
              onChange={(v) => setTabValue(v as typeof tabValue)}
              options={[
                { value: "all", label: "Todos", count: 24 },
                { value: "active", label: "Activos", count: 18 },
                { value: "archived", label: "Archivados", count: 6 },
              ]}
            />
          </ExampleRow>
          <ExampleRow label="Compact">
            <FilterTabs
              size="sm"
              value={tabValue}
              onChange={(v) => setTabValue(v as typeof tabValue)}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Activos" },
                { value: "archived", label: "Archivados" },
              ]}
            />
          </ExampleRow>
          <ExampleRow label="With icons">
            <FilterTabs
              value={tabValue}
              onChange={(v) => setTabValue(v as typeof tabValue)}
              options={[
                { value: "all", label: "Todos", icon: <Layers className="h-3.5 w-3.5" /> },
                { value: "active", label: "Activos", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                { value: "archived", label: "Archivados", icon: <Inbox className="h-3.5 w-3.5" /> },
              ]}
            />
          </ExampleRow>
        </Section>

        {/* ── StatRow ── */}
        <Section
          title="StatRow"
          description="Fila label + valor con icono opcional + trend."
        >
          <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 max-w-md divide-y divide-border-subtle">
            <StatRow icon={Users} label="Total miembros" value={128} />
            <StatRow
              icon={CreditCard}
              label="MRR"
              value="$1,240"
              trend={{ value: 12, label: "vs ayer" }}
            />
            <StatRow
              icon={Bell}
              label="Eventos hoy"
              value={42}
              trend={{ value: -3.2 }}
              compact
            />
          </div>
        </Section>

        {/* ── CalloutCard ── */}
        <Section
          title="CalloutCard"
          description="Patrón unificado para promo / informativo / status (icono + título + acción)."
        >
          <ExampleRow label="Card · vertical">
            <div className="w-full max-w-sm">
              <CalloutCard
                icon={ShieldCheck}
                iconTone="success"
                variant="card"
                eyebrow="SEGURIDAD LEGAL"
                title="KYC Verificado"
                description="Tu empresa cumple con todas las normativas vigentes."
                action={<Button variant="secondary" className="w-full">Documentación</Button>}
              />
            </div>
          </ExampleRow>
          <ExampleRow label="Muted · horizontal">
            <CalloutCard
              icon={Bell}
              iconTone="primary"
              variant="muted"
              layout="horizontal"
              title="¿Dudas con tu factura?"
              description="Si encuentras algún error en tus cobros, nuestro equipo de soporte te atenderá."
              action={<Button>Contactar</Button>}
              className="w-full max-w-2xl"
            />
          </ExampleRow>
          <ExampleRow label="Promo">
            <div className="w-full max-w-sm">
              <CalloutCard
                icon={Sparkles}
                variant="promo"
                title="Equipos ilimitados"
                description="Desbloquea roles personalizados con el plan Enterprise."
                action={
                  <button className="w-full h-9 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-bold uppercase ">
                    Ver planes
                  </button>
                }
              />
            </div>
          </ExampleRow>
          <ExampleRow label="With status">
            <div className="w-full max-w-sm">
              <CalloutCard
                icon={ShieldCheck}
                iconTone="success"
                title="Seguridad en Dos Pasos"
                description="Tu cuenta está protegida con 2FA."
                status={{ label: "Activado", tone: "success", pulse: true }}
              />
            </div>
          </ExampleRow>
        </Section>

        {/* ── LoadingState ── */}
        <Section
          title="LoadingState"
          description="Tres variantes: spinner, skeleton (líneas) y shimmer (bloques)."
        >
          <ExampleRow label="Spinner">
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 w-full max-w-md">
              <LoadingState />
            </div>
          </ExampleRow>
          <ExampleRow label="Skeleton">
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 w-full max-w-md">
              <LoadingState variant="skeleton" rows={4} />
            </div>
          </ExampleRow>
          <ExampleRow label="Shimmer">
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 w-full max-w-md">
              <LoadingState variant="shimmer" rows={3} />
            </div>
          </ExampleRow>
        </Section>

        {/* ── EmptyState ── */}
        <Section title="EmptyState" description="Estados vacíos con icono, título y CTA opcional.">
          <ExampleRow label="Default">
            <div className="w-full max-w-md">
              <EmptyState
                icon={Inbox}
                title="Bandeja vacía"
                description="No hay tickets pendientes en este momento."
                action={<Button>Crear ticket</Button>}
              />
            </div>
          </ExampleRow>
          <ExampleRow label="Compact">
            <div className="w-full max-w-md">
              <EmptyState
                icon={Bell}
                title="Sin notificaciones"
                description="Cuando ocurra algo importante, lo verás aquí."
                compact
              />
            </div>
          </ExampleRow>
        </Section>

        {/* ── TwoColumnLayout ── */}
        <Section
          title="TwoColumnLayout"
          description="Grilla 12 columnas (8 main + 4 aside sticky en desktop)."
        >
          <div className="rounded-xl border border-border-subtle bg-surface-muted p-4">
            <TwoColumnLayout gap="gap-4">
              <TwoColumnLayout.Main>
                <div className="rounded-lg bg-surface border border-border h-32 flex items-center justify-center text-[12px] text-fg-muted">
                  Main · col-span-8
                </div>
              </TwoColumnLayout.Main>
              <TwoColumnLayout.Aside sticky={false}>
                <div className="rounded-lg bg-surface border border-border h-32 flex items-center justify-center text-[12px] text-fg-muted">
                  Aside · col-span-4
                </div>
              </TwoColumnLayout.Aside>
            </TwoColumnLayout>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default ComponentsCatalog;
