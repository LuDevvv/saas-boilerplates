import { PageHeader } from "@node-stack/ui";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Introducción",
    body: 'Estos Términos y Condiciones ("Términos") rigen el uso de nuestra plataforma de gestión empresarial (el "Servicio"). Al registrarte y utilizar nuestro Servicio, aceptas estos Términos en su totalidad. Si no estás de acuerdo con estos Términos, por favor no utilices nuestro Servicio.',
  },
  {
    title: "2. Registro y Cuentas",
    body: "Para utilizar nuestro Servicio, debes registrarte y crear una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran bajo tu cuenta. Debes proporcionar información precisa y completa durante el proceso de registro y mantenerla actualizada.",
  },
  {
    title: "3. Uso del Servicio",
    body: "Nuestro Servicio está diseñado para ayudarte a gestionar tu empresa. Te otorgamos una licencia limitada, no exclusiva y no transferible para utilizar el Servicio de acuerdo con estos Términos. No debes:",
    list: [
      "Utilizar el Servicio de manera ilegal o para fines no autorizados",
      "Intentar acceder a áreas restringidas del Servicio",
      "Interferir con el funcionamiento normal del Servicio",
      "Realizar ingeniería inversa o descompilar cualquier parte del Servicio",
      "Vender, sublicenciar o transferir tus derechos bajo estos Términos",
    ],
  },
  {
    title: "4. Contenido del Usuario",
    body: "Al cargar contenido a nuestro Servicio, nos otorgas una licencia mundial, no exclusiva, libre de regalías para usar, reproducir y procesar dicho contenido únicamente con el propósito de proporcionar y mejorar el Servicio. Mantienes todos los derechos sobre tu contenido, pero eres responsable de asegurarte de que tienes los derechos necesarios para otorgarnos esta licencia.",
  },
  {
    title: "5. Pagos y Facturación",
    body: "Algunos aspectos de nuestro Servicio pueden requerir pago. Los detalles de nuestros planes y precios están disponibles en nuestra plataforma. Todos los pagos son no reembolsables a menos que se indique lo contrario. Nos reservamos el derecho de cambiar nuestros precios en cualquier momento, pero te notificaremos con antelación sobre cualquier cambio que afecte tu suscripción actual.",
  },
  {
    title: "6. Cancelación y Terminación",
    body: "Puedes cancelar tu cuenta en cualquier momento. Nos reservamos el derecho de suspender o terminar tu acceso al Servicio si violas estos Términos o si tu uso del Servicio presenta un riesgo de daño legal para nosotros o para otros usuarios.",
  },
  {
    title: "7. Limitación de Responsabilidad",
    body: "En la medida permitida por la ley, no seremos responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, o por pérdida de beneficios, ingresos, datos o uso, incurridos por ti o por terceros, ya sea en una acción contractual o extracontractual, incluso si hemos sido advertidos de la posibilidad de tales daños.",
  },
  {
    title: "8. Cambios en los Términos",
    body: "Podemos modificar estos Términos en cualquier momento. Te notificaremos sobre cambios significativos a través de un aviso en nuestro Servicio o por correo electrónico. El uso continuado del Servicio después de tales cambios constituye tu aceptación de los nuevos Términos.",
  },
  {
    title: "9. Ley Aplicable",
    body: "Estos Términos se regirán e interpretarán de acuerdo con las leyes de [País/Región], sin tener en cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa que surja en relación con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de [Ciudad, País/Región].",
  },
  {
    title: "10. Contacto",
    body: "Si tienes preguntas sobre estos Términos, por favor contáctanos a través de [dirección de correo electrónico].",
  },
];

const TermsPage = () => {
  return (
    <section className="bg-canvas min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 sm:py-16">
        <Link
          to="/auth/sign-up"
          className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al registro
        </Link>

        <PageHeader
          eyebrow="LEGAL"
          title="Términos y Condiciones"
          description="Última actualización: 28 de febrero de 2025"
          className="mb-10"
        />

        <article className="space-y-8 text-[14px] text-fg-secondary leading-relaxed">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-[17px] font-heading text-fg">{section.title}</h2>
              <p>{section.body}</p>
              {section.list && (
                <ul className="list-disc pl-6 space-y-1.5 marker:text-fg-muted">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </article>

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground text-[13px] font-medium transition-colors active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
          >
            Volver al registro
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
