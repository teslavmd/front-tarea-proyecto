# Especificación de Requerimientos: Feature de Tareas

## 1. Contexto y Modelado de UI
La feature de tareas (Tasks) se implementó utilizando un patrón **Master-Detail inline**. En lugar de requerir navegación hacia una nueva ruta, la grilla de tareas se inyecta directamente dentro de la vista de detalle del Proyecto (`ProjectDetailComponent`). Esto mejora significativamente la UX (estilo Jira/Trello) manteniendo el contexto del proyecto padre.

## 2. Contrato de API Consumido
Se consumen los endpoints anidados definidos en la especificación: 

* `GET /api/v1/projects/{projectId}/tasks`: Obtiene la colección de tareas del proyecto.
* `POST /api/v1/projects/{projectId}/tasks`: Crea una nueva tarea (Payload: `CreateTaskRequestDTO`).
* `POST /api/v1/projects/{projectId}/tasks/{taskId}/status`: Muta el estado de la tarea (Payload: `{ "newStatus": "DONE" }`).

## 3. Criterios de Aceptación (BDD)

**Escenario 1: Listado de tareas y estados vacíos**
* **Given** que el usuario navega a la vista de detalle de un proyecto.
* **When** el componente `TaskListComponent` finaliza la petición HTTP inicial.
* **Then** la UI oculta el loader y renderiza la tabla de tareas con sus columnas (Título, Responsable, Horas, Estado y Acciones). Si el proyecto no tiene tareas, se muestra un *Empty State* con un icono indicativo y un mensaje de que no hay registros.

**Escenario 2: Alta exitosa de tarea (Flujo Feliz)**
* **Given** que el usuario visualiza un proyecto en estado `ACTIVE` o `PLANNED` y presiona "Nueva Tarea".
* **When** completa el formulario del modal con un título válido (mínimo 3 caracteres), horas estimadas (>0) y presiona "Guardar".
* **Then** el botón muestra un estado de carga, el sistema persiste la tarea, el modal se cierra automáticamente y la tabla de tareas se recarga de forma asíncrona reflejando el nuevo registro.

**Escenario 3: Prevención de mutación en Proyectos Cerrados (Regla de Negocio)**
* **Given** que el usuario navega al detalle de un proyecto cuyo estado es `CLOSED`.
* **When** la UI renderiza el componente de lista de tareas.
* **Then** el botón "Nueva Tarea" se presenta en estado deshabilitado (`disabled`), impidiendo abrir el formulario de creación.

**Escenario 4: Manejo de error 409 Conflict al crear tarea**
* **Given** que el usuario tiene abierto el modal de "Nueva Tarea".
* **When** el backend rechaza la creación por una violación de regla de negocio (ej. el proyecto se cerró concurrentemente) retornando un `409 Conflict`.
* **Then** el modal captura el error y renderiza un banner rojo (`error-banner`) mostrando el mensaje exacto devuelto por la excepción de dominio del servidor (ej. *"No se puede agregar tareas a un proyecto CLOSED"*), manteniendo el modal abierto para que el usuario lea el motivo.

**Escenario 5: Cambio de estado de una tarea**
* **Given** que el usuario presiona el botón de "Cambiar Estado" en la fila de una tarea específica de la grilla.
* **When** selecciona un nuevo estado (ej. `DONE`) en el modal y confirma la acción.
* **Then** el sistema ejecuta el endpoint de mutación de estado devolviendo un código 200, el modal se cierra, y la grilla se actualiza mostrando el chip de la tarea con el nuevo color correspondiente (verde para `DONE`).

---

## 4. Lineamientos de Diseño Visual (UI/UX)
* **Framework:** Angular Material (MDC-based) + Standalone Components.
* **Modales:** La creación y actualización se resuelven mediante `MatDialog` para no perder el contexto de la lista.
* **Indicadores de Estado (Chips):** Los estados de la tarea heredan las variables globales de UI definidas en `styles.scss` (para evitar el uso de `::ng-deep`), compartiendo paleta con los proyectos:
  * `TODO`: Fondo Naranja claro, Texto Naranja oscuro.
  * `IN_PROGRESS`: Fondo Azul claro, Texto Azul oscuro.
  * `DONE`: Fondo Verde claro, Texto Verde oscuro.

---

## 5. Notas Técnicas y Resolución de Problemas (Debugging)
Durante el ciclo de desarrollo de esta feature se detectaron y resolvieron los siguientes incidentes técnicos:

1. **Error NG0100 (ExpressionChangedAfterItHasBeenCheckedError):** Al cerrar el modal de creación exitosa, Angular detectaba un cambio abrupto en la variable `isLoading`. Se solucionó eliminando la asignación `false` previa al cierre del `MatDialogRef` y envolviendo la recarga de la grilla en un `setTimeout()` macro-task.
2. **Error 403 Forbidden y Cierre de Sesión:** Al integrar el GET de tareas, el `jwt.interceptor` forzaba deslogueos. Se determinó que el backend estaba correctamente configurado en `SecurityConfig`, y el error se debía a la expiración natural del token JWT en el entorno de desarrollo.
3. **Excepción Spring Data JPA (IncorrectResultSizeDataAccessException):** Al listar tareas de un proyecto con múltiples registros, el backend lanzó error 500 porque el `TaskJpaRepository` estaba tipado para retornar un `Optional<TaskEntity>`. Se refactorizó la interfaz y el adaptador para que retornen explícitamente un `List<TaskEntity>`, resolviendo el conflicto.

---

## 6. Registro de Prompts (SDD Log)

* **Iteración 1:** Toma de decisión arquitectónica. Se optó por la Opción B (Master-Detail en una pantalla). Se generaron los modelos de DTO y el `TaskService`.
* **Iteración 2:** Análisis de endpoints faltantes. Se detectó la ausencia del método `GET` general de tareas en el `TaskController` de Spring Boot y se implementó.
* **Iteración 3:** Construcción del `TaskListComponent`. Se armó la UI con la tabla de Angular Material (`MatTable`) inyectada en el `ProjectDetailComponent`.
* **Iteración 4:** Construcción del modal `TaskCreateDialogComponent`. Se integró `ReactiveFormsModule` con validadores y se atajó el error de UI al intentar guardar en un proyecto `CLOSED`. Se implementó el `@Input` para deshabilitar el botón proactivamente.
* **Iteración 5:** Debugging Full-stack. Se solucionaron los errores de JWT, el NG0100 de Change Detection, y el error de cardinalidad de Spring Data JPA.
* **Iteración 6:** Construcción del modal `TaskChangeStatusDialogComponent`. Implementación final del cambio de estados inyectando la información de la tarea por `MAT_DIALOG_DATA`.