import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Cliente {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  nie_pasaporte: string;
}

interface Expediente {
  numero_expediente: string;
  tipo_tramite: string;
  fecha_inicio: string;
  precio_acordado: number;
}

interface Pago {
  fecha_pago: string;
  importe: number;
  metodo_pago: string;
  concepto: string;
}

interface Totales {
  precioAcordado: number;
  totalPagado: number;
  pendiente: number;
  estePago: number;
}

interface ReciboData {
  numeroRecibo: string;
  cliente: Cliente;
  expediente: Expediente;
  pago: Pago;
  totales: Totales;
}

export function downloadRecibo(data: ReciboData) {
  const { numeroRecibo, cliente, expediente, pago, totales } = data;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recibo #${numeroRecibo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #333;
        }
        .recibo-numero {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-label {
          font-weight: bold;
          width: 180px;
          color: #555;
        }
        .info-value {
          flex: 1;
          color: #333;
        }
        .totales {
          margin-top: 30px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
        }
        .total-row.destacado {
          font-weight: bold;
          font-size: 18px;
          color: #2563eb;
          border-top: 2px solid #ddd;
          padding-top: 15px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>RECIBO DE PAGO</h1>
        <div class="recibo-numero">Recibo Nº ${numeroRecibo}</div>
        <div class="recibo-numero">Fecha de emisión: ${format(new Date(), "PPP", { locale: es })}</div>
      </div>

      <div class="section">
        <div class="section-title">Datos del Cliente</div>
        <div class="info-row">
          <div class="info-label">Nombre completo:</div>
          <div class="info-value">${cliente.apellidos}, ${cliente.nombre}</div>
        </div>
        <div class="info-row">
          <div class="info-label">NIE/Pasaporte:</div>
          <div class="info-value">${cliente.nie_pasaporte}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value">${cliente.email}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Teléfono:</div>
          <div class="info-value">${cliente.telefono}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Datos del Expediente</div>
        <div class="info-row">
          <div class="info-label">Nº Expediente:</div>
          <div class="info-value">${expediente.numero_expediente}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Tipo de Trámite:</div>
          <div class="info-value">${expediente.tipo_tramite}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Fecha de Inicio:</div>
          <div class="info-value">${format(new Date(expediente.fecha_inicio), "PPP", { locale: es })}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Detalles del Pago</div>
        <div class="info-row">
          <div class="info-label">Fecha de Pago:</div>
          <div class="info-value">${format(new Date(pago.fecha_pago), "PPP", { locale: es })}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Concepto:</div>
          <div class="info-value">${pago.concepto}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Método de Pago:</div>
          <div class="info-value">${pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1)}</div>
        </div>
      </div>

      <div class="totales">
        <div class="total-row">
          <span>Precio Acordado:</span>
          <span>${totales.precioAcordado.toFixed(2)}€</span>
        </div>
        <div class="total-row">
          <span>Total Pagado Anteriormente:</span>
          <span>${(totales.totalPagado - totales.estePago).toFixed(2)}€</span>
        </div>
        <div class="total-row destacado">
          <span>Este Pago:</span>
          <span>${totales.estePago.toFixed(2)}€</span>
        </div>
        <div class="total-row">
          <span>Total Pagado:</span>
          <span>${totales.totalPagado.toFixed(2)}€</span>
        </div>
        <div class="total-row">
          <span>Pendiente:</span>
          <span>${totales.pendiente.toFixed(2)}€</span>
        </div>
      </div>

      <div class="footer">
        <p>Este documento es un recibo de pago generado automáticamente.</p>
        <p>Para cualquier consulta, por favor contacte con nuestra gestoría.</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
