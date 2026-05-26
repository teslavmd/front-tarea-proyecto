# Especificación de Requerimientos: Feature de Proyectos

## 1. Contexto y Modelado de Datos
La feature de proyectos permite la creación, consulta y actualización de estado de los proyectos. Siguiendo Clean Architecture, el frontend actúa consumiendo los adaptadores de entrada (DTOs) de la API REST sin conocimiento de la capa de infraestructura o dominio interno de Spring Boot. Se implementó un flujo respetando la segregación de responsabilidades, adoptando un enfoque CQRS (Command Query Responsibility Segregation) en el backend para optimizar lecturas (Queries) y proteger las reglas de negocio estrictas durante la creación (Commands).

## 2. Arquitectura Frontend (Angular)
El cliente se estructuró bajo el patrón de componentes Standalone (Angular 15+) y pautas estrictas de UI:
* **Control Flow Nativo:** Uso de la sintaxis moderna `@if` y `@for` introducida en Angular 17+.
* **Gestión de Estado y UX:** Uso estratégico de `ChangeDetectorRef` y macro-tareas (`setTimeout`) para forzar la actualización del DOM en resoluciones asíncronas, evitando errores de Change Detection (`NG0100`).

## 3. Contrato de API Consumido
* `GET /api/v1/projects`: Consulta general (implementada vía Proyección de Base de Datos para evitar reconstitución de dominio).
* `POST /api/v1/projects`: Alta de proyecto (valida invariante temporal de `endDate >= LocalDate.now()`).
* `GET /api/v1/projects/{id}`: Consulta de detalle de entidad.
* `POST /api/v1/projects/{id}/status`: Mutación aislada del estado operativo.


## 4. Criterios de Aceptación (BDD — Given/When/Then)

**Escenario 1: Alta exitosa de proyecto (Flujo Feliz)**
* **Given** que el usuario se encuentra en el formulario `/projects/new` y ha completado todos los campos obligatorios con fechas válidas.
* **When** hace clic en el botón de guardar.
* **Then** el sistema persiste el proyecto, muestra un mensaje de éxito en pantalla y redirige al usuario al listado general de proyectos.

**Escenario 2: Alta de proyecto con fechas inválidas (Flujo de Error)**
* **Given** que el usuario se encuentra en el formulario `/projects/new`.
* **When** ingresa una fecha de finalización (`endDate`) menor a la fecha actual y envía el formulario.
* **Then** la UI captura el error HTTP 400 Bad Request, detiene la operación y muestra un mensaje de error inline indicando que la fecha debe ser igual o posterior a hoy.

**Escenario 3: Visualización de datos históricos**
* **Given** que el sistema contiene proyectos con fechas de finalización vencidas.
* **When** el usuario navega a la ruta `/projects`.
* **Then** la grilla renderiza todos los proyectos exitosamente, omitiendo la validación temporal de dominio gracias a la proyección CQRS de lectura.

**Escenario 4: Cambio de Estado mediante Modal**
* **Given** que el usuario visualiza la tabla en `/projects`.
* **When** presiona el botón "Cambiar Estado", selecciona un nuevo estado en el diálogo modal y confirma.
* **Then** el botón de guardar se deshabilita mostrando un estado de carga (spinner), se ejecuta la mutación HTTP, y al finalizar con éxito, el modal se cierra desencadenando la recarga asíncrona de la tabla principal sin errores de Change Detection.

---

## 5. Lineamientos de Diseño Visual (UI/UX)
Para mantener la coherencia visual con el resto de la aplicación, el desarrollo de esta feature se adhiere a las siguientes convenciones:
* **Framework:** Angular Material (MDC-based).
* **Layout:** Se privilegia el uso de tarjetas (`mat-card`) para formularios y vistas de detalle, y listas interactivas (`mat-list`, `mat-table`) para visualización de colecciones.
* **Indicadores de Estado (Chips):** Los estados de negocio se representan mediante `mat-chip` con la siguiente codificación de colores estándar:
  * `PLANNED` / `PENDING`: Tonos de advertencia suaves (Naranja/Amarillo).
  * `ACTIVE` / `IN_PROGRESS`: Tonos informativos (Azul primario).
  * `CLOSED` / `COMPLETED`: Tonos de éxito (Verde).

## 6. Registro de Prompts (SDD Log)

**Iteración 1: Models y ProjectService**
> Actúa como un desarrollador Senior en Angular. A partir de la firma de mis endpoints en Spring Boot (@PostMapping("/projects") para crear, @GetMapping("/projects/{id}") para consultar, y @PostMapping("/projects/{id}/status") para cambiar estado) y mis DTOs (CreateProjectRequestDTO, ProjectResponseDTO, ChangeProjectStatusRequestDTO), genera las interfaces TypeScript correspondientes y el ProjectService utilizando HttpClient.
* **Implementación:** Creación de DTOs tipados y el servicio inyectable con `inject()`, manejando el tipado estricto de fechas como `string` para su compatibilidad con el `LocalDate` de Spring Boot y aislando la configuración de URL mediante `environment`.

**Iteración 2: Listado y Ajuste de Change Detection**
> Tengo un problema con el spinner, cada vez que hago refresh en la pagina sigue el spinner ahi, aunque hice un console.log(projects) la lista aparece...
* **Implementación:** Diagnóstico y resolución de un desajuste en Zone.js tras la resolución asíncrona de la petición. Se inyectó `ChangeDetectorRef` y se forzó la actualización visual (`detectChanges()`) en el bloque de resolución del suscriptor para garantizar la ocultación del loader de estado.

**Iteración 3: Formulario de Alta y Formateo Temporal**
> Actúa como un desarrollador Senior en Angular. Implementa el ProjectFormComponent para la ruta /projects/new. Requisitos: Uso de Reactive Forms, integración con MatDatepicker...
* **Implementación:** Desarrollo del componente standalone de creación. Se integró una función de parseo para transformar las fechas de formato nativo JS Date a string ISO (`YYYY-MM-DD`), asegurando que el contrato del JSON encaje exactamente con las validaciones de Spring.

**Iteración 4: Detalle del Recurso e Integración Material (MDC)**
> el project detail, no muestra el estado del project, cuando hago console.log(this.project.status) me muestra el estado, pero en el html no lo toma
* **Implementación:** Captura de la ruta síncrona mediante `ActivatedRoute.snapshot`. Se depuró un conflicto de estilos estricto en los componentes MDC de Angular Material, resolviendo la invisibilidad de los componentes `mat-chip` reubicándolos dentro del contenedor autorizado `matListItemMeta`.

**Iteración 5: Diálogo de Estados, CQRS y NG0100**
> Actúa como un desarrollador Senior en Angular. Ya tenemos nuestro CRUD casi listo. Vamos a implementar el ProjectStatusDialogComponent (Paso 5) para cambiar el estado de un proyecto... (y posterior depuración del error 400 y NG0100).
* **Implementación:** Creación de un modal superpuesto que recibe y emite datos vía `MAT_DIALOG_DATA` y `afterClosed()`. A nivel backend, se implementó un refactor arquitectónico adoptando CQRS (Read Projections) para aislar la validación temporal al `CreateProjectUseCase`, permitiendo actualizar proyectos históricos. En el frontend, se resolvió la colisión del ciclo de vida (`ExpressionChangedAfterItHasBeenCheckedError`) encapsulando la directiva de recarga de la grilla en un bloque asíncrono (`setTimeout`).