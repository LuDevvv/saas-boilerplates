import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
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
          Términos y Condiciones
        </h1>

        <div className="space-y-6 text-gray-600">
          <p>Última actualización: 28 de febrero de 2025</p>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              1. Introducción
            </h2>
            <p>
              Estos Términos y Condiciones ("Términos") rigen el uso de nuestra
              plataforma de gestión empresarial (el "Servicio"). Al registrarte
              y utilizar nuestro Servicio, aceptas estos Términos en su
              totalidad. Si no estás de acuerdo con estos Términos, por favor no
              utilices nuestro Servicio.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              2. Registro y Cuentas
            </h2>
            <p>
              Para utilizar nuestro Servicio, debes registrarte y crear una
              cuenta. Eres responsable de mantener la confidencialidad de tus
              credenciales de acceso y de todas las actividades que ocurran bajo
              tu cuenta. Debes proporcionar información precisa y completa
              durante el proceso de registro y mantenerla actualizada.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              3. Uso del Servicio
            </h2>
            <p>
              Nuestro Servicio está diseñado para ayudarte a gestionar tu
              empresa. Te otorgamos una licencia limitada, no exclusiva y no
              transferible para utilizar el Servicio de acuerdo con estos
              Términos. No debes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Utilizar el Servicio de manera ilegal o para fines no
                autorizados
              </li>
              <li>Intentar acceder a áreas restringidas del Servicio</li>
              <li>Interferir con el funcionamiento normal del Servicio</li>
              <li>
                Realizar ingeniería inversa o descompilar cualquier parte del
                Servicio
              </li>
              <li>
                Vender, sublicenciar o transferir tus derechos bajo estos
                Términos
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              4. Contenido del Usuario
            </h2>
            <p>
              Al cargar contenido a nuestro Servicio, nos otorgas una licencia
              mundial, no exclusiva, libre de regalías para usar, reproducir y
              procesar dicho contenido únicamente con el propósito de
              proporcionar y mejorar el Servicio. Mantienes todos los derechos
              sobre tu contenido, pero eres responsable de asegurarte de que
              tienes los derechos necesarios para otorgarnos esta licencia.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              5. Pagos y Facturación
            </h2>
            <p>
              Algunos aspectos de nuestro Servicio pueden requerir pago. Los
              detalles de nuestros planes y precios están disponibles en nuestra
              plataforma. Todos los pagos son no reembolsables a menos que se
              indique lo contrario. Nos reservamos el derecho de cambiar
              nuestros precios en cualquier momento, pero te notificaremos con
              antelación sobre cualquier cambio que afecte tu suscripción
              actual.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              6. Cancelación y Terminación
            </h2>
            <p>
              Puedes cancelar tu cuenta en cualquier momento. Nos reservamos el
              derecho de suspender o terminar tu acceso al Servicio si violas
              estos Términos o si tu uso del Servicio presenta un riesgo de daño
              legal para nosotros o para otros usuarios.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              7. Limitación de Responsabilidad
            </h2>
            <p>
              En la medida permitida por la ley, no seremos responsables por
              daños indirectos, incidentales, especiales, consecuentes o
              punitivos, o por pérdida de beneficios, ingresos, datos o uso,
              incurridos por ti o por terceros, ya sea en una acción contractual
              o extracontractual, incluso si hemos sido advertidos de la
              posibilidad de tales daños.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              8. Cambios en los Términos
            </h2>
            <p>
              Podemos modificar estos Términos en cualquier momento. Te
              notificaremos sobre cambios significativos a través de un aviso en
              nuestro Servicio o por correo electrónico. El uso continuado del
              Servicio después de tales cambios constituye tu aceptación de los
              nuevos Términos.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">
              9. Ley Aplicable
            </h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes
              de [País/Región], sin tener en cuenta sus disposiciones sobre
              conflictos de leyes. Cualquier disputa que surja en relación con
              estos Términos estará sujeta a la jurisdicción exclusiva de los
              tribunales de [Ciudad, País/Región].
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-black">10. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos Términos, por favor contáctanos a
              través de [dirección de correo electrónico].
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

export default TermsPage;
