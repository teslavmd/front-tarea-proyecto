# Especificación de Requerimientos: Feature de Tareas

## 1. Contexto y Modelado de UI
La feature de tareas (Tasks) se implementó utilizando un patrón **Master-Detail inline**. En lugar de requerir navegación hacia una nueva ruta, la grilla de tareas se inyecta directamente dentro de la vista de detalle del Proyecto (`ProjectDetailComponent`). Esto mejora significativamente la UX (estilo Jira/Trello) manteniendo el contexto del proyecto padre.

## 2. Contrato de API Consumido
Se consumen los endpoints anidados definidos en la especificación: 

* La API_URL de environment contiente el prefijo base `/api/v1` por lo tanto, las construcciones del servicio (`${apiUrl}/projects/...`) mapean exactamente a los siguientes endpoints del backend:

* `GET /api/v1/projects/{projectId}/tasks`: Obtiene la colección de tareas del proyecto.
* `POST /api/v1/projects/{projectId}/tasks`: Crea una nueva tarea (Payload: `CreateTaskRequestDTO`).
* `POST /api/v1/projects/{projectId}/tasks/{taskId}/status`: Muta el estado de la tarea (Payload: `{ "newStatus": "DONE" }`).


## 3. Criterios de Aceptación (BDD)

**Escenario 1: Listado de tareas y estados vacíos**
**Dado** que el usuario navega a la vista de detalle de un proyecto
**Cuando** el componente `TaskListComponent` finaliza la petición HTTP
**Entonces** la UI oculta el loader
**Y** renderiza la tabla de tareas
**Y** muestra un estado vacío (Empty State) si no hay registros

**Escenario 2: Alta exitosa de tarea (Flujo Feliz)**
**Dado** que el usuario visualiza un proyecto en estado `ACTIVE` o `PLANNED`
**Y** abre el modal de "Nueva Tarea"
**Cuando** completa el formulario con datos válidos
**Y** presiona el botón de guardar
**Entonces** el sistema persiste la tarea
**Y** el modal se cierra automáticamente
**Y** la tabla se recarga asíncronamente mostrando el nuevo registro

**Escenario 3: Prevención de mutación en Proyectos Cerrados**
**Dado** que el usuario visualiza el detalle de un proyecto
**Y** el estado del proyecto es `CLOSED`
**Cuando** la UI renderiza el listado de tareas
**Entonces** el botón "Nueva Tarea" se muestra deshabilitado
**Y** se impide abrir el formulario de creación

**Escenario 4: Manejo de error 400 Bad Request (Validación de datos)**
**Dado** que el usuario tiene abierto el modal de "Nueva Tarea"
**Cuando** ingresa un título con menos de 3 caracteres o horas estimadas en 0
**Y** presiona el botón de guardar
**Entonces** el backend rechaza la petición con un error HTTP 400
**Y** la UI renderiza un banner rojo de error
**Y** el modal se mantiene abierto para su corrección

**Escenario 5: Manejo de error 409 Conflict (Regla de negocio)**
**Dado** que el usuario tiene abierto el modal de "Nueva Tarea"
**Cuando** el backend rechaza la creación por regla de negocio devolviendo HTTP 409
**Entonces** el modal captura el error
**Y** renderiza un banner rojo con el mensaje exacto de la excepción de dominio
**Y** el modal se mantiene abierto

**Escenario 6: Cambio de estado de una tarea**
**Dado** que el usuario presiona "Cambiar Estado" en una fila de la grilla
**Cuando** selecciona un nuevo estado válido en el modal
**Y** confirma la acción
**Entonces** la API procesa la mutación HTTP exitosamente
**Y** el modal se cierra
**Y** la grilla se actualiza mostrando el chip con el nuevo color correspondiente

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

1. **Error NG0100 (ExpressionChangedAfterItHasBeenCheckedError):** Al cerrar el modal de creación exitosa, Angular detectaba un cambio abrupto en la variable `isLoading`. Siguiendo el feedback del Code Review, se eliminó el workaround del `setTimeout()` y se atacó el problema de origen: se borró la mutación innecesaria de la variable de estado (`this.isLoading = false`) justo antes de la destrucción del componente por el cierre del `MatDialogRef`.
1. **Error 403 Forbidden y Cierre de Sesión:** Al integrar el GET de tareas, el `jwt.interceptor` forzaba deslogueos. Se determinó que el backend estaba correctamente configurado en `SecurityConfig`, y el error se debía a la expiración natural del token JWT en el entorno de desarrollo.
2. **Excepción Spring Data JPA (IncorrectResultSizeDataAccessException):** Al listar tareas de un proyecto con múltiples registros, el backend lanzó error 500 porque el `TaskJpaRepository` estaba tipado para retornar un `Optional<TaskEntity>`. Se refactorizó la interfaz y el adaptador para que retornen explícitamente un `List<TaskEntity>`, resolviendo el conflicto.

---
## 6. Registro de Prompts (Ingeniería de Prompts y SDD Log)

A continuación se documentan las instrucciones técnicas y el contexto provisto al asistente de IA para la generación y depuración de la feature:

**Iteración 1: Estructura de Dominio y Servicios**
* **Prompt :** *"Actúa como un desarrollador Angular Senior. Basado en el esquema relacional del dominio de tareas, genera las interfaces TypeScript (TaskResponseDTO, CreateTaskRequestDTO) tipando estrictamente los estados (TODO, IN_PROGRESS, DONE). Además, crea el TaskService utilizando la inyección moderna (`inject()`) de HttpClient para consumir el endpoint GET `/api/v1/projects/{projectId}/tasks`."*

**Iteración 2: Maquetado del Listado (Master-Detail)**
* **Prompt :** *"Genera un componente standalone `TaskListComponent` utilizando Angular Material (`MatTable`). Debe implementar el patrón Master-Detail recibiendo el `projectId` como `@Input()` desde el componente padre y delegar la carga reactiva de datos al `TaskService`."*

**Iteración 3: Definición Arquitectónica de Módulos (DDD)**
* **Prompt :** *"Aplicando principios de Clean Architecture y Domain-Driven Design para el frontend, define la estructura de carpetas óptima para el módulo de tareas. Justifica si el `TaskListComponent` debe alojarse dentro del feature de proyectos o tener su propio feature aislado."*
* 

**Iteración 4: Componente de Creación con Validaciones**
* **Prompt :** *"Genera el componente `TaskCreateDialogComponent` utilizando `MatDialog` y `ReactiveFormsModule`. Implementa las siguientes reglas de negocio en el formulario: campo título obligatorio (mínimo 3 caracteres) y horas estimadas con valor mínimo de 1. Maneja el estado de carga (`isLoading`) durante la petición HTTP."*


**Iteración 5: Bugfix Backend - Spring Data JPA (Cardinalidad)**
* **Prompt :** *"Analiza la siguiente excepción en el backend de Spring Boot: `IncorrectResultSizeDataAccessException: Query did not return a unique result: 2 results were returned`. Se adjunta el código del Controller y el UseCase. Identifica el error de cardinalidad en el adaptador de persistencia y proporciona la firma correcta para la interfaz `TaskJpaRepository`."*

**Iteración 6: Mutación de Estado**
* **Prompt :** *"Implementa el componente `TaskChangeStatusDialogComponent`. Utiliza el inyector `MAT_DIALOG_DATA` para recibir el objeto de la tarea y preseleccionar su estado actual en un `mat-select`. Implementa la llamada al endpoint de mutación de estado y actualiza la UI de forma asíncrona al confirmar."*