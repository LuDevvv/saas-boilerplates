import { PageHeader } from "@node-stack/ui";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface SectionItem {
  emphasis?: string;
  body: string;
}

interface Section {
  title: string;
  intro?: string;
  body?: string;
  list?: (string | SectionItem)[];
  outro?: string;
}

const SECTIONS: Section[] = [
  {
    title: "1. Introducción",
    body: 'Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos tu información personal cuando utilizas nuestra plataforma de gestión empresarial (el "Servicio"). Respetamos tu privacidad y estamos comprometidos a proteger tus datos personales.',
  },
  {
    title: "2. Información que Recopilamos",
    intro: "Recopilamos varios tipos de información, incluyendo:",
    list: [
      { emphasis: "Información de registro:", body: "Nombre, apellido, dirección de correo electrónico y contraseña cuando creas una cuenta." },
      { emphasis: "Información de perfil:", body: "Información adicional que proporcionas al completar tu perfil, como tu cargo, empresa y foto de perfil." },
      { emphasis: "Información de uso:", body: "Datos sobre cómo interactúas con nuestro Servicio, incluyendo registros de acceso, páginas visitadas y características utilizadas." },
      { emphasis: "Información técnica:", body: "Dirección IP, tipo de navegador, proveedor de servicios de Internet, identificadores de dispositivos y datos de ubicación general." },
      { emphasis: "Datos empresariales:", body: "Información que ingresas sobre tu empresa, clientes, proveedores y transacciones como parte del uso normal del Servicio." },
    ],
  },
  {
    title: "3. Cómo Usamos tu Información",
    intro: "Utilizamos la información que recopilamos para:",
    list: [
      "Proporcionar, mantener y mejorar nuestro Servicio",
      "Procesar tus transacciones y gestionar tu cuenta",
      "Enviarte notificaciones técnicas, actualizaciones y mensajes de soporte",
      "Responder a tus comentarios, preguntas y solicitudes",
      "Detectar, investigar y prevenir actividades fraudulentas y accesos no autorizados",
      "Personalizar y mejorar tu experiencia con nuestro Servicio",
      "Cumplir con obligaciones legales y normativas aplicables",
    ],
  },
  {
    title: "4. Compartición de Información",
    intro: "Podemos compartir tu información personal en las siguientes circunstancias:",
    list: [
      { emphasis: "Con proveedores de servicios:", body: "Compartimos información con terceros que nos ayudan a operar, proporcionar y mejorar nuestro Servicio (como procesadores de pago, servicios de alojamiento y análisis)." },
      { emphasis: "Para cumplir con la ley:", body: "Podemos divulgar información si creemos de buena fe que es necesario para cumplir con la ley, reglamentos, procesos legales o solicitudes gubernamentales." },
      { emphasis: "En caso de reorganización empresarial:", body: "Si nos involucramos en una fusión, adquisición o venta de activos, tu información puede ser transferida como parte de esa transacción." },
      { emphasis: "Con tu consentimiento:", body: "Podemos compartir información con terceros cuando nos das tu consentimiento para hacerlo." },
    ],
  },
  {
    title: "5. Seguridad de Datos",
    body: "Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger tus datos personales contra pérdida accidental, acceso no autorizado, divulgación o alteración. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar la seguridad absoluta de tu información.",
  },
  {
    title: "6. Retención de Datos",
    body: "Conservamos tu información personal solo durante el tiempo necesario para los fines establecidos en esta Política de Privacidad, a menos que se requiera o permita un período de retención más largo por ley.",
  },
  {
    title: "7. Tus Derechos",
    intro: "Dependiendo de tu ubicación, puedes tener ciertos derechos relacionados con tus datos personales, como:",
    list: [
      "Acceder a los datos personales que tenemos sobre ti",
      "Corregir datos inexactos o incompletos",
      "Solicitar la eliminación de tus datos personales",
      "Oponerte al procesamiento de tus datos personales",
      "Solicitar la restricción del procesamiento de tus datos personales",
      "Solicitar la portabilidad de tus datos personales",
    ],
    outro:
      "Para ejercer estos derechos, por favor contáctanos utilizando la información proporcionada al final de esta Política de Privacidad.",
  },
  {
    title: "8. Cookies y Tecnologías Similares",
    body: "Utilizamos cookies y tecnologías de seguimiento similares para recopilar y almacenar información cuando visitas nuestro Servicio. Puedes configurar tu navegador para rechazar todas las cookies o para indicar cuándo se está enviando una cookie. Sin embargo, si no aceptas cookies, es posible que no puedas utilizar algunas partes de nuestro Servicio.",
  },
  {
    title: "9. Cambios a esta Política de Privacidad",
    body: "Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos publicando la nueva Política de Privacidad en esta página y/o enviándote una notificación. Te recomendamos revisar esta Política de Privacidad periódicamente para conocer cualquier cambio.",
  },
  {
    title: "10. Contacto",
    body: "Si tienes preguntas sobre esta Política de Privacidad, por favor contáctanos a través de [dirección de correo electrónico].",
  },
];

const PrivacyPage = () => {
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
          title="Política de Privacidad"
          description="Última actualización: 28 de febrero de 2025"
          className="mb-10"
        />

        <article className="space-y-8 text-[14px] text-fg-secondary leading-relaxed">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-[17px] font-heading text-fg">{section.title}</h2>
              {section.intro && <p>{section.intro}</p>}
              {section.body && <p>{section.body}</p>}
              {section.list && (
                <ul className="list-disc pl-6 space-y-1.5 marker:text-fg-muted">
                  {section.list.map((item, i) =>
                    typeof item === "string" ? (
                      <li key={i}>{item}</li>
                    ) : (
                      <li key={i}>
                        <span className="font-medium text-fg">{item.emphasis}</span> {item.body}
                      </li>
                    )
                  )}
                </ul>
              )}
              {section.outro && <p>{section.outro}</p>}
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

export default PrivacyPage;
