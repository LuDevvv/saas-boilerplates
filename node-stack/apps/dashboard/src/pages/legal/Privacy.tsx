import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => {
  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 sm:py-16 lg:py-24">
        <div className="mb-8">
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center text-blue-600 transition-all duration-200 hover:text-blue-700 focus:text-blue-700 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al registro
          </Link>
        </div>

        <h1 className="text-3xl font-heading leading-tight text-black sm:text-4xl mb-6">
          Política de Privacidad
        </h1>

        <div className="space-y-6 text-gray-600">
          <p>Última actualización: 28 de febrero de 2025</p>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              1. Introducción
            </h2>
            <p>
              Esta Política de Privacidad describe cómo recopilamos, usamos y
              compartimos tu información personal cuando utilizas nuestra
              plataforma de gestión empresarial (el "Servicio"). Respetamos tu
              privacidad y estamos comprometidos a proteger tus datos
              personales.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              2. Información que Recopilamos
            </h2>
            <p>Recopilamos varios tipos de información, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-label text-gray-800">
                  Información de registro:
                </span>{" "}
                Nombre, apellido, dirección de correo electrónico y contraseña
                cuando creas una cuenta.
              </li>
              <li>
                <span className="font-label text-gray-800">
                  Información de perfil:
                </span>{" "}
                Información adicional que proporcionas al completar tu perfil,
                como tu cargo, empresa y foto de perfil.
              </li>
              <li>
                <span className="font-label text-gray-800">
                  Información de uso:
                </span>{" "}
                Datos sobre cómo interactúas con nuestro Servicio, incluyendo
                registros de acceso, páginas visitadas y características
                utilizadas.
              </li>
              <li>
                <span className="font-label text-gray-800">
                  Información técnica:
                </span>{" "}
                Dirección IP, tipo de navegador, proveedor de servicios de
                Internet, identificadores de dispositivos y datos de ubicación
                general.
              </li>
              <li>
                <span className="font-label text-gray-800">
                  Datos empresariales:
                </span>{" "}
                Información que ingresas sobre tu empresa, clientes, proveedores
                y transacciones como parte del uso normal del Servicio.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              3. Cómo Usamos tu Información
            </h2>
            <p>Utilizamos la información que recopilamos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestro Servicio</li>
              <li>Procesar tus transacciones y gestionar tu cuenta</li>
              <li>
                Enviarte notificaciones técnicas, actualizaciones y mensajes de
                soporte
              </li>
              <li>Responder a tus comentarios, preguntas y solicitudes</li>
              <li>
                Detectar, investigar y prevenir actividades fraudulentas y
                accesos no autorizados
              </li>
              <li>
                Personalizar y mejorar tu experiencia con nuestro Servicio
              </li>
              <li>Cumplir con obligaciones legales y normativas aplicables</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              4. Compartición de Información
            </h2>
            <p>
              Podemos compartir tu información personal en las siguientes
              circunstancias:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-label text-gray-800">
                  Con proveedores de servicios:
                </span>{" "}
                Compartimos información con terceros que nos ayudan a operar,
                proporcionar y mejorar nuestro Servicio (como procesadores de
                pago, servicios de alojamiento y análisis).
              </li>
              <li>
                <span className="font-label text-gray-800">
                  Para cumplir con la ley:
                </span>{" "}
                Podemos divulgar información si creemos de buena fe que es
                necesario para cumplir con la ley, reglamentos, procesos legales
                o solicitudes gubernamentales.
              </li>
              <li>
                <span className="font-label text-gray-800">
                  En caso de reorganización empresarial:
                </span>{" "}
                Si nos involucramos en una fusión, adquisición o venta de
                activos, tu información puede ser transferida como parte de esa
                transacción.
              </li>
              <li>
                <span className="font-label text-gray-800">
                  Con tu consentimiento:
                </span>{" "}
                Podemos compartir información con terceros cuando nos das tu
                consentimiento para hacerlo.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              5. Seguridad de Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas
              diseñadas para proteger tus datos personales contra pérdida
              accidental, acceso no autorizado, divulgación o alteración. Sin
              embargo, ningún sistema es completamente seguro, y no podemos
              garantizar la seguridad absoluta de tu información.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              6. Retención de Datos
            </h2>
            <p>
              Conservamos tu información personal solo durante el tiempo
              necesario para los fines establecidos en esta Política de
              Privacidad, a menos que se requiera o permita un período de
              retención más largo por ley.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              7. Tus Derechos
            </h2>
            <p>
              Dependiendo de tu ubicación, puedes tener ciertos derechos
              relacionados con tus datos personales, como:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a los datos personales que tenemos sobre ti</li>
              <li>Corregir datos inexactos o incompletos</li>
              <li>Solicitar la eliminación de tus datos personales</li>
              <li>Oponerte al procesamiento de tus datos personales</li>
              <li>
                Solicitar la restricción del procesamiento de tus datos
                personales
              </li>
              <li>Solicitar la portabilidad de tus datos personales</li>
            </ul>
            <p>
              Para ejercer estos derechos, por favor contáctanos utilizando la
              información proporcionada al final de esta Política de Privacidad.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              8. Cookies y Tecnologías Similares
            </h2>
            <p>
              Utilizamos cookies y tecnologías de seguimiento similares para
              recopilar y almacenar información cuando visitas nuestro Servicio.
              Puedes configurar tu navegador para rechazar todas las cookies o
              para indicar cuándo se está enviando una cookie. Sin embargo, si
              no aceptas cookies, es posible que no puedas utilizar algunas
              partes de nuestro Servicio.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              9. Cambios a esta Política de Privacidad
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Te
              notificaremos sobre cambios significativos publicando la nueva
              Política de Privacidad en esta página y/o enviándote una
              notificación. Te recomendamos revisar esta Política de Privacidad
              periódicamente para conocer cualquier cambio.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">10. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad, por favor
              contáctanos a través de [dirección de correo electrónico].
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center justify-center px-4 py-3 text-base font-heading text-white transition-all duration-200 border border-transparent rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 focus:outline-none hover:opacity-90 focus:opacity-90"
          >
            Volver al registro
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPage;
