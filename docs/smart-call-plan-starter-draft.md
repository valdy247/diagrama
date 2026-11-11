# VMV Business · Smart Call — catálogo de planes en preparación

Fecha: 11 de noviembre de 2026.

## Starter (primera definición de producto)
- **150 minutos de llamadas nacionales** por período del plan. Las llamadas normales y las traducidas son servicios distintos.
- **20 minutos de interpretación** inglés ↔ español en el catálogo piloto actual.
- Número de negocio VMV, historial y agenda de contactos.
- **Precio mensual:** por definir comercialmente.
- **Recarga de minutos nacionales:** cantidad y precio por definir.
- **Límites operativos:** falta definir si los 150 minutos cuentan llamadas entrantes, salientes y cada tramo PSTN; redondeo y vencimiento.

## Pro y Premium
Pendientes de definir y aprobar públicamente, incluyendo minutos nacionales, recargas y precios. La interfaz los presenta como borrador, sin cifras inventadas.

## Estado comercial y técnico
Página web bilingüe: /es/planes/ y /plans/. Está marcada "noindex" y no contiene Checkout; sirve como borrador visible durante preparación comercial.

**Advertencia interna:** El backend de llamadas normales en smartjob todavía no posee un contador separado ni descuenta 150 minutos. No anunciar este límite como activo ni contratar suscripciones reales hasta que haya facturación y límite nacional verificado. El saldo actual de traducción es independiente. El historial no equivale a un saldo nacional restante.

Cuando aprobemos precios, período, duración y reglas, implementar el contador/recargas nacionales con ledger transaccional, pruebas de redondeo y de llamadas simultáneas y validación Stripe antes de retirar el aviso de preparación.
