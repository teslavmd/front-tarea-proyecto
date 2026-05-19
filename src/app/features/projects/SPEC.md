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
* `PUT /api/v1/projects/{id}/status`: Mutación aislada del estado operativo.

## 4. Criterios de Aceptación (BDD)
* **Escenario de Alta:** Dado un usuario en `/projects/new`, cuando envía un proyecto con fechas inválidas (pasadas), entonces el backend frena la operación en el Caso de Uso (POST) devolviendo un 400 Bad Request.
* **Escenario de Consulta Histórica:** Dado un historial de proyectos vencidos, cuando el usuario entra a `/projects`, entonces el sistema recupera la lista exitosamente ignorando la validación temporal, garantizando la visibilidad de datos históricos.
* **Escenario de Mutación:** Dado un usuario en la grilla de proyectos, cuando hace clic en "Cambiar Estado", entonces se despliega un `MatDialog` que inyecta los datos actuales, deshabilita la UI durante la mutación HTTP, y recarga la tabla padre al cerrarse con éxito.

---

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